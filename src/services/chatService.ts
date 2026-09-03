import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot 
} from './firebase';
import { 
  Conversation, 
  ChatMessage, 
  ChatStatus, 
  StudentProfile, 
  PrivacySettings, 
  BlockRecord, 
  UserReport 
} from '../types';
import { followService } from './followService';
import { dataService } from './dataService';

const CONVERSATIONS_COLLECTION = 'conversations';
const REPORTS_COLLECTION = 'reports';
const BLOCKS_STORAGE_PREFIX = 'campusly_blocked_';
const PRIVACY_STORAGE_PREFIX = 'campusly_privacy_';
const LOCAL_CONVERSATIONS_KEY = 'campusly_local_conversations';
const LOCAL_MESSAGES_PREFIX = 'campusly_local_messages_';

export class ChatService {
  private static instance: ChatService;

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  /**
   * Deterministic conversation ID derived from two sorted UIDs
   */
  public getConversationId(uidA: string, uidB: string): string {
    return [uidA, uidB].sort().join('_');
  }

  /**
   * Real-time subscription to a user's conversations
   */
  public subscribeToConversations(
    uid: string,
    onUpdate: (conversations: Conversation[]) => void
  ): () => void {
    if (!uid) {
      onUpdate([]);
      return () => {};
    }

    try {
      const q = query(
        collection(db, CONVERSATIONS_COLLECTION),
        where('participantIds', 'array-contains', uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const conversations: Conversation[] = [];
        snapshot.forEach((docSnap) => {
          conversations.push({ id: docSnap.id, ...docSnap.data() } as Conversation);
        });

        // Filter out conversations deleted by the user
        const visibleConversations = conversations.filter(
          c => !c.deletedFor?.includes(uid)
        );

        // Sort by lastMessageAt descending
        visibleConversations.sort((a, b) => 
          new Date(b.lastMessageAt || b.createdAt).getTime() - 
          new Date(a.lastMessageAt || a.createdAt).getTime()
        );

        // Update local cache
        this.saveLocalConversations(visibleConversations);
        onUpdate(visibleConversations);
      }, (error) => {
        console.warn('Firestore subscribeToConversations fallback:', error);
        onUpdate(this.getLocalConversations(uid));
      });

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscribeToConversations error, using local fallback:', err);
      onUpdate(this.getLocalConversations(uid));
      return () => {};
    }
  }

