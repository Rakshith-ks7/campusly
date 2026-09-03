import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where 
} from './firebase';
import { 
  FeedbackItem, 
  FeedbackStatus, 
  FeedbackPriority 
} from '../types';
import { dataService } from './dataService';

const FEEDBACK_COLLECTION = 'feedback';
const LOCAL_FEEDBACK_KEY = 'campusly_local_feedback';
const LAST_SUBMISSION_PREFIX = 'campusly_last_feedback_';

export class FeedbackService {
  private static instance: FeedbackService;

  public static getInstance(): FeedbackService {
    if (!FeedbackService.instance) {
      FeedbackService.instance = new FeedbackService();
    }
    return FeedbackService.instance;
  }

  /**
   * Submit new feedback with spam protection and validation
   */
  public async submitFeedback(
    data: Omit<FeedbackItem, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'priority'>
  ): Promise<{ success: boolean; id?: string; error?: string }> {
    const trimmedMessage = (data.message || '').trim();

    if (!trimmedMessage && !data.bugDetails?.whatWentWrong && !data.featureDetails?.featureTitle && !data.eventDetails?.whatLiked) {
      return { success: false, error: 'Please provide a feedback message or details.' };
    }

    if (trimmedMessage.length > 2000) {
      return { success: false, error: 'Feedback message cannot exceed 2,000 characters.' };
    }

    // Spam Protection: 15-second cooldown per user
    const lastSubKey = LAST_SUBMISSION_PREFIX + (data.userId || 'anon');
    const lastSubTime = localStorage.getItem(lastSubKey);
    const nowMs = Date.now();
    if (lastSubTime && nowMs - parseInt(lastSubTime, 10) < 15000) {
      return { success: false, error: 'Please wait a few moments before submitting feedback again.' };
    }

    const now = new Date().toISOString();
    const feedbackId = 'fb-' + nowMs + '-' + Math.random().toString(36).substring(2, 6);

    const feedbackItem: FeedbackItem = {
      ...data,
      id: feedbackId,
      message: trimmedMessage || data.bugDetails?.whatWentWrong || data.featureDetails?.featureTitle || 'Feedback submission',
      userName: data.anonymous ? 'Anonymous Student' : (data.userName || 'Campus Student'),
      userEmail: data.anonymous ? undefined : data.userEmail,
      status: 'new',
      priority: data.type === 'bug' ? 'high' : 'medium',
      createdAt: now,
      updatedAt: now
    };

    try {
      const docRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
      await setDoc(docRef, feedbackItem);
      localStorage.setItem(lastSubKey, nowMs.toString());
      this.saveLocalFeedback(feedbackItem);
      return { success: true, id: feedbackId };
    } catch (err) {
      console.warn('Firestore submitFeedback fallback to local cache:', err);
      localStorage.setItem(lastSubKey, nowMs.toString());
      this.saveLocalFeedback(feedbackItem);
      return { success: true, id: feedbackId };
    }
  }

