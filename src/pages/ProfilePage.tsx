import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { StudentProfile, ConnectionRequest } from '../types';
import { dataService } from '../services/dataService';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  CheckCircle2, 
  Edit3,
  Save,
  Calendar,
  Layers,
  Users,
  Check,
  Camera,
  MessageSquare,
  Rocket,
  ArrowRight,
  UserCheck,
  UserPlus,
  Upload,
  Trash2,
  Sparkles
} from 'lucide-react';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { ProfilePhotoUploadModal } from '../components/ProfilePhotoUploadModal';
import { followService } from '../services/followService';

interface Props {
  currentUser: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
}

export const ProfilePage: React.FC<Props> = ({ currentUser: propUser, onProfileUpdated }) => {
  const { studentProfile, updateProfileData } = useAuth();
  const currentUser = studentProfile || propUser;
  const { userId } = useParams<{ userId?: string }>();
  const isOwnProfile = !userId || userId === currentUser?.id;

  // State for viewing another user's profile
  const [targetStudent, setTargetStudent] = useState<StudentProfile | null>(null);
  const [loadingTarget, setLoadingTarget] = useState(!isOwnProfile);
  const [isFollowingTarget, setIsFollowingTarget] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [targetFollowStats, setTargetFollowStats] = useState({ followersCount: 0, followingCount: 0 });

  const [activeTab, setActiveTab] = useState<'projects' | 'communities' | 'events' | 'connections'>('projects');
  
  // Edit mode for overview (own profile)
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [bio, setBio] = useState(currentUser?.bio || '');
  const [college, setCollege] = useState(currentUser?.college || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [year, setYear] = useState<StudentProfile['year']>(currentUser?.year || '1st Year');
  const [availability, setAvailability] = useState<StudentProfile['availability']>(currentUser?.availability || 'Available for projects');
  const [interests, setInterests] = useState(currentUser?.interests?.join(', ') || '');
  const [skills, setSkills] = useState(currentUser?.skills || []);

  // Looking for list
  const [lookingForList, setLookingForList] = useState<string[]>(
    currentUser?.lookingFor || ['Project teammate', 'Coding partner', 'Hackathon squad']
  );
  const [newLookingForItem, setNewLookingForItem] = useState('');

  // Follow stats for own profile
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);

  // Sync state when own currentUser changes
  useEffect(() => {
    if (isOwnProfile && currentUser) {
      setName(currentUser.name || '');
      setBio(currentUser.bio || '');
      setCollege(currentUser.college || '');
      setDepartment(currentUser.department || '');
      setYear(currentUser.year || '1st Year');
      setAvailability(currentUser.availability || 'Available for projects');
      setInterests(currentUser.interests?.join(', ') || '');
      setSkills(currentUser.skills || []);
      setLookingForList(currentUser.lookingFor || ['Project teammate', 'Coding partner', 'Hackathon squad']);
      followService.getFollowStats(currentUser.id).then(setFollowStats);
    }
  }, [isOwnProfile, currentUser]);

  // Load other student's profile when visiting /profile/:userId
  useEffect(() => {
    if (!isOwnProfile && userId) {
      let isMounted = true;
      setLoadingTarget(true);

      Promise.all([
        firestoreService.getStudentProfile(userId),
        currentUser?.id ? followService.isFollowing(currentUser.id, userId) : Promise.resolve(false),
        followService.getFollowStats(userId)
      ])
        .then(([profile, isFollowing, stats]) => {
          if (!isMounted) return;
          if (profile) {
            setTargetStudent(profile);
          } else {
            // Check fallback from local dataService if present
            const localStudent = dataService.getStudentById(userId);
            setTargetStudent(localStudent || null);
          }
          setIsFollowingTarget(isFollowing);
          setTargetFollowStats(stats);
          setLoadingTarget(false);
        })
        .catch(err => {
          console.error('Failed to load profile for user:', userId, err);
          if (isMounted) {
            const localStudent = dataService.getStudentById(userId);
            setTargetStudent(localStudent || null);
            setLoadingTarget(false);
          }
        });

      return () => {
        isMounted = false;
      };
    }
  }, [isOwnProfile, userId, currentUser?.id]);

  const handleToggleFollowTarget = async () => {
    if (!currentUser?.id || !targetStudent || followLoading) return;
    setFollowLoading(true);
    try {
      if (isFollowingTarget) {
        await followService.unfollowUser(currentUser.id, targetStudent.id);
        setIsFollowingTarget(false);
        setTargetFollowStats(prev => ({ ...prev, followersCount: Math.max(0, prev.followersCount - 1) }));
      } else {
        await followService.followUser(currentUser.id, targetStudent.id, currentUser, targetStudent);
        setIsFollowingTarget(true);
        setTargetFollowStats(prev => ({ ...prev, followersCount: prev.followersCount + 1 }));
      }
    } catch (err) {
      console.error('Follow toggle error:', err);
    } finally {
      setFollowLoading(false);
    }
  };

  // Projects, Events, Communities
  const displayUser = isOwnProfile ? currentUser : targetStudent;

  const myProjects = displayUser ? dataService.getAllProjects().filter(
    p => p.creatorId === displayUser.id || p.roles.some(r => r.assignedStudentId === displayUser.id)
  ) : [];
  const registeredEvents = dataService.getAllEvents().filter(e => e.isRegistered);
  const joinedCommunities = dataService.getAllCommunities().filter(c => c.isJoined);
  const [connections, setConnections] = useState<ConnectionRequest[]>(
    currentUser ? dataService.getConnectionsForUser(currentUser.id) : []
  );

  const handleAvatarSelected = (newAvatarUrl: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, avatar: newAvatarUrl, photoURL: newAvatarUrl };
    dataService.updateProfile(updated);
    updateProfileData(updated);
    onProfileUpdated(updated);
  };

  const handlePhotoUploaded = (downloadUrl: string) => {
    if (!currentUser) return;
    const updated: StudentProfile = { 
      ...currentUser, 
      avatar: downloadUrl, 
      photoURL: downloadUrl 
    };
    dataService.updateProfile(updated);
    updateProfileData(updated);
    onProfileUpdated(updated);
  };

  const handlePhotoRemoved = () => {
    if (!currentUser) return;
    const defaultAvatar = '/avatars/avatar-1.png';
    const updated: StudentProfile = { 
      ...currentUser, 
      avatar: defaultAvatar, 
      photoURL: '' 
    };
    dataService.updateProfile(updated);
    updateProfileData(updated);
    firestoreService.removeProfilePhoto(currentUser.id);
    onProfileUpdated(updated);
  };

  const handleSave = () => {
    if (!currentUser) return;
    const updated: StudentProfile = {
      ...currentUser,
      name,
      bio,
      college,
      department,
      year,
      availability,
      interests: interests.split(',').map(s => s.trim()).filter(Boolean),
      skills,
      lookingFor: lookingForList
    };

    dataService.updateProfile(updated);
    updateProfileData(updated);
    onProfileUpdated(updated);
    setIsEditing(false);
  };

  const handleAddLookingFor = () => {
    if (!newLookingForItem.trim() || !currentUser) return;
    const updatedList = [...lookingForList, newLookingForItem.trim()];
    setLookingForList(updatedList);
    setNewLookingForItem('');

    const updatedProfile = { ...currentUser, lookingFor: updatedList };
    dataService.updateProfile(updatedProfile);
    updateProfileData(updatedProfile);
    onProfileUpdated(updatedProfile);
  };

  const handleRemoveLookingFor = (item: string) => {
    if (!currentUser) return;
    const updatedList = lookingForList.filter(i => i !== item);
    setLookingForList(updatedList);
    const updatedProfile = { ...currentUser, lookingFor: updatedList };
    dataService.updateProfile(updatedProfile);
    updateProfileData(updatedProfile);
    onProfileUpdated(updatedProfile);
  };

  const handleCancelEvent = (eventId: string) => {
    dataService.cancelEventRegistration(eventId);
    onProfileUpdated(dataService.getCurrentUser());
  };

  const handleAcceptConnection = (requestId: string) => {
    if (!currentUser) return;
    dataService.acceptConnectionRequest(requestId);
    setConnections(dataService.getConnectionsForUser(currentUser.id));
  };

  const handleRejectConnection = (requestId: string) => {
    if (!currentUser) return;
    dataService.rejectConnectionRequest(requestId);
    setConnections(dataService.getConnectionsForUser(currentUser.id));
  };

  // Loading state when visiting another student's profile
  if (!isOwnProfile && loadingTarget) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-8 animate-pulse space-y-6">
          <div className="flex items-center gap-5">
            <div className="w-24 h-24 rounded-full bg-rose-100" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-48 bg-rose-100 rounded" />
              <div className="h-4 w-32 bg-rose-50 rounded" />
              <div className="h-4 w-40 bg-rose-50 rounded" />
            </div>
          </div>
          <div className="h-16 w-full bg-rose-50 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Not found state when visiting another student
  if (!isOwnProfile && !targetStudent) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-[#FFF1F2] text-[#E63946] flex items-center justify-center mx-auto">
          <Users className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-bold text-2xl text-[#262626]">Student Not Found</h2>
        <p className="text-sm text-[#666666]">
          This student profile may have been removed or does not exist yet.
        </p>
        <Link
          to="/discover"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl text-xs font-semibold transition shadow-xs"
        >
          <span>Back to Discover</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const activeStudent = isOwnProfile ? currentUser : targetStudent!;
  const currentStats = isOwnProfile ? followStats : targetFollowStats;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      
      {/* ======================================================== */}
      {/* 1. SOCIAL PROFILE HEADER                                 */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 shadow-xs relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          
          <div className="flex items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar */}
            {isOwnProfile ? (
              <div 
                className="relative group cursor-pointer shrink-0"
                onClick={() => setPhotoModalOpen(true)}
                title="Click to upload profile photo"
              >
                <img
                  src={activeStudent.avatar}
                  alt={activeStudent.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#FFE4E6] p-0.5 bg-white shadow-xs group-hover:border-[#E63946] transition"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition text-[10px] font-semibold">
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span>Upload</span>
                </div>
              </div>
            ) : (
              <div className="shrink-0">
                <img
                  src={activeStudent.avatar}
                  alt={activeStudent.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-[#FFE4E6] p-0.5 bg-white shadow-xs"
                />
              </div>
            )}

            {/* Core Info */}
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#262626]">
                  {activeStudent.name}
                </h1>
                {activeStudent.isAdmin && (
                  <span className="text-[10px] font-bold bg-rose-50 text-[#E63946] px-2.5 py-0.5 rounded-full border border-rose-200">
                    College Admin
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#666666] font-medium">
                {activeStudent.department} • {activeStudent.year}
              </p>

              <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                <MapPin className="w-3.5 h-3.5 text-[#999999]" />
                <span>{activeStudent.college}</span>
              </div>

              {/* Social Follower / Following Stats */}
              <div className="flex items-center gap-4 text-xs font-semibold text-[#262626] pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E63946] font-bold">{currentStats.followersCount}</span>
                  <span className="text-[#666666]">Followers</span>
                </div>
                <span className="text-[#E5E5E5]">•</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[#E63946] font-bold">{currentStats.followingCount}</span>
                  <span className="text-[#666666]">Following</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            {isOwnProfile ? (
              <>
                {/* Add / Change Profile Photo Button */}
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946] text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer min-h-[44px]"
                  title="Upload or change profile photo"
                >
                  <Camera className="w-4 h-4" />
                  <span>
                    {currentUser?.photoURL && !currentUser.photoURL.startsWith('/avatars/')
                      ? 'Change Photo'
                      : 'Add Profile Photo'}
                  </span>
                </button>

                {/* Remove Photo Button (if custom photo is active) */}
                {currentUser?.photoURL && !currentUser.photoURL.startsWith('/avatars/') && (
                  <button
                    type="button"
                    onClick={handlePhotoRemoved}
                    className="p-2.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl transition cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    title="Remove photo and return to default avatar"
                    aria-label="Remove profile photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <Link
                  to="/messages"
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-[#E5E5E5] hover:bg-[#FFF8F8] text-[#262626] text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer min-h-[44px]"
                >
                  <MessageSquare className="w-4 h-4 text-[#666666]" />
                  <span>Messages</span>
                </Link>

                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-white border border-[#E5E5E5] hover:border-[#FECDD3] hover:bg-[#FFF8F8] text-[#262626] text-xs font-semibold px-3.5 py-2.5 rounded-xl transition cursor-pointer min-h-[44px]"
                  >
                    <Edit3 className="w-4 h-4 text-[#E63946]" />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 sm:flex-none px-3.5 py-2.5 border border-[#E5E5E5] rounded-xl text-xs font-medium text-[#666666] hover:bg-[#FFF8F8] min-h-[44px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white rounded-xl text-xs font-semibold shadow-xs min-h-[44px]"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Follow Button for Other Student */}
                <button
                  onClick={handleToggleFollowTarget}
                  disabled={followLoading}
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer ${
                    isFollowingTarget
                      ? 'bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5] hover:border-rose-300'
                      : 'bg-[#E63946] hover:bg-[#D62839] text-white shadow-xs'
                  }`}
                >
                  {isFollowingTarget ? (
                    <>
                      <UserCheck className="w-4 h-4 text-emerald-600" />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>

                {/* Message Button for Other Student */}
                <Link
                  to={`/messages?userId=${activeStudent.id}`}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946] text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Message</span>
                </Link>
              </>
            )}
          </div>

        </div>

        {/* Bio */}
        {activeStudent.bio && (
          <div className="mt-4 pt-4 border-t border-[#E5E5E5]">
            <p className="text-xs sm:text-sm text-[#444444] leading-relaxed">
              "{activeStudent.bio}"
            </p>
          </div>
        )}

        {/* Skills & Looking For Chips */}
        <div className="mt-4 pt-4 border-t border-[#E5E5E5] flex flex-col md:flex-row gap-4 justify-between">
          {/* Skills */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666] block">
              Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {activeStudent.skills && activeStudent.skills.length > 0 ? (
                activeStudent.skills.map((sk) => (
                  <span
                    key={sk.name}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6] inline-flex items-center gap-1"
                  >
                    <span>{sk.name}</span>
                    {sk.verified && <CheckCircle2 className="w-3 h-3 text-[#E63946]" />}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#999999] italic">No skills listed</span>
              )}
            </div>
          </div>

          {/* Looking For */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#666666] block">
              Looking For
            </span>
            <div className="flex flex-wrap gap-1.5">
              {isOwnProfile ? (
                lookingForList.map((item) => (
                  <span
                    key={item}
                    className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5] inline-flex items-center gap-1"
                  >
                    <span>{item}</span>
                    {isEditing && (
                      <button
                        onClick={() => handleRemoveLookingFor(item)}
                        className="text-rose-500 hover:text-rose-700 ml-0.5"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))
              ) : (
                activeStudent.lookingFor && activeStudent.lookingFor.length > 0 ? (
                  activeStudent.lookingFor.map((item) => (
                    <span
                      key={item}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5]"
                    >
                      {item}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#999999] italic">Open to opportunities</span>
                )
              )}
            </div>

            {isOwnProfile && isEditing && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newLookingForItem}
                  onChange={(e) => setNewLookingForItem(e.target.value)}
                  placeholder="Add what you're looking for..."
                  className="text-xs p-1.5 bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLookingFor();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddLookingFor}
                  className="px-2.5 py-1.5 bg-[#E63946] text-white text-xs font-semibold rounded-lg"
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Mode Inputs (own profile only) */}
        {isOwnProfile && isEditing && (
          <div className="mt-6 pt-6 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Profile Photo Controls */}
            <div className="sm:col-span-2 p-3.5 bg-[#FFF8F8] border border-[#E5E5E5] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={currentUser.avatar}
                  alt="Profile"
                  className="w-12 h-12 rounded-full object-cover border-2 border-[#FFE4E6] p-0.5 bg-white"
                />
                <div>
                  <p className="text-xs font-bold text-[#262626]">Profile Photo</p>
                  <p className="text-[11px] text-[#666666]">
                    Upload a custom JPG/PNG/WEBP photo or choose an illustrated avatar
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPhotoModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer min-h-[38px]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white border border-[#E5E5E5] hover:bg-[#FFF1F2] text-[#262626] text-xs font-semibold rounded-xl transition cursor-pointer min-h-[38px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Avatars</span>
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-2.5 text-xs text-[#262626]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-2.5 text-xs text-[#262626]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#262626] mb-1">Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-2.5 text-xs text-[#262626]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#262626] mb-1">Interests (comma separated)</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-xl p-2.5 text-xs text-[#262626]"
              />
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. TABS: PROJECTS, COMMUNITIES, EVENTS, CONNECTIONS      */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] overflow-x-auto pb-1">
        {[
          { id: 'projects', label: `Projects (${myProjects.length})`, icon: Rocket, show: true },
          { id: 'communities', label: `Communities (${joinedCommunities.length})`, icon: Layers, show: true },
          { id: 'events', label: `Events (${registeredEvents.length})`, icon: Calendar, show: isOwnProfile },
          { id: 'connections', label: `Connections (${connections.length})`, icon: Users, show: isOwnProfile }
        ].filter(t => t.show).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
                isActive
                  ? 'border-[#E63946] text-[#E63946]'
                  : 'border-transparent text-[#666666] hover:text-[#262626]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROJECTS */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#262626]">
              {isOwnProfile ? 'My Projects & Teams' : `${activeStudent.name}'s Projects`}
            </h3>
            <Link to="/projects" className="text-xs text-[#E63946] font-semibold hover:underline flex items-center gap-1">
              <span>Browse All Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myProjects.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-2xl text-xs text-[#666666] space-y-2">
              <p>{isOwnProfile ? "You haven't posted any projects yet." : "No projects posted yet."}</p>
              {isOwnProfile && (
                <Link
                  to="/projects"
                  className="inline-block px-4 py-2 bg-[#E63946] text-white rounded-xl font-semibold shadow-xs"
                >
                  Explore Projects
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myProjects.map((p) => (
                <div
                  key={p.id}
                  className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                      {p.category}
                    </span>
                    <h4 className="font-heading font-bold text-base text-[#262626]">
                      {p.title}
                    </h4>
                    <p className="text-xs text-[#666666] line-clamp-2">
                      {p.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#E5E5E5]">
                    <span className="text-xs text-[#666666]">
                      {p.roles.filter(r => !r.isFilled).length} roles open
                    </span>
                    <Link
                      to={`/projects/${p.id}`}
                      className="text-xs font-semibold text-[#E63946] hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: COMMUNITIES */}
      {activeTab === 'communities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#262626]">
              {isOwnProfile ? 'My Joined Communities' : `${activeStudent.name}'s Communities`}
            </h3>
            <Link to="/communities" className="text-xs text-[#E63946] font-semibold hover:underline flex items-center gap-1">
              <span>Explore More Communities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {joinedCommunities.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-2xl text-xs text-[#666666]">
              {isOwnProfile
                ? "You haven't joined any campus communities yet. Join one today!"
                : "No public communities joined yet."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {joinedCommunities.map((c) => (
                <div key={c.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={c.avatar && c.avatar.startsWith('http') ? c.avatar : '/campusly-logo.jpg'}
                      alt=""
                      className="w-10 h-10 rounded-xl object-cover border border-[#E5E5E5]"
                    />
                    <div>
                      <h4 className="font-heading font-bold text-xs sm:text-sm text-[#262626]">{c.name}</h4>
                      <p className="text-[11px] text-[#666666]">{c.memberCount} members</p>
                    </div>
                  </div>
                  <Link to={`/communities/${c.id}`} className="px-3 py-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946] text-xs font-semibold rounded-xl">
                    Visit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: EVENTS (own profile only) */}
      {isOwnProfile && activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#262626]">Registered Events & Workshops</h3>
            <Link to="/events" className="text-xs text-[#E63946] font-semibold hover:underline flex items-center gap-1">
              <span>Browse All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {registeredEvents.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-2xl text-xs text-[#666666]">
              You have not registered for any events yet. Check out the Events catalog!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {registeredEvents.map((e) => (
                <div key={e.id} className="bg-white border border-[#E5E5E5] rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Confirmed Ticket ✓
                    </span>
                    <h4 className="font-heading font-bold text-sm text-[#262626]">{e.title}</h4>
                    <p className="text-xs text-[#666666]">{e.date} • {e.time}</p>
                    <p className="text-xs text-[#999999]">{e.location}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                    <Link to={`/events/${e.id}`} className="text-xs text-[#E63946] font-semibold hover:underline">
                      View Details
                    </Link>
                    <button
                      onClick={() => handleCancelEvent(e.id)}
                      className="text-xs text-rose-600 hover:underline cursor-pointer"
                    >
                      Cancel Registration
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CONNECTIONS (own profile only) */}
      {isOwnProfile && activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-base text-[#262626]">Campus Connections</h3>
            <Link to="/students" className="text-xs text-[#E63946] font-semibold hover:underline flex items-center gap-1">
              <span>Find More Peers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {connections.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-2xl text-xs text-[#666666]">
                No connections yet. Connect with students in the directory!
              </div>
            ) : (
              connections.map((c) => {
                const isIncomingPending = c.toId === currentUser.id && c.status === 'pending';
                const isOutgoingPending = c.fromId === currentUser.id && c.status === 'pending';
                const isAccepted = c.status === 'accepted';

                return (
                  <div key={c.id} className="p-4 bg-white border border-[#E5E5E5] rounded-2xl flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <img src={c.fromAvatar} alt="" className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]" />
                      <div>
                        <h4 className="font-heading font-bold text-xs sm:text-sm text-[#262626]">{c.fromName}</h4>
                        <p className="text-[11px] text-[#666666]">{c.fromDepartment} • {c.fromCollege}</p>
                        {c.note && <p className="text-[11px] text-[#999999] italic mt-0.5">"{c.note}"</p>}
                      </div>
                    </div>

                    <div>
                      {isIncomingPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptConnection(c.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectConnection(c.id)}
                            className="px-3 py-1.5 bg-white border border-[#E5E5E5] text-[#666666] hover:text-[#262626] rounded-xl text-xs font-medium cursor-pointer"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {isOutgoingPending && (
                        <span className="text-[11px] text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 font-medium">
                          Request Pending
                        </span>
                      )}

                      {isAccepted && (
                        <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Avatar Selection Modal (own profile only) */}
      {isOwnProfile && (
        <AvatarPickerModal
          isOpen={avatarModalOpen}
          onClose={() => setAvatarModalOpen(false)}
          currentAvatar={currentUser.avatar}
          onSelectAvatar={handleAvatarSelected}
        />
      )}

      {/* Profile Photo Upload Modal (own profile only) */}
      {isOwnProfile && currentUser && (
        <ProfilePhotoUploadModal
          isOpen={photoModalOpen}
          onClose={() => setPhotoModalOpen(false)}
          userId={currentUser.id}
          currentPhotoUrl={currentUser.photoURL || currentUser.avatar}
          onPhotoUploaded={handlePhotoUploaded}
          onPhotoRemoved={handlePhotoRemoved}
        />
      )}
    </div>
  );
};