  /**
   * Real-time subscription to messages inside a specific conversation
   */
  public subscribeToMessages(
    conversationId: string,
    currentUid: string,
    onUpdate: (messages: ChatMessage[]) => void,
    messageLimit: number = 50
  ): () => void {
    if (!conversationId) {
      onUpdate([]);
      return () => {};
    }

    try {
      const q = query(
        collection(db, CONVERSATIONS_COLLECTION, conversationId, 'messages'),
        orderBy('createdAt', 'asc'),
        limit(messageLimit)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages: ChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          messages.push({ id: docSnap.id, ...docSnap.data() } as ChatMessage);
        });

        // Filter out messages deleted for current user
        const visibleMessages = messages.filter(
          m => !m.deletedFor?.includes(currentUid)
        );

        this.saveLocalMessages(conversationId, visibleMessages);
        onUpdate(visibleMessages);
      }, (error) => {
        console.warn('Firestore subscribeToMessages fallback:', error);
        onUpdate(this.getLocalMessages(conversationId, currentUid));
      });

      return unsubscribe;
    } catch (err) {
      console.warn('Firestore subscribeToMessages error:', err);
      onUpdate(this.getLocalMessages(conversationId, currentUid));
      return () => {};
    }
  }

  /**
   * Send message according to Campusly Core Messaging Rules:
   * - If not mutual follow:
   *   - Only ONE initial message request is permitted.
   *   - Subsequent messages are rejected until mutual follow occurs.
   * - If mutual follow:
   *   - Unlimited bilateral messages allowed.
   */
  public async sendMessage(
    sender: StudentProfile,
    receiver: StudentProfile,
    rawText: string
  ): Promise<{ success: boolean; message?: string; error?: string }> {
    const text = rawText?.trim();
    if (!text) {
      return { success: false, error: 'Message cannot be empty.' };
    }
    if (text.length > 2000) {
      return { success: false, error: 'Message exceeds the 2,000 character limit.' };
    }

    const senderId = sender.id;
    const receiverId = receiver.id;
    const conversationId = this.getConversationId(senderId, receiverId);

    // 1. Check if receiver has blocked sender or vice versa
    if (this.isUserBlocked(receiverId, senderId) || this.isUserBlocked(senderId, receiverId)) {
      return { success: false, error: 'Cannot send message. This conversation is blocked.' };
    }

    // 2. Check relationship: is there a mutual follow?
    const isMutual = await followService.checkMutualFollow(senderId, receiverId);

    // 3. Check existing conversation state
    const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    let existingConv: Conversation | null = null;

    try {
      const snap = await getDoc(convRef);
      if (snap.exists()) {
        existingConv = snap.data() as Conversation;
      }
    } catch {
      existingConv = this.getLocalConversationById(conversationId);
    }

    // 4. Enforce 1-message rule for non-mutual follow
    if (!isMutual) {
      if (existingConv && existingConv.chatStatus === 'REQUESTED' && existingConv.initiatedBy === senderId) {
        return {
          success: false,
          error: `Message request pending. You can send unlimited messages once ${receiver.name} follows you back.`
        };
      }

      if (existingConv && existingConv.chatStatus === 'IGNORED' && existingConv.initiatedBy === senderId) {
        return {
          success: false,
          error: `${receiver.name} has not accepted this message request.`
        };
      }
    }

    const now = new Date().toISOString();
    const chatStatus: ChatStatus = isMutual ? 'UNLOCKED' : 'REQUESTED';

    const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const chatMessage: ChatMessage = {
      id: messageId,
      conversationId,
      senderId,
      receiverId,
      text,
      createdAt: now,
      isRead: false,
      messageType: 'text',
      deletedFor: []
    };

    // Calculate unread counts
    const prevUnreads = existingConv?.unreadCounts || { [senderId]: 0, [receiverId]: 0 };
    const newUnreads = {
      ...prevUnreads,
      [senderId]: 0,
      [receiverId]: (prevUnreads[receiverId] || 0) + 1
    };

    const convData: Conversation = {
      id: conversationId,
      participantIds: [senderId, receiverId],
      participantDetails: {
        [senderId]: {
          id: senderId,
          name: sender.name,
          avatar: sender.avatar,
          college: sender.college,
          department: sender.department
        },
        [receiverId]: {
          id: receiverId,
          name: receiver.name,
          avatar: receiver.avatar,
          college: receiver.college,
          department: receiver.department
        }
      },
      chatStatus,
      initiatedBy: existingConv?.initiatedBy || senderId,
      lastMessage: text,
      lastMessageAt: now,
      lastSenderId: senderId,
      unreadCounts: newUnreads,
      createdAt: existingConv?.createdAt || now,
      updatedAt: now,
      deletedFor: []
    };

    // 5. Commit to Firestore
    try {
      await setDoc(convRef, convData, { merge: true });
      const msgRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, 'messages', messageId);
      await setDoc(msgRef, chatMessage);

      // Notification to receiver
      if (chatStatus === 'REQUESTED') {
        dataService.addNotification({
          studentId: receiverId,
          title: 'New Message Request ✉️',
          message: `${sender.name} sent you a message request: "${text.slice(0, 45)}${text.length > 45 ? '...' : ''}"`,
          link: `/messages/${conversationId}`,
          type: 'connection'
        });
      } else {
        dataService.addNotification({
          studentId: receiverId,
          title: `New message from ${sender.name}`,
          message: text.slice(0, 60) + (text.length > 60 ? '...' : ''),
          link: `/messages/${conversationId}`,
          type: 'connection'
        });
      }

      this.saveLocalConversation(convData);
      this.appendLocalMessage(conversationId, chatMessage);

      return { success: true };
    } catch (err) {
      console.warn('Firestore sendMessage fallback to local sync:', err);
      this.saveLocalConversation(convData);
      this.appendLocalMessage(conversationId, chatMessage);
      return { success: true };
    }
  }

  /**
   * Mark conversation read for the current user
   */
  public async markConversationRead(conversationId: string, currentUid: string): Promise<void> {
    if (!conversationId || !currentUid) return;

    try {
      const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(convRef, {
        [`unreadCounts.${currentUid}`]: 0
      });
    } catch (err) {
      // Local fallback
      const convs = this.getLocalConversations(currentUid);
      const conv = convs.find(c => c.id === conversationId);
      if (conv && conv.unreadCounts) {
        conv.unreadCounts[currentUid] = 0;
        this.saveLocalConversations(convs);
      }
    }
  }

  /**
   * Accept Message Request by following back -> transitions conversation to UNLOCKED
   */
  public async acceptMessageRequest(
    conversation: Conversation,
    currentStudent: StudentProfile,
    senderStudent: StudentProfile
  ): Promise<boolean> {
    try {
      // 1. Follow sender back
      await followService.followUser(currentStudent.id, senderStudent.id, currentStudent, senderStudent);

      // 2. Unlock the conversation
      const convRef = doc(db, CONVERSATIONS_COLLECTION, conversation.id);
      await updateDoc(convRef, {
        chatStatus: 'UNLOCKED',
        updatedAt: new Date().toISOString()
      });

      // 3. Notify sender that chat is unlocked
      dataService.addNotification({
        studentId: senderStudent.id,
        title: 'Chat Unlocked! 🎉',
        message: `${currentStudent.name} followed you back. You can now chat unlimitedly!`,
        link: `/messages/${conversation.id}`,
        type: 'connection'
      });

      return true;
    } catch (err) {
      console.warn('acceptMessageRequest fallback:', err);
      return true;
    }
  }

  /**
   * Ignore message request
   */
  public async ignoreMessageRequest(conversationId: string): Promise<boolean> {
    try {
      const convRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
      await updateDoc(convRef, {
        chatStatus: 'IGNORED',
        updatedAt: new Date().toISOString()
      });
      return true;
    } catch (err) {
      return true;
    }
  }

  /**
   * Block student
   */
  public async blockUser(currentUid: string, targetUid: string): Promise<boolean> {
    if (!currentUid || !targetUid) return false;

    // 1. Save in local blocked list
    const blockedList = this.getBlockedUsers(currentUid);
    if (!blockedList.includes(targetUid)) {
      blockedList.push(targetUid);
      localStorage.setItem(BLOCKS_STORAGE_PREFIX + currentUid, JSON.stringify(blockedList));
    }

    // 2. Unfollow both ways
    await followService.unfollowUser(currentUid, targetUid);
    await followService.unfollowUser(targetUid, currentUid);

    // 3. Update conversation status to BLOCKED
    const convId = this.getConversationId(currentUid, targetUid);
    try {
      const convRef = doc(db, CONVERSATIONS_COLLECTION, convId);
      await updateDoc(convRef, {
        chatStatus: 'BLOCKED',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      // safe fallback
    }

    return true;
  }

  /**
   * Unblock student
   */
  public async unblockUser(currentUid: string, targetUid: string): Promise<boolean> {
    if (!currentUid || !targetUid) return false;

    const blockedList = this.getBlockedUsers(currentUid);
    const updated = blockedList.filter(id => id !== targetUid);
    localStorage.setItem(BLOCKS_STORAGE_PREFIX + currentUid, JSON.stringify(updated));

    const convId = this.getConversationId(currentUid, targetUid);
    try {
      const convRef = doc(db, CONVERSATIONS_COLLECTION, convId);
      await updateDoc(convRef, {
        chatStatus: 'NO_RELATIONSHIP',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      // safe fallback
    }

    return true;
  }

  /**
   * Check if user is blocked
   */
  public isUserBlocked(currentUid: string, targetUid: string): boolean {
    const list = this.getBlockedUsers(currentUid);
    return list.includes(targetUid);
  }

  public getBlockedUsers(currentUid: string): string[] {
    try {
      const raw = localStorage.getItem(BLOCKS_STORAGE_PREFIX + currentUid);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Report user
   */
  public async reportUser(
    reportedBy: string,
    reportedUser: string,
    reason: UserReport['reason'],
    description: string,
    conversationId?: string,
    messageId?: string
  ): Promise<boolean> {
    const report: UserReport = {
      id: 'rep-' + Date.now(),
      reportedBy,
      reportedUser,
      conversationId,
      messageId,
      reason,
      description,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    try {
      const reportRef = doc(db, REPORTS_COLLECTION, report.id);
      await setDoc(reportRef, report);
      return true;
    } catch (err) {
      console.warn('Report user fallback:', err);
      return true;
    }
  }

  /**
   * Delete message for me
   */
  public async deleteMessageForMe(
    conversationId: string,
    messageId: string,
    currentUid: string
  ): Promise<boolean> {
    try {
      const msgRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, 'messages', messageId);
      const snap = await getDoc(msgRef);
      if (snap.exists()) {
        const deletedFor: string[] = snap.data()?.deletedFor || [];
        if (!deletedFor.includes(currentUid)) {
          deletedFor.push(currentUid);
          await updateDoc(msgRef, { deletedFor });
        }
      }
      return true;
    } catch (err) {
      return true;
    }
  }

  /**
   * Privacy Settings
   */
  public getPrivacySettings(uid: string): PrivacySettings {
    const defaultSettings: PrivacySettings = {
      whoCanFollow: 'Everyone',
      whoCanMessage: 'Everyone',
      showOnlineStatus: true,
      showInDiscover: true
    };

    try {
      const raw = localStorage.getItem(PRIVACY_STORAGE_PREFIX + uid);
      return raw ? { ...defaultSettings, ...JSON.parse(raw) } : defaultSettings;
    } catch {
      return defaultSettings;
    }
  }

  public updatePrivacySettings(uid: string, settings: Partial<PrivacySettings>): void {
    const current = this.getPrivacySettings(uid);
    const updated = { ...current, ...settings };
    localStorage.setItem(PRIVACY_STORAGE_PREFIX + uid, JSON.stringify(updated));
  }

  // ==========================================
  // Local Storage Helpers
  // ==========================================
  private getLocalConversations(uid: string): Conversation[] {
    try {
      const raw = localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
      const list: Conversation[] = raw ? JSON.parse(raw) : [];
      return list.filter(c => c.participantIds?.includes(uid) && !c.deletedFor?.includes(uid));
    } catch {
      return [];
    }
  }

  private getLocalConversationById(conversationId: string): Conversation | null {
    try {
      const raw = localStorage.getItem(LOCAL_CONVERSATIONS_KEY);
      const list: Conversation[] = raw ? JSON.parse(raw) : [];
      return list.find(c => c.id === conversationId) || null;
    } catch {
      return null;
    }
  }

  private saveLocalConversations(conversations: Conversation[]): void {
    try {
      localStorage.setItem(LOCAL_CONVERSATIONS_KEY, JSON.stringify(conversations));
    } catch {
      // quota exceeded safe
    }
  }

  private saveLocalConversation(conversation: Conversation): void {
    try {
      const list = this.getLocalConversations(conversation.participantIds[0]);
      const idx = list.findIndex(c => c.id === conversation.id);
      if (idx >= 0) {
        list[idx] = conversation;
      } else {
        list.push(conversation);
      }
      this.saveLocalConversations(list);
    } catch {
      // quota safe
    }
  }

  private getLocalMessages(conversationId: string, currentUid: string): ChatMessage[] {
    try {
      const raw = localStorage.getItem(LOCAL_MESSAGES_PREFIX + conversationId);
      const list: ChatMessage[] = raw ? JSON.parse(raw) : [];
      return list.filter(m => !m.deletedFor?.includes(currentUid));
    } catch {
      return [];
    }
  }

  private saveLocalMessages(conversationId: string, messages: ChatMessage[]): void {
    try {
      localStorage.setItem(LOCAL_MESSAGES_PREFIX + conversationId, JSON.stringify(messages));
    } catch {
      // quota safe
    }
  }

  private appendLocalMessage(conversationId: string, message: ChatMessage): void {
    try {
      const messages = this.getLocalMessages(conversationId, message.senderId);
      messages.push(message);
      this.saveLocalMessages(conversationId, messages);
    } catch {
      // quota safe
    }
  }
}

export const chatService = ChatService.getInstance();
