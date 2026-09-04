import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Conversation, 
  ChatMessage, 
  StudentProfile, 
  UserReport 
} from '../types';
import { useAuth } from '../context/AuthContext';
import { chatService } from '../services/chatService';
import { followService } from '../services/followService';
import { dataService } from '../services/dataService';
import { firestoreService } from '../services/firestoreService';
import { 
  Search, 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  ShieldAlert, 
  UserX, 
  Check, 
  CheckCheck, 
  Clock, 
  Users, 
  Sparkles, 
  Trash2, 
  Copy,
  ExternalLink,
  MessageSquare,
  UserCheck,
  AlertTriangle,
  X
} from 'lucide-react';

export const MessagesPage: React.FC = () => {
  const { currentUser: fbUser, studentProfile } = useAuth();
  const navigate = useNavigate();
  const { conversationId: routeConvId } = useParams<{ conversationId?: string }>();
  const [searchParams] = useSearchParams();
  const targetUserParam = searchParams.get('user');

  const currentStudent = studentProfile || (dataService.getCurrentUser() as StudentProfile);
  const currentUid = currentStudent.id;

  // Conversations and active state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(routeConvId || null);
  const [activeMessages, setActiveMessages] = useState<ChatMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'conversations' | 'requests'>('conversations');
  const [searchQuery, setSearchQuery] = useState('');

  // Composer
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals & Menus
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState<UserReport['reason']>('Spam');
  const [reportDescription, setReportDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  // Mutual follow status for active conversation
  const [isMutualFollow, setIsMutualFollow] = useState<boolean>(false);
  const [iFollowOther, setIFollowOther] = useState<boolean>(false);
  const [otherFollowsMe, setOtherFollowsMe] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // 1. Subscribe to conversations list
  useEffect(() => {
    if (!currentUid) return;

    const unsubscribe = chatService.subscribeToConversations(currentUid, (updatedList) => {
      setConversations(updatedList);
    });

    return () => unsubscribe();
  }, [currentUid]);

  // Handle targetUser query param (e.g., from Profile page: /messages?user=uidB)
  useEffect(() => {
    if (targetUserParam && currentUid && targetUserParam !== currentUid) {
      const convId = chatService.getConversationId(currentUid, targetUserParam);
      setActiveConversationId(convId);
    }
  }, [targetUserParam, currentUid]);

  // Sync route conversationId
  useEffect(() => {
    if (routeConvId) {
      setActiveConversationId(routeConvId);
    }
  }, [routeConvId]);

  // Find active conversation
  const activeConversation = conversations.find(c => c.id === activeConversationId);

  // Determine other participant
  const otherParticipantId = activeConversation
    ? activeConversation.participantIds.find(id => id !== currentUid)
    : (targetUserParam || (activeConversationId ? activeConversationId.split('_').find(id => id !== currentUid) : null));

  const [firestoreOtherStudent, setFirestoreOtherStudent] = useState<StudentProfile | null>(null);

  useEffect(() => {
    if (otherParticipantId) {
      firestoreService.getStudentProfile(otherParticipantId).then(profile => {
        if (profile) setFirestoreOtherStudent(profile);
      });
    } else {
      setFirestoreOtherStudent(null);
    }
  }, [otherParticipantId]);

  const allStudents = dataService.getAllStudents();
  const otherStudent = otherParticipantId 
    ? (firestoreOtherStudent || allStudents.find(s => s.id === otherParticipantId) || {
        id: otherParticipantId,
        name: activeConversation?.participantDetails[otherParticipantId]?.name || 'Student',
        avatar: activeConversation?.participantDetails[otherParticipantId]?.avatar || '/avatars/avatar-1.png',
        college: activeConversation?.participantDetails[otherParticipantId]?.college || 'Campus',
        department: activeConversation?.participantDetails[otherParticipantId]?.department || 'Student'
      } as StudentProfile)
    : null;

  // 2. Subscribe to messages of active conversation
  useEffect(() => {
    if (!activeConversationId || !currentUid) return;

    // Mark as read
    chatService.markConversationRead(activeConversationId, currentUid);

    const unsubscribe = chatService.subscribeToMessages(
      activeConversationId,
      currentUid,
      (messages) => {
        setActiveMessages(messages);
        scrollToBottom();
      }
    );

    return () => unsubscribe();
  }, [activeConversationId, currentUid]);

  // 3. Check follow states whenever active conversation or other student changes
  useEffect(() => {
    if (!currentUid || !otherParticipantId) return;

    let isMounted = true;
    Promise.all([
      followService.isFollowing(currentUid, otherParticipantId),
      followService.isFollowing(otherParticipantId, currentUid)
    ]).then(([following, followedBy]) => {
      if (isMounted) {
        setIFollowOther(following);
        setOtherFollowsMe(followedBy);
        setIsMutualFollow(following && followedBy);
      }
    });

    return () => { isMounted = false; };
  }, [currentUid, otherParticipantId, activeMessages.length]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Send message handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || sending || !otherStudent) return;

    setSending(true);
    setErrorMessage(null);

    const res = await chatService.sendMessage(currentStudent, otherStudent, messageText);
    setSending(false);

    if (res.success) {
      setMessageText('');
      scrollToBottom();
    } else {
      setErrorMessage(res.error || 'Failed to send message.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Filter conversations & requests
  const filteredConversations = conversations.filter(c => {
    const otherId = c.participantIds.find(id => id !== currentUid) || '';
    const other = c.participantDetails[otherId];
    const matchSearch = !searchQuery.trim() || 
      other?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      other?.department.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'requests') {
      return matchSearch && c.chatStatus === 'REQUESTED' && c.initiatedBy !== currentUid;
    } else {
      return matchSearch && (c.chatStatus !== 'REQUESTED' || c.initiatedBy === currentUid);
    }
  });

  const pendingRequestsCount = conversations.filter(
    c => c.chatStatus === 'REQUESTED' && c.initiatedBy !== currentUid
  ).length;

  // Determine chat state flags for active conversation
  const isBlocked = otherParticipantId 
    ? chatService.isUserBlocked(currentUid, otherParticipantId) || activeConversation?.chatStatus === 'BLOCKED'
    : false;

  const isIncomingRequest = activeConversation?.chatStatus === 'REQUESTED' && activeConversation.initiatedBy !== currentUid;
  const isOutgoingPending = activeConversation?.chatStatus === 'REQUESTED' && activeConversation.initiatedBy === currentUid;
  const isIgnored = activeConversation?.chatStatus === 'IGNORED';
  const canSendUnlimited = isMutualFollow && !isBlocked && !isIgnored;

  // Actions
  const handleFollowBack = async () => {
    if (!activeConversation || !otherStudent) return;
    await chatService.acceptMessageRequest(activeConversation, currentStudent, otherStudent);
    setIsMutualFollow(true);
    setIFollowOther(true);
  };

  const handleIgnore = async () => {
    if (!activeConversation) return;
    await chatService.ignoreMessageRequest(activeConversation.id);
  };

  const handleBlock = async () => {
    if (!otherParticipantId) return;
    if (confirm(`Block ${otherStudent?.name}? They won't be able to message you or view your updates.`)) {
      await chatService.blockUser(currentUid, otherParticipantId);
      setMenuOpen(false);
    }
  };

  const handleUnblock = async () => {
    if (!otherParticipantId) return;
    await chatService.unblockUser(currentUid, otherParticipantId);
    setMenuOpen(false);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otherParticipantId) return;

    await chatService.reportUser(
      currentUid,
      otherParticipantId,
      reportReason,
      reportDescription,
      activeConversationId || undefined
    );

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setReportModalOpen(false);
      setReportDescription('');
    }, 1500);
  };

  const formatMessageTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatConversationTime = (isoString?: string) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);

      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h`;
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-120px)] min-h-[580px]">
      <div className="bg-white border border-[#E5E5E5] rounded-3xl h-full shadow-xs overflow-hidden flex">
        
        {/* ======================================================== */}
        {/* LEFT SIDEBAR: CONVERSATIONS & REQUESTS LIST */}
        {/* ======================================================== */}
        <aside 
          className={`w-full md:w-80 lg:w-96 border-r border-[#E5E5E5] flex flex-col shrink-0 bg-white ${
            activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Header & Search */}
          <div className="p-4 border-b border-[#E5E5E5] space-y-3">
            <div className="flex items-center justify-between">
              <h1 className="font-heading font-bold text-lg text-[#262626] flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#E63946]" />
                <span>Messages</span>
              </h1>
            </div>

            {/* Universal Search Field */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#999999] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students, skills, messages..."
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#262626] placeholder:text-[#999999] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>

            {/* Segmented Tab Switcher */}
            <div className="flex rounded-xl bg-[#FFF8F8] p-1 border border-[#E5E5E5]">
              <button
                onClick={() => setActiveTab('conversations')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'conversations'
                    ? 'bg-white text-[#E63946] shadow-xs'
                    : 'text-[#666666] hover:text-[#262626]'
                }`}
              >
                Conversations
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                  activeTab === 'requests'
                    ? 'bg-white text-[#E63946] shadow-xs'
                    : 'text-[#666666] hover:text-[#262626]'
                }`}
              >
                <span>Requests</span>
                {pendingRequestsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#E63946] text-white text-[10px] flex items-center justify-center font-bold">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* List Content */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#E5E5E5]/60">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#FFF1F2] text-[#E63946] flex items-center justify-center mx-auto text-xl">
                  ✉️
                </div>
                <h3 className="font-heading font-semibold text-sm text-[#262626]">
                  {activeTab === 'requests' ? 'No message requests' : 'No messages yet'}
                </h3>
                <p className="text-xs text-[#666666]">
                  {activeTab === 'requests'
                    ? 'New message requests from other students will appear here.'
                    : 'Discover students and start collaborating on campus projects.'}
                </p>
                {activeTab === 'conversations' && (
                  <Link
                    to="/students"
                    className="inline-block mt-2 px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition"
                  >
                    Discover Students
                  </Link>
                )}
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const otherId = conv.participantIds.find(id => id !== currentUid) || '';
                const other = conv.participantDetails[otherId];
                const unreadCount = conv.unreadCounts?.[currentUid] || 0;
                const isSelected = conv.id === activeConversationId;

                return (
                  <div
                    key={conv.id}
                    onClick={() => {
                      setActiveConversationId(conv.id);
                      navigate(`/messages/${conv.id}`);
                    }}
                    className={`p-3.5 sm:p-4 flex items-center gap-3 cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#FFF1F2]/80 border-l-4 border-l-[#E63946]'
                        : 'hover:bg-[#FFF8F8]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img
                        src={other?.avatar || '/avatars/avatar-1.png'}
                        alt={other?.name}
                        className="w-12 h-12 rounded-full object-cover border border-[#E5E5E5] p-0.5 bg-white"
                      />
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
                    </div>

                    {/* Preview Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-[#262626] truncate">
                          {other?.name || 'Campus Student'}
                        </h4>
                        <span className="text-[10px] text-[#999999] shrink-0 ml-1">
                          {formatConversationTime(conv.lastMessageAt || conv.createdAt)}
                        </span>
                      </div>

                      <p className="text-xs text-[#666666] truncate mt-0.5 font-normal">
                        {conv.lastSenderId === currentUid ? 'You: ' : ''}
                        {conv.lastMessage || 'Sent a message request'}
                      </p>

                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[10px] text-[#999999] truncate max-w-[140px]">
                          {other?.department}
                        </span>

                        {unreadCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#E63946] text-white text-[10px] font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ======================================================== */}
        {/* RIGHT AREA: ACTIVE CHAT CONVERSATION */}
        {/* ======================================================== */}
        <section 
          className={`flex-1 flex flex-col bg-[#FFF8F8]/40 ${
            !activeConversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          {otherStudent ? (
            <>
              {/* Active Chat Header */}
              <div className="h-16 px-4 sm:px-6 bg-white border-b border-[#E5E5E5] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => {
                      setActiveConversationId(null);
                      navigate('/messages');
                    }}
                    className="md:hidden p-1.5 -ml-1.5 rounded-xl text-[#666666] hover:text-[#262626] hover:bg-[#FFF8F8]"
                    title="Back to conversation list"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <img
                      src={otherStudent.avatar}
                      alt={otherStudent.name}
                      className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5] p-0.5 bg-white"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-sm text-[#262626] flex items-center gap-2">
                      <span>{otherStudent.name}</span>
                      {isMutualFollow && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Connected
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-[#666666]">
                      {otherStudent.department} • {otherStudent.college}
                    </p>
                  </div>
                </div>

                {/* Header Action Menu */}
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="p-2 rounded-xl text-[#666666] hover:text-[#262626] hover:bg-[#FFF8F8] transition"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 top-10 w-48 bg-white border border-[#E5E5E5] rounded-2xl shadow-lg py-1.5 z-30 text-xs text-[#262626]">
                      <Link
                        to={`/profile/${otherStudent.id}`}
                        className="flex items-center gap-2 px-3.5 py-2 hover:bg-[#FFF8F8] text-[#262626]"
                        onClick={() => setMenuOpen(false)}
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-[#666666]" />
                        <span>View Profile</span>
                      </Link>

                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setReportModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#FFF8F8] text-[#262626] text-left"
                      >
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span>Report Student</span>
                      </button>

                      <div className="my-1 border-t border-[#E5E5E5]" />

                      {isBlocked ? (
                        <button
                          onClick={handleUnblock}
                          className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-[#FFF8F8] text-emerald-600 text-left"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Unblock Student</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleBlock}
                          className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 text-rose-600 text-left"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Block Student</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* State Banners */}
              {isBlocked && (
                <div className="p-3 bg-rose-50 border-b border-rose-200 text-xs text-rose-700 flex items-center justify-between px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <UserX className="w-4 h-4 text-rose-600" />
                    <span>This student is blocked. Messaging is disabled.</span>
                  </div>
                  <button
                    onClick={handleUnblock}
                    className="font-semibold text-rose-700 hover:underline"
                  >
                    Unblock
                  </button>
                </div>
              )}

              {/* Case 1: Incoming Message Request for Receiver */}
              {isIncomingRequest && !isBlocked && (
                <div className="p-4 bg-[#FFF1F2] border-b border-[#FFE4E6] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#E63946]">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{otherStudent.name} sent you a message request</span>
                    </div>
                    <p className="text-xs text-[#666666]">
                      Follow back to accept the request and unlock unlimited real-time chat.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleFollowBack}
                      className="px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center gap-1"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Follow Back</span>
                    </button>
                    <button
                      onClick={handleIgnore}
                      className="px-3 py-1.5 bg-white hover:bg-[#FFF8F8] text-[#666666] border border-[#E5E5E5] text-xs font-semibold rounded-xl transition"
                    >
                      Ignore
                    </button>
                  </div>
                </div>
              )}

              {/* Case 2: Outgoing Message Request Pending for Sender */}
              {isOutgoingPending && !isBlocked && (
                <div className="p-3.5 bg-amber-50 border-b border-amber-200 text-xs text-amber-800 flex items-center gap-2.5 px-4 sm:px-6">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Message request sent.</strong> Waiting for {otherStudent.name} to follow you back to unlock unlimited chatting.
                  </span>
                </div>
              )}

              {/* Case 3: Other follows you, follow back prompt */}
              {!isMutualFollow && otherFollowsMe && !isOutgoingPending && !isIncomingRequest && !isBlocked && (
                <div className="p-3.5 bg-[#FFF1F2] border-b border-[#FFE4E6] text-xs text-[#262626] flex items-center justify-between px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-[#E63946]" />
                    <span>{otherStudent.name} follows you. Follow back to start chatting!</span>
                  </div>
                  <button
                    onClick={handleFollowBack}
                    className="px-3 py-1 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition"
                  >
                    Follow Back
                  </button>
                </div>
              )}

              {/* Real-Time Messages Stream */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-[#666666]">
                    <div className="w-14 h-14 rounded-full bg-[#FFF1F2] flex items-center justify-center text-2xl">
                      💬
                    </div>
                    <h4 className="font-heading font-bold text-sm text-[#262626]">
                      {isMutualFollow ? "You're connected! 🎉" : 'Message Request'}
                    </h4>
                    <p className="text-xs max-w-xs leading-relaxed">
                      {isMutualFollow
                        ? 'Start collaborating on campus projects, coursework, or events.'
                        : 'Send your initial message to start the conversation.'}
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderId === currentUid;
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed relative break-words shadow-xs ${
                            isMe
                              ? 'bg-[#E63946] text-white rounded-br-xs'
                              : 'bg-white text-[#262626] border border-[#E5E5E5] rounded-bl-xs'
                          }`}
                        >
                          <p>{msg.text}</p>

                          <div
                            className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                              isMe ? 'text-white/75' : 'text-[#999999]'
                            }`}
                          >
                            <span>{formatMessageTime(msg.createdAt)}</span>
                            {isMe && (
                              <span>
                                {msg.isRead ? (
                                  <CheckCheck className="w-3 h-3 text-white" />
                                ) : (
                                  <Check className="w-3 h-3 text-white/70" />
                                )}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Message Action Pill (Delete for me) */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 px-1 flex items-center gap-1 text-[10px] text-[#999999]">
                          <button
                            onClick={() => chatService.deleteMessageForMe(activeConversationId!, msg.id, currentUid)}
                            className="hover:text-rose-600 flex items-center gap-0.5"
                            title="Delete for me"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete for me</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Composer Area */}
              <div className="p-3 sm:p-4 bg-white border-t border-[#E5E5E5]">
                {errorMessage && (
                  <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center justify-between">
                    <span>{errorMessage}</span>
                    <button onClick={() => setErrorMessage(null)}>
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isBlocked ? (
                  <div className="p-3 rounded-2xl bg-rose-50 text-xs text-rose-700 text-center font-medium">
                    This user is blocked. Unblock to continue chatting.
                  </div>
                ) : isOutgoingPending ? (
                  <div className="p-3 rounded-2xl bg-[#FFF8F8] border border-[#E5E5E5] text-xs text-[#666666] text-center">
                    Waiting for {otherStudent.name} to follow you back. You can send unlimited messages once connected.
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="space-y-1.5">
                    <div className="flex items-end gap-2 bg-[#FFF8F8] border border-[#E5E5E5] focus-within:border-[#FECDD3] focus-within:ring-2 focus-within:ring-[#FFF1F2] rounded-2xl p-2 transition">
                      <textarea
                        rows={1}
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        maxLength={2000}
                        placeholder={
                          isMutualFollow 
                            ? 'Type a message... (Enter to send, Shift+Enter for newline)'
                            : `Send introduction message to ${otherStudent.name}...`
                        }
                        className="w-full bg-transparent p-1.5 text-xs sm:text-sm text-[#262626] focus:outline-none resize-none max-h-32"
                      />

                      <button
                        type="submit"
                        disabled={!messageText.trim() || sending}
                        className="p-2.5 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-40 text-white rounded-xl transition shadow-xs shrink-0 flex items-center justify-center"
                        title="Send message"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between text-[10px] text-[#999999] px-2">
                      <span>Shift + Enter for new line</span>
                      <span>{messageText.length}/2000</span>
                    </div>
                  </form>
                )}
              </div>
            </>
          ) : (
            /* Empty State when no conversation selected */
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-[#FFF1F2] text-[#E63946] flex items-center justify-center text-3xl">
                💬
              </div>
              <h2 className="font-heading font-bold text-lg text-[#262626]">
                Your Campus Messages
              </h2>
              <p className="text-xs sm:text-sm text-[#666666] max-w-sm leading-relaxed">
                Connect with students, collaborate on projects, and prepare for hackathons together.
              </p>
              <Link
                to="/students"
                className="px-5 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition shadow-xs inline-flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Discover Students</span>
              </Link>
            </div>
          )}
        </section>

      </div>

      {/* Report Student Modal */}
      {reportModalOpen && otherStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <h3 className="font-heading font-bold text-sm sm:text-base text-[#262626] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Report {otherStudent.name}</span>
              </h3>
              <button onClick={() => setReportModalOpen(false)}>
                <X className="w-4 h-4 text-[#666666]" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs text-center font-medium">
                Thank you. Your report has been submitted for admin review.
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#262626] mb-1">
                    Reason for Report
                  </label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as any)}
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none"
                  >
                    <option value="Spam">Spam / Unsolicited Promotion</option>
                    <option value="Harassment">Harassment / Abusive Behavior</option>
                    <option value="Inappropriate content">Inappropriate Content</option>
                    <option value="Fake profile">Fake Profile / Impersonation</option>
                    <option value="Scam">Scam / Commercial Fraud</option>
                    <option value="Other">Other Community Guideline Violation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#262626] mb-1">
                    Additional Details
                  </label>
                  <textarea
                    rows={3}
                    value={reportDescription}
                    onChange={(e) => setReportDescription(e.target.value)}
                    placeholder="Provide context for our campus moderators..."
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-3 text-xs text-[#262626] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-4 py-2 text-xs text-[#666666] font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition"
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
