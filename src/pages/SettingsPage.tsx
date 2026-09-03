import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updatePassword, deleteUser } from '../services/firebase';
import { 
  Shield, 
  Lock, 
  Mail, 
  AlertTriangle, 
  CheckCircle2, 
  LogOut, 
  KeyRound, 
  Trash2, 
  X,
  UserCheck,
  Camera,
  UserX,
  MessageSquareHeart,
  ExternalLink,
  Clock
} from 'lucide-react';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { chatService } from '../services/chatService';
import { dataService } from '../services/dataService';
import { feedbackService } from '../services/feedbackService';
import { FeedbackItem } from '../types';

export const SettingsPage: React.FC = () => {
  const { currentUser, studentProfile, updateProfileData, logout } = useAuth();
  const navigate = useNavigate();

  // Avatar picker modal
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);

  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [pwMessage, setPwMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Privacy & Safety states
  const uid = currentUser?.uid || studentProfile?.id || '';
  const [privacySettings, setPrivacySettings] = useState(() => chatService.getPrivacySettings(uid));
  const [blockedUserIds, setBlockedUserIds] = useState<string[]>(() => chatService.getBlockedUsers(uid));
  const [privacySaved, setPrivacySaved] = useState(false);

  // My Feedback state
  const [myFeedback, setMyFeedback] = useState<FeedbackItem[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  useEffect(() => {
    if (uid) {
      setLoadingFeedback(true);
      feedbackService.getMyFeedback(uid).then((items) => {
        setMyFeedback(items);
        setLoadingFeedback(false);
      });
    }
  }, [uid]);

  const handleSavePrivacy = (newSettings: Partial<typeof privacySettings>) => {
    const updated = { ...privacySettings, ...newSettings };
    setPrivacySettings(updated);
    chatService.updatePrivacySettings(uid, updated);
    setPrivacySaved(true);
    setTimeout(() => setPrivacySaved(false), 2000);
  };

  const handleUnblockUser = async (targetUid: string) => {
    await chatService.unblockUser(uid, targetUid);
    setBlockedUserIds(prev => prev.filter(id => id !== targetUid));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);

    if (newPassword.length < 6) {
      setPwMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    if (!currentUser) return;

    setPwLoading(true);
    try {
      await updatePassword(currentUser, newPassword);
      setPwMessage({ text: 'Password successfully updated!', type: 'success' });
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setPwMessage({
          text: 'This operation is sensitive and requires recent login. Please log out and log back in before retrying.',
          type: 'error'
        });
      } else {
        setPwMessage({ text: err.message || 'Failed to update password.', type: 'error' });
      }
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;
    if (!currentUser) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await deleteUser(currentUser);
      await logout();
      navigate('/login', { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setDeleteError('Account deletion requires recent authentication. Please log out, log back in, and retry.');
      } else {
        setDeleteError(err.message || 'Failed to delete account.');
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
          Account Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#666666]">
          Manage your account credentials, password, and security settings
        </p>
      </div>

      <div className="space-y-6">
        
        {/* Account Information Card */}
        <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <h2 className="font-heading font-semibold text-base text-[#262626] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#E63946]" />
              <span>Profile Identity</span>
            </h2>

            <button
              type="button"
              onClick={() => setAvatarModalOpen(true)}
              className="text-xs text-[#E63946] hover:underline font-medium flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Profile Avatar</span>
            </button>
          </div>

          <div className="flex items-center gap-4 p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5]">
            <div 
              className="relative group cursor-pointer shrink-0"
              onClick={() => setAvatarModalOpen(true)}
              title="Click to change avatar"
            >
              <img
                src={studentProfile?.avatar || '/avatars/avatar-1.png'}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover border-2 border-[#FFE4E6] p-0.5 bg-white shadow-xs group-hover:border-[#E63946] transition"
              />
              <div className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition text-[10px]">
                <Camera className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="font-semibold text-sm text-[#262626]">
                {studentProfile?.name || currentUser?.displayName || 'Campus Student'}
              </div>
              <p className="text-xs text-[#666666]">
                Illustrated Student Avatar
              </p>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(true)}
                className="mt-1 text-[11px] text-[#E63946] hover:underline font-medium"
              >
                Pick from 28 custom avatars →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-1">
              <span className="text-[#666666]">Student Name</span>
              <div className="font-semibold text-sm text-[#262626]">
                {studentProfile?.name || currentUser?.displayName || 'Campus Student'}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-1">
              <span className="text-[#666666]">Registered University Email</span>
              <div className="font-semibold text-sm text-[#262626]">
                {currentUser?.email}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-1">
              <span className="text-[#666666]">University & Campus</span>
              <div className="font-semibold text-sm text-[#262626]">
                {studentProfile?.college}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-1">
              <span className="text-[#666666]">Department & Year</span>
              <div className="font-semibold text-sm text-[#262626]">
                {studentProfile?.department} • {studentProfile?.year}
              </div>
            </div>
          </div>
        </section>

        {/* Change Password Card */}
        <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
          <h2 className="font-heading font-semibold text-base text-[#262626] flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#E63946]" />
            <span>Change Password</span>
          </h2>

          {pwMessage && (
            <div
              className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                pwMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}
            >
              {pwMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{pwMessage.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">
                New Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs sm:text-sm text-[#262626] focus:outline-none focus:border-[#FECDD3]"
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading}
              className="px-5 py-2.5 bg-[#E63946] hover:bg-[#D62839] disabled:opacity-50 text-white text-xs font-medium rounded-xl transition shadow-xs"
            >
              {pwLoading ? 'Updating password...' : 'Update Password'}
            </button>
          </form>
        </section>

        {/* Privacy & Messaging Safety */}
        <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <h2 className="font-heading font-semibold text-base text-[#262626] flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#E63946]" />
              <span>Privacy & Messaging Safety</span>
            </h2>

            {privacySaved && (
              <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Who can follow me */}
            <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-2">
              <label className="font-semibold text-[#262626] block">
                Who can follow me?
              </label>
              <select
                value={privacySettings.whoCanFollow}
                onChange={(e) => handleSavePrivacy({ whoCanFollow: e.target.value as any })}
                className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none"
              >
                <option value="Everyone">Everyone on Campusly</option>
                <option value="Campus students only">Students from my campus only</option>
              </select>
            </div>

            {/* Who can send me message requests */}
            <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-2">
              <label className="font-semibold text-[#262626] block">
                Who can send me message requests?
              </label>
              <select
                value={privacySettings.whoCanMessage}
                onChange={(e) => handleSavePrivacy({ whoCanMessage: e.target.value as any })}
                className="w-full bg-white border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none"
              >
                <option value="Everyone">Everyone</option>
                <option value="Campus students only">Same campus students only</option>
                <option value="Students I follow">Students I follow only</option>
              </select>
            </div>

            {/* Show Online Status */}
            <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <label className="font-semibold text-[#262626] block">
                  Show my online status
                </label>
                <p className="text-[11px] text-[#666666]">
                  Displays active green dot next to your avatar
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSavePrivacy({ showOnlineStatus: !privacySettings.showOnlineStatus })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  privacySettings.showOnlineStatus
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                }`}
              >
                {privacySettings.showOnlineStatus ? 'ON' : 'OFF'}
              </button>
            </div>

            {/* Show profile in Discover */}
            <div className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] flex items-center justify-between">
              <div>
                <label className="font-semibold text-[#262626] block">
                  Show profile in Discover
                </label>
                <p className="text-[11px] text-[#666666]">
                  Visible in student searches and campus directory
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSavePrivacy({ showInDiscover: !privacySettings.showInDiscover })}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  privacySettings.showInDiscover
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                }`}
              >
                {privacySettings.showInDiscover ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>

          {/* Blocked Users Section */}
          <div className="pt-3 border-t border-[#E5E5E5] space-y-2">
            <h3 className="font-semibold text-xs text-[#262626] flex items-center gap-1.5">
              <UserX className="w-3.5 h-3.5 text-rose-600" />
              <span>Blocked Students ({blockedUserIds.length})</span>
            </h3>

            {blockedUserIds.length === 0 ? (
              <p className="text-xs text-[#666666]">
                You have not blocked any students.
              </p>
            ) : (
              <div className="space-y-2">
                {blockedUserIds.map((bUid) => (
                  <div 
                    key={bUid}
                    className="p-3 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] flex items-center justify-between text-xs"
                  >
                    <span className="font-medium text-[#262626]">Student (ID: {bUid})</span>
                    <button
                      type="button"
                      onClick={() => handleUnblockUser(bUid)}
                      className="px-3 py-1 bg-white border border-[#E5E5E5] hover:border-[#FECDD3] text-rose-600 rounded-lg font-semibold transition"
                    >
                      Unblock
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* My Feedback Submissions */}
        <section className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
            <div className="space-y-0.5">
              <h2 className="font-heading font-semibold text-base text-[#262626] flex items-center gap-2">
                <MessageSquareHeart className="w-5 h-5 text-[#E63946]" />
                <span>My Feedback & Submissions</span>
              </h2>
              <p className="text-xs text-[#666666]">
                Track the status of bugs, feature ideas, and suggestions you've sent to the team.
              </p>
            </div>

            <Link
              to="/feedback"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946] rounded-xl text-xs font-semibold transition"
            >
              <span>Give Feedback</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingFeedback ? (
            <div className="py-6 text-center text-xs text-[#666666]">
              Loading your feedback history...
            </div>
          ) : myFeedback.length === 0 ? (
            <div className="p-6 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] text-center space-y-2">
              <p className="text-xs text-[#666666]">
                You haven't submitted any feedback yet. Help us make Campusly better!
              </p>
              <Link
                to="/feedback"
                className="inline-block text-xs font-semibold text-[#E63946] hover:underline"
              >
                Send your first idea or report a bug →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {myFeedback.map((item) => (
                <div 
                  key={item.id}
                  className="p-4 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] space-y-2.5 text-xs"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-md bg-white border border-[#E5E5E5] text-[#262626]">
                        {item.type === 'bug' ? '🐛 Bug' : item.type === 'feature' ? '💡 Feature' : '💬 ' + item.type}
                      </span>
                      {item.page && (
                        <span className="text-[11px] text-[#666666]">
                          in {item.page}
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border capitalize ${
                      item.status === 'resolved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : item.status === 'planned'
                        ? 'bg-purple-50 text-purple-700 border-purple-200'
                        : item.status === 'reviewing' || item.status === 'in_progress'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {item.status === 'new' ? 'Submitted' : item.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-[#262626] font-medium leading-relaxed">
                    "{item.message}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-[#999999] pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </span>
                    {item.anonymous && <span>Submitted anonymously</span>}
                  </div>

                  {/* Admin Reply */}
                  {item.adminResponse && (
                    <div className="mt-2 p-3 rounded-xl bg-white border border-rose-100 space-y-1">
                      <div className="flex items-center gap-1.5 text-[#E63946] font-semibold text-[11px]">
                        <span>Reply from {item.adminResponse.respondedBy}:</span>
                      </div>
                      <p className="text-[#262626] leading-relaxed">
                        {item.adminResponse.message}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Danger Zone */}
        <section className="bg-white border border-rose-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="w-5 h-5" />
            <h2 className="font-heading font-semibold text-base text-rose-700">
              Danger Zone
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div>
              <h3 className="font-semibold text-sm text-[#262626]">Delete Student Account</h3>
              <p className="text-xs text-[#666666]">
                Permanently delete your profile, team applications, and community memberships.
              </p>
            </div>

            <button
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-medium rounded-xl transition shrink-0"
            >
              Delete Account
            </button>
          </div>
        </section>

      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-2xl w-full max-w-md p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-2 text-rose-600">
                <Trash2 className="w-5 h-5" />
                <h3 className="font-heading font-semibold text-base text-rose-700">
                  Delete Campusly Account
                </h3>
              </div>
              <button onClick={() => setDeleteModalOpen(false)} className="text-[#999999] hover:text-[#262626]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#666666] leading-relaxed">
              This action <strong>cannot</strong> be undone. Please type <span className="font-bold text-[#262626]">DELETE</span> below to confirm.
            </p>

            {deleteError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {deleteError}
              </div>
            )}

            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE"
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl px-3 py-2 text-xs text-[#262626] focus:outline-none"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-[#E5E5E5]">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-[#E5E5E5] rounded-xl text-xs text-[#666666]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmation !== 'DELETE' || deleteLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-semibold"
              >
                {deleteLoading ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={studentProfile?.avatar || '/avatars/avatar-1.png'}
        onSelectAvatar={(newAvatar) => {
          updateProfileData({ avatar: newAvatar });
        }}
      />

    </div>
  );
};
