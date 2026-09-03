import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService';
import { feedbackService } from '../services/feedbackService';
import { ReportItem, FeedbackItem, FeedbackStatus, FeedbackPriority } from '../types';
import { 
  Shield, 
  Users, 
  Calendar, 
  Layers, 
  ShieldAlert, 
  CheckCircle2, 
  Bell, 
  Search,
  Check,
  MessageSquareHeart,
  Bug,
  Lightbulb,
  X,
  Send,
  Clock,
  Filter
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>(dataService.getAllReports());
  const allStudents = dataService.getAllStudents();
  const allCommunities = dataService.getAllCommunities();
  const allEvents = dataService.getAllEvents();
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  // Feedback states
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<string>('all');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<string>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
  const [adminReplyText, setAdminReplyText] = useState('');
  const [updatingFeedback, setUpdatingFeedback] = useState(false);

  const loadFeedback = () => {
    feedbackService.getAllFeedback().then(setFeedbackList);
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  const handleUpdateFeedbackStatus = async (
    id: string, 
    status: FeedbackStatus, 
    priority?: FeedbackPriority,
    reply?: string
  ) => {
    setUpdatingFeedback(true);
    await feedbackService.updateFeedbackStatus(id, {
      status,
      priority,
      adminResponse: reply,
      respondedBy: 'Campus Admin'
    });
    setUpdatingFeedback(false);
    loadFeedback();
    if (selectedFeedback && selectedFeedback.id === id) {
      setSelectedFeedback(prev => prev ? {
        ...prev,
        status,
        priority: priority || prev.priority,
        adminResponse: reply ? {
          message: reply,
          respondedBy: 'Campus Admin',
          respondedAt: new Date().toISOString()
        } : prev.adminResponse
      } : null);
    }
  };

  const handleResolveReport = (id: string) => {
    dataService.resolveReport(id);
    setReports(dataService.getAllReports());
  };

  const handleBroadcastAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    allStudents.forEach(student => {
      dataService.addNotification({
        studentId: student.id,
        title: 'Campus Community Announcement 📢',
        message: announcementText,
        link: '/events',
        type: 'general'
      });
    });

    setAnnouncementSent(true);
    setAnnouncementText('');
    setTimeout(() => setAnnouncementSent(false), 3000);
  };

  const pendingReports = reports.filter(r => r.status === 'pending');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>Authorized Administration Portal</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            College Community Moderation
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Administrative panel to monitor campus platform safety, review student reports, manage communities and publish university-wide announcements.
          </p>
        </div>

        <div className="p-3 bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl text-xs text-[#666666] text-right">
          <div className="font-semibold text-[#262626]">University System</div>
          <div>Kishkinda University Campus Admin</div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666666]">Total Students</span>
            <Users className="w-4 h-4 text-[#E63946]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#262626]">
            {allStudents.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">100% verified campus emails</div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666666]">Active Communities</span>
            <Layers className="w-4 h-4 text-[#E63946]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#262626]">
            {allCommunities.length}
          </div>
          <div className="text-[11px] text-[#666666]">Across 8 disciplines</div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666666]">Events & Workshops</span>
            <Calendar className="w-4 h-4 text-[#E63946]" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#262626]">
            {allEvents.length}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">All approved</div>
        </div>

        <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#666666]">Pending Reports</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-heading font-bold text-[#262626]">
            {pendingReports.length}
          </div>
          <div className="text-[11px] text-rose-600 font-medium">Requires review</div>
        </div>

      </div>

      {/* Safety Reports Table */}
      <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-base sm:text-lg text-[#262626] flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-[#E63946]" />
              <span>Student Safety & Moderation Reports</span>
            </h2>
            <p className="text-xs text-[#666666]">
              Review flagged accounts, comments, or spam submissions
            </p>
          </div>
          <span className="text-xs text-[#666666]">
            {reports.length} total reports
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8F8] border-b border-[#E5E5E5] text-[#666666]">
              <tr>
                <th className="p-3 font-semibold">Reported Target</th>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Reason</th>
                <th className="p-3 font-semibold">Reporter</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-[#FFF8F8]/50">
                  <td className="p-3 font-medium text-[#262626]">{r.targetTitle || r.targetId}</td>
                  <td className="p-3 capitalize text-[#666666]">{r.targetType}</td>
                  <td className="p-3 text-[#666666]">{r.reason}</td>
                  <td className="p-3 text-[#666666]">{r.reporterName}</td>
                  <td className="p-3 text-[#999999]">{r.timestamp}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      r.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.status === 'pending' ? (
                      <button
                        onClick={() => handleResolveReport(r.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-medium transition"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 flex items-center justify-end gap-1">
                        <Check className="w-3 h-3" />
                        <span>Closed</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Student Feedback & Feature Requests Dashboard */}
      <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E5E5E5]">
          <div>
            <h2 className="font-heading font-semibold text-base sm:text-lg text-[#262626] flex items-center gap-2">
              <MessageSquareHeart className="w-5 h-5 text-[#E63946]" />
              <span>Student Feedback & Feature Requests</span>
            </h2>
            <p className="text-xs text-[#666666]">
              Review student bug reports, feature suggestions, UI feedback, and workshop ratings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666666] font-medium">
              {feedbackList.length} total entries
            </span>
          </div>
        </div>

        {/* Feedback Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-1">
            <span className="text-[11px] text-[#666666]">Total Feedback</span>
            <div className="text-xl font-bold text-[#262626]">{feedbackList.length}</div>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 space-y-1">
            <span className="text-[11px] text-blue-700 font-medium">New / Unread</span>
            <div className="text-xl font-bold text-blue-700">
              {feedbackList.filter(f => f.status === 'new').length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-100 space-y-1">
            <span className="text-[11px] text-rose-700 font-medium">Bug Reports</span>
            <div className="text-xl font-bold text-rose-700">
              {feedbackList.filter(f => f.type === 'bug').length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
            <span className="text-[11px] text-purple-700 font-medium">Feature Requests</span>
            <div className="text-xl font-bold text-purple-700">
              {feedbackList.filter(f => f.type === 'feature').length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-100 space-y-1">
            <span className="text-[11px] text-emerald-700 font-medium">Resolved</span>
            <div className="text-xl font-bold text-emerald-700">
              {feedbackList.filter(f => f.status === 'resolved').length}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#666666] font-medium mr-1">Category:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'bug', label: 'Bugs' },
              { key: 'feature', label: 'Features' },
              { key: 'ui_ux', label: 'UI / UX' },
              { key: 'event', label: 'Events' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFeedbackCategoryFilter(tab.key)}
                className={`px-3 py-1 rounded-lg font-medium transition ${
                  feedbackCategoryFilter === tab.key
                    ? 'bg-[#E63946] text-white'
                    : 'bg-[#FFF8F8] border border-[#E5E5E5] text-[#666666] hover:text-[#262626]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#666666] font-medium">Status:</span>
            <select
              value={feedbackStatusFilter}
              onChange={(e) => setFeedbackStatusFilter(e.target.value)}
              className="bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-2.5 py-1 text-xs text-[#262626] focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewing">Reviewing</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Feedback List Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFF8F8] border-b border-[#E5E5E5] text-[#666666]">
              <tr>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Message / Summary</th>
                <th className="p-3 font-semibold">Page</th>
                <th className="p-3 font-semibold">Student</th>
                <th className="p-3 font-semibold">Priority</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E5E5]">
              {feedbackList
                .filter(item => {
                  if (feedbackCategoryFilter !== 'all' && item.type !== feedbackCategoryFilter) return false;
                  if (feedbackStatusFilter !== 'all' && item.status !== feedbackStatusFilter) return false;
                  return true;
                })
                .map((item) => (
                  <tr key={item.id} className="hover:bg-[#FFF8F8]/50">
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                        item.type === 'bug'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : item.type === 'feature'
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-[#262626] max-w-xs truncate">
                      {item.featureDetails?.featureTitle || item.bugDetails?.whatWentWrong || item.message}
                    </td>
                    <td className="p-3 text-[#666666]">{item.page || 'General'}</td>
                    <td className="p-3 text-[#666666]">
                      {item.anonymous ? (
                        <span className="italic text-[#999999]">Anonymous</span>
                      ) : (
                        <span>{item.userName}</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        item.priority === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : item.priority === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-zinc-100 text-zinc-700'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                        item.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : item.status === 'planned'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : item.status === 'reviewing' || item.status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {item.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-[#999999] whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedFeedback(item);
                          setAdminReplyText(item.adminResponse?.message || '');
                        }}
                        className="px-3 py-1 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946] rounded-lg font-semibold transition"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Admin Feedback Detail & Response Modal */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6] text-xs font-bold uppercase">
                  {selectedFeedback.type}
                </span>
                <span className="text-xs text-[#666666]">
                  Submitted {new Date(selectedFeedback.createdAt).toLocaleString()}
                </span>
              </div>
              <button 
                onClick={() => setSelectedFeedback(null)} 
                className="text-[#999999] hover:text-[#262626]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Submitter Info */}
            <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-[#262626]">Submitted By: </span>
                <span className="text-[#666666]">
                  {selectedFeedback.anonymous ? 'Anonymous Student' : `${selectedFeedback.userName} (${selectedFeedback.userEmail || 'verified student'})`}
                </span>
              </div>
              <div className="text-[#666666]">
                {selectedFeedback.device} • {selectedFeedback.browser}
              </div>
            </div>

            {/* Message Details */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-[#262626] uppercase tracking-wider block">
                Submission Message
              </span>
              <div className="p-4 rounded-xl bg-white border border-[#E5E5E5] text-[#262626] leading-relaxed">
                {selectedFeedback.message}
              </div>

              {/* Bug Details if present */}
              {selectedFeedback.bugDetails && (
                <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-rose-100 space-y-1.5">
                  <div className="font-semibold text-rose-700">What went wrong:</div>
                  <p className="text-[#262626]">{selectedFeedback.bugDetails.whatWentWrong}</p>
                  {selectedFeedback.bugDetails.tryingToDo && (
                    <>
                      <div className="font-semibold text-rose-700 pt-1">Trying to do:</div>
                      <p className="text-[#262626]">{selectedFeedback.bugDetails.tryingToDo}</p>
                    </>
                  )}
                  {selectedFeedback.bugDetails.expectedBehavior && (
                    <>
                      <div className="font-semibold text-rose-700 pt-1">Expected vs Actual:</div>
                      <p className="text-[#262626]">Expected: {selectedFeedback.bugDetails.expectedBehavior}</p>
                      <p className="text-[#262626]">Actual: {selectedFeedback.bugDetails.actualBehavior}</p>
                    </>
                  )}
                </div>
              )}

              {/* Feature Details if present */}
              {selectedFeedback.featureDetails && (
                <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-purple-100 space-y-1.5">
                  <div className="font-semibold text-purple-700">Target Audience:</div>
                  <p className="text-[#262626]">{selectedFeedback.featureDetails.targetAudience}</p>
                  <div className="font-semibold text-purple-700 pt-1">Student Benefit:</div>
                  <p className="text-[#262626]">{selectedFeedback.featureDetails.studentBenefit}</p>
                </div>
              )}
            </div>

            {/* Admin Controls: Status & Priority */}
            <div className="space-y-2 pt-2 border-t border-[#E5E5E5] text-xs">
              <span className="font-bold text-[#262626] uppercase tracking-wider block">
                Update Status
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { status: 'reviewing', label: 'Mark Reviewing' },
                  { status: 'planned', label: 'Mark Planned' },
                  { status: 'in_progress', label: 'In Progress' },
                  { status: 'resolved', label: 'Mark Resolved' },
                  { status: 'closed', label: 'Close' }
                ].map(action => (
                  <button
                    key={action.status}
                    onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, action.status as FeedbackStatus)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                      selectedFeedback.status === action.status
                        ? 'bg-[#E63946] text-white'
                        : 'bg-white border border-[#E5E5E5] text-[#262626] hover:bg-[#FFF8F8]'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Admin Response Form */}
            <div className="space-y-2 pt-2 border-t border-[#E5E5E5] text-xs">
              <span className="font-bold text-[#262626] uppercase tracking-wider block">
                Reply to Student
              </span>
              <textarea
                rows={3}
                value={adminReplyText}
                onChange={(e) => setAdminReplyText(e.target.value)}
                placeholder="Write an official response (e.g. Thanks! We have added this to our mobile update schedule)..."
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  disabled={updatingFeedback || !adminReplyText.trim()}
                  onClick={() => handleUpdateFeedbackStatus(selectedFeedback.id, selectedFeedback.status, selectedFeedback.priority, adminReplyText)}
                  className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reply & Notify Student</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Broadcast Announcement */}
      <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-[#E63946]" />
          <div>
            <h2 className="font-heading font-semibold text-base text-[#262626]">
              Broadcast Campus Announcement
            </h2>
            <p className="text-xs text-[#666666]">
              Sends high-priority notification to all verified university students
            </p>
          </div>
        </div>

        {announcementSent && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Announcement successfully broadcasted to all campus student profiles!</span>
          </div>
        )}

        <form onSubmit={handleBroadcastAnnouncement} className="space-y-3">
          <textarea
            rows={3}
            required
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="Type official notification message (e.g. Mid-term exam schedule announced, Library hours extended for revision week)..."
            className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition shadow-xs"
          >
            Send Campus Broadcast
          </button>
        </form>
      </section>

    </div>
  );
};