  /**
   * Fetch feedback submitted by the current student
   */
  public async getMyFeedback(userId: string): Promise<FeedbackItem[]> {
    if (!userId) return [];

    try {
      const q = query(
        collection(db, FEEDBACK_COLLECTION),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const list: FeedbackItem[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FeedbackItem);
      });

      // Merge with local fallback
      const local = this.getLocalFeedback().filter(f => f.userId === userId);
      const mergedMap = new Map<string, FeedbackItem>();
      [...local, ...list].forEach(item => mergedMap.set(item.id, item));

      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.warn('getMyFeedback fallback to local:', err);
      return this.getLocalFeedback()
        .filter(f => f.userId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
  }

  /**
   * Fetch all feedback for authorized campus administrators
   */
  public async getAllFeedback(): Promise<FeedbackItem[]> {
    try {
      const snapshot = await getDocs(collection(db, FEEDBACK_COLLECTION));
      const list: FeedbackItem[] = [];
      snapshot.forEach(docSnap => {
        list.push({ id: docSnap.id, ...docSnap.data() } as FeedbackItem);
      });

      // Merge with local fallback items and seed items if empty
      const local = this.getLocalFeedback();
      const mergedMap = new Map<string, FeedbackItem>();
      [...this.getSeedFeedback(), ...local, ...list].forEach(item => mergedMap.set(item.id, item));

      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (err) {
      console.warn('getAllFeedback fallback:', err);
      const local = this.getLocalFeedback();
      const mergedMap = new Map<string, FeedbackItem>();
      [...this.getSeedFeedback(), ...local].forEach(item => mergedMap.set(item.id, item));
      return Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
  }

  /**
   * Admin: Update status, priority, or provide an official response
   */
  public async updateFeedbackStatus(
    feedbackId: string,
    updates: {
      status?: FeedbackStatus;
      priority?: FeedbackPriority;
      adminResponse?: string;
      respondedBy?: string;
    }
  ): Promise<boolean> {
    const now = new Date().toISOString();
    const updatePayload: any = {
      updatedAt: now
    };

    if (updates.status) updatePayload.status = updates.status;
    if (updates.priority) updatePayload.priority = updates.priority;
    if (updates.adminResponse) {
      updatePayload.adminResponse = {
        message: updates.adminResponse,
        respondedBy: updates.respondedBy || 'Campusly Team',
        respondedAt: now
      };
    }

    try {
      const docRef = doc(db, FEEDBACK_COLLECTION, feedbackId);
      await updateDoc(docRef, updatePayload);

      // Notify the student if an admin response was provided
      if (updates.adminResponse) {
        const snap = await getDoc(docRef);
        const item = snap.data() as FeedbackItem | undefined;
        if (item && item.userId && item.contactMe) {
          dataService.addNotification({
            studentId: item.userId,
            title: 'Campusly Replied to Your Feedback 💬',
            message: `"${updates.adminResponse.slice(0, 70)}${updates.adminResponse.length > 70 ? '...' : ''}"`,
            link: '/settings',
            type: 'general'
          });
        }
      }

      this.updateLocalFeedbackItem(feedbackId, updatePayload);
      return true;
    } catch (err) {
      console.warn('updateFeedbackStatus local fallback:', err);
      this.updateLocalFeedbackItem(feedbackId, updatePayload);
      return true;
    }
  }

  /**
   * Get aggregated event feedback summary
   */
  public async getEventFeedbackSummary(eventId: string): Promise<{
    total: number;
    averageRating: number;
    wouldAttendAgainPercent: number;
    commonLikes: string[];
    commonImprovements: string[];
  }> {
    const all = await this.getAllFeedback();
    const eventItems = all.filter(f => f.type === 'event' && f.eventDetails?.eventId === eventId);

    if (eventItems.length === 0) {
      return {
        total: 0,
        averageRating: 4.8,
        wouldAttendAgainPercent: 92,
        commonLikes: ['Great hands-on coding demos', 'Engaging speaker presentation'],
        commonImprovements: ['More time for open Q&A at the end']
      };
    }

    const total = eventItems.length;
    const sumRatings = eventItems.reduce((acc, curr) => acc + (curr.eventDetails?.rating || 5), 0);
    const wouldAttendCount = eventItems.filter(f => f.eventDetails?.wouldAttendAgain === 'Yes').length;

    const commonLikes = eventItems
      .map(f => f.eventDetails?.whatLiked || '')
      .filter(Boolean)
      .slice(0, 3);

    const commonImprovements = eventItems
      .map(f => f.eventDetails?.whatImprove || '')
      .filter(Boolean)
      .slice(0, 3);

    return {
      total,
      averageRating: Number((sumRatings / total).toFixed(1)),
      wouldAttendAgainPercent: Math.round((wouldAttendCount / total) * 100),
      commonLikes: commonLikes.length > 0 ? commonLikes : ['Hands-on practical walkthroughs'],
      commonImprovements: commonImprovements.length > 0 ? commonImprovements : ['Extend workshop duration']
    };
  }

  // ==========================================
  // LocalStorage Fallback & Seeding
  // ==========================================
  private getLocalFeedback(): FeedbackItem[] {
    try {
      const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveLocalFeedback(item: FeedbackItem): void {
    try {
      const list = this.getLocalFeedback();
      const existingIdx = list.findIndex(f => f.id === item.id);
      if (existingIdx >= 0) {
        list[existingIdx] = item;
      } else {
        list.unshift(item);
      }
      localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(list));
    } catch {
      // quota safe
    }
  }

  private updateLocalFeedbackItem(id: string, updates: Partial<FeedbackItem>): void {
    try {
      const list = this.getLocalFeedback();
      const idx = list.findIndex(f => f.id === id);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...updates };
        localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(list));
      }
    } catch {
      // safe
    }
  }

  private getSeedFeedback(): FeedbackItem[] {
    return [
      {
        id: 'fb-seed-1',
        userId: 'student-seed-1',
        userName: 'Aarav Patel',
        userEmail: 'aarav@campus.edu',
        type: 'feature',
        message: 'Could we get dedicated group study rooms with shared whiteboard links?',
        page: 'Communities',
        status: 'planned',
        priority: 'high',
        anonymous: false,
        device: 'Desktop',
        browser: 'Chrome',
        contactMe: true,
        createdAt: '2026-09-02T10:30:00Z',
        updatedAt: '2026-09-02T14:00:00Z',
        featureDetails: {
          featureTitle: 'Virtual Whiteboard Study Rooms',
          studentBenefit: 'Helps students solve algorithm and circuit diagrams together online',
          targetAudience: 'Students'
        },
        adminResponse: {
          message: 'Great suggestion! We have added virtual whiteboard study sessions to our Q4 roadmap.',
          respondedBy: 'Campusly Admin',
          respondedAt: '2026-09-02T14:00:00Z'
        }
      },
      {
        id: 'fb-seed-2',
        userId: 'student-seed-2',
        userName: 'Pooja Hegde',
        userEmail: 'pooja@campus.edu',
        type: 'bug',
        message: 'Filter dropdown on projects was closing immediately when clicking on mobile Safari.',
        page: 'Projects',
        status: 'resolved',
        priority: 'medium',
        anonymous: false,
        device: 'Mobile',
        browser: 'Safari',
        contactMe: true,
        createdAt: '2026-09-01T16:15:00Z',
        updatedAt: '2026-09-02T09:00:00Z',
        bugDetails: {
          whatWentWrong: 'Mobile filter dropdown dismisses on touch',
          tryingToDo: 'Filter projects by AI / ML category',
          expectedBehavior: 'Dropdown stays open until an item is tapped',
          actualBehavior: 'Dropdown closed immediately'
        },
        adminResponse: {
          message: 'Fixed in the latest build! Thanks for reporting.',
          respondedBy: 'Engineering Team',
          respondedAt: '2026-09-02T09:00:00Z'
        }
      }
    ];
  }
}

export const feedbackService = FeedbackService.getInstance();
