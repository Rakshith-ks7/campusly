import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StudentProfile, CampusEvent, Community, ConnectionRequest } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Clock, 
  CheckCircle2, 
  FolderGit2, 
  Edit3,
  Save,
  X,
  Plus,
  Globe,
  Calendar,
  Layers,
  Users,
  Check,
  HeartHandshake,
  Camera,
  MessageSquare
} from 'lucide-react';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { followService } from '../services/followService';

interface Props {
  currentUser: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
}

export const ProfilePage: React.FC<Props> = ({ currentUser: propUser, onProfileUpdated }) => {
  const { studentProfile, updateProfileData } = useAuth();
  const currentUser = studentProfile || propUser;
  const [activeTab, setActiveTab] = useState<'overview' | 'lookingFor' | 'events' | 'communities' | 'connections'>('overview');
  
  // Edit mode for overview
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [bio, setBio] = useState(currentUser.bio);
  const [college, setCollege] = useState(currentUser.college);
  const [department, setDepartment] = useState(currentUser.department);
  const [year, setYear] = useState<StudentProfile['year']>(currentUser.year);
  const [availability, setAvailability] = useState<StudentProfile['availability']>(currentUser.availability);
  const [interests, setInterests] = useState(currentUser.interests.join(', '));
  const [newSkillName, setNewSkillName] = useState('');
  const [skills, setSkills] = useState(currentUser.skills);

  // Looking for list
  const [lookingForList, setLookingForList] = useState<string[]>(
    currentUser.lookingFor || ['Project teammate', 'Coding partner', 'DSA partner']
  );
  const [newLookingForItem, setNewLookingForItem] = useState('');

  // Events & Communities & Connections from dataService
  const registeredEvents = dataService.getAllEvents().filter(e => e.isRegistered);
  const joinedCommunities = dataService.getAllCommunities().filter(c => c.isJoined);
  const [connections, setConnections] = useState<ConnectionRequest[]>(
    dataService.getConnectionsForUser(currentUser.id)
  );
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [followStats, setFollowStats] = useState({ followersCount: 0, followingCount: 0 });

  useEffect(() => {
    followService.getFollowStats(currentUser.id).then(setFollowStats);
  }, [currentUser.id]);

  const handleAvatarSelected = (newAvatarUrl: string) => {
    const updated = { ...currentUser, avatar: newAvatarUrl };
    dataService.updateProfile(updated);
    updateProfileData(updated);
    onProfileUpdated(updated);
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;
    setSkills([
      ...skills,
      {
        name: newSkillName.trim(),
        category: 'Programming',
        level: 'Intermediate',
        years: 1,
        verified: false
      }
    ]);
    setNewSkillName('');
  };

  const handleRemoveSkill = (skillNameToRemove: string) => {
    setSkills(skills.filter(s => s.name !== skillNameToRemove));
  };

  const handleSave = () => {
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
    if (!newLookingForItem.trim()) return;
    const updatedList = [...lookingForList, newLookingForItem.trim()];
    setLookingForList(updatedList);
    setNewLookingForItem('');

    const updatedProfile = { ...currentUser, lookingFor: updatedList };
    dataService.updateProfile(updatedProfile);
    updateProfileData(updatedProfile);
    onProfileUpdated(updatedProfile);
  };

  const handleRemoveLookingFor = (item: string) => {
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
    dataService.acceptConnectionRequest(requestId);
    setConnections(dataService.getConnectionsForUser(currentUser.id));
  };

  const handleRejectConnection = (requestId: string) => {
    dataService.rejectConnectionRequest(requestId);
    setConnections(dataService.getConnectionsForUser(currentUser.id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Profile Overview Card */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs relative">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="relative group cursor-pointer shrink-0"
              onClick={() => setAvatarModalOpen(true)}
              title="Click to choose a new avatar"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#FFE4E6] p-0.5 bg-white shadow-xs group-hover:border-[#E63946] transition"
              />
              <div className="absolute inset-0 rounded-full bg-black/35 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition text-[10px] font-medium">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                <span>Change</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading font-bold text-xl sm:text-2xl text-[#262626]">
                  {currentUser.name}
                </h1>
                {currentUser.isAdmin && (
                  <span className="text-[10px] font-semibold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-200">
                    College Admin
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-[#666666]">
                {currentUser.department} • {currentUser.year}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-[#666666] mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#999999]" />
                <span>{currentUser.college}</span>
              </div>

              {/* Follow Stats */}
              <div className="flex items-center gap-4 text-xs font-semibold text-[#262626] mt-2.5">
                <div className="flex items-center gap-1">
                  <span className="text-[#E63946] font-bold">{followStats.followersCount}</span>
                  <span className="text-[#666666]">Followers</span>
                </div>
                <span className="text-[#E5E5E5]">•</span>
                <div className="flex items-center gap-1">
                  <span className="text-[#E63946] font-bold">{followStats.followingCount}</span>
                  <span className="text-[#666666]">Following</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/messages"
              className="flex items-center gap-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946] text-xs font-semibold px-3.5 py-2 rounded-xl transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Messages</span>
            </Link>

            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 bg-white border border-[#E5E5E5] hover:border-[#FECDD3] hover:bg-[#FFF8F8] text-[#262626] text-xs font-medium px-3.5 py-2 rounded-xl transition"
              >
                <Edit3 className="w-3.5 h-3.5 text-[#E63946]" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-2 border border-[#E5E5E5] rounded-lg text-xs text-[#666666]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-4 py-2 bg-[#E63946] text-white rounded-lg text-xs font-medium"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Mode Inputs */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-[#E5E5E5] grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-2 text-xs text-[#262626]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#262626] mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-2 text-xs text-[#262626]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#262626] mb-1">Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-2 text-xs text-[#262626]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[#262626] mb-1">Interests (comma separated)</label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-2 text-xs text-[#262626]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Overview & Skills', icon: Users },
          { id: 'lookingFor', label: `Looking For (${lookingForList.length})`, icon: HeartHandshake },
          { id: 'events', label: `My Events (${registeredEvents.length})`, icon: Calendar },
          { id: 'communities', label: `My Communities (${joinedCommunities.length})`, icon: Layers },
          { id: 'connections', label: `Connections (${connections.length})`, icon: Globe }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-medium border-b-2 whitespace-nowrap transition ${
                isActive
                  ? 'border-[#E63946] text-[#E63946] font-semibold'
                  : 'border-transparent text-[#666666] hover:text-[#262626]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENTS */}

      {/* 1. OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xs space-y-2">
              <h3 className="font-heading font-semibold text-sm sm:text-base text-[#262626]">About</h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">{currentUser.bio}</p>
            </div>

            <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xs space-y-3">
              <h3 className="font-heading font-semibold text-sm sm:text-base text-[#262626]">Skills</h3>
              <div className="flex flex-wrap gap-1.5">
                {currentUser.skills.map(sk => (
                  <span key={sk.name} className="skill-tag">
                    {sk.name}
                    {sk.verified && <CheckCircle2 className="w-3 h-3 text-[#E63946]" />}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-2 text-xs text-[#666666]">
              <div className="font-semibold text-[#262626] mb-1">Campus Details</div>
              <div className="flex justify-between py-1 border-b border-[#E5E5E5]">
                <span>College</span>
                <span className="text-[#262626] font-medium">{currentUser.college}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#E5E5E5]">
                <span>Year</span>
                <span className="text-[#262626] font-medium">{currentUser.year}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Availability</span>
                <span className="text-[#262626] font-medium">{currentUser.availability}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. LOOKING FOR */}
      {activeTab === 'lookingFor' && (
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 shadow-xs space-y-5">
          <div>
            <h3 className="font-heading font-semibold text-base text-[#262626]">What Are You Looking For?</h3>
            <p className="text-xs text-[#666666]">
              Help campus peers know why you are on the platform (teammates, study partners, creative collaborators, or friends).
            </p>
          </div>

          {/* Tag List */}
          <div className="flex flex-wrap gap-2">
            {lookingForList.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6] text-xs font-medium"
              >
                <span>{item}</span>
                <button onClick={() => handleRemoveLookingFor(item)} className="hover:text-[#262626]">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add custom item */}
          <div className="flex items-center gap-2 max-w-md pt-2">
            <input
              type="text"
              value={newLookingForItem}
              onChange={(e) => setNewLookingForItem(e.target.value)}
              placeholder="e.g. Hackathon Team, DSA Study Buddy, Badminton Partner..."
              className="flex-1 bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none"
            />
            <button
              onClick={handleAddLookingFor}
              className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* 3. MY EVENTS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base text-[#262626]">My Registered Events & Workshops</h3>
            <Link to="/events" className="text-xs text-[#E63946] font-semibold hover:underline">
              Browse More Events →
            </Link>
          </div>

          {registeredEvents.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666]">
              You have not registered for any events yet. Check out the Events catalog!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {registeredEvents.map(e => (
                <div key={e.id} className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Confirmed Ticket ✓
                    </span>
                    <h4 className="font-semibold text-sm text-[#262626]">{e.title}</h4>
                    <p className="text-xs text-[#666666]">{e.date} • {e.time}</p>
                    <p className="text-xs text-[#999999]">{e.location}</p>
                  </div>

                  <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                    <Link to={`/events/${e.id}`} className="text-xs text-[#E63946] font-medium hover:underline">
                      View Details
                    </Link>
                    <button
                      onClick={() => handleCancelEvent(e.id)}
                      className="text-xs text-rose-600 hover:underline"
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

      {/* 4. MY COMMUNITIES */}
      {activeTab === 'communities' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base text-[#262626]">My Joined Campus Communities</h3>
            <Link to="/communities" className="text-xs text-[#E63946] font-semibold hover:underline">
              Explore Communities →
            </Link>
          </div>

          {joinedCommunities.length === 0 ? (
            <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666]">
              You haven't joined any campus communities yet. Join one today!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {joinedCommunities.map(c => (
                <div key={c.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    <img src={c.avatar} alt="" className="w-10 h-10 rounded-lg object-cover border" />
                    <div>
                      <h4 className="font-semibold text-xs text-[#262626]">{c.name}</h4>
                      <p className="text-[11px] text-[#666666]">{c.memberCount} members</p>
                    </div>
                  </div>
                  <Link to={`/communities/${c.id}`} className="px-3 py-1 bg-[#FFF1F2] text-[#E63946] text-xs font-medium rounded-lg">
                    Visit
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. CONNECTIONS */}
      {activeTab === 'connections' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold text-base text-[#262626]">My Campus Connections</h3>
            <Link to="/discover/friends" className="text-xs text-[#E63946] font-semibold hover:underline">
              Find New Peers →
            </Link>
          </div>

          <div className="space-y-3">
            {connections.length === 0 ? (
              <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666]">
                No connections yet. Connect with students in the Friends Hub or Campusly directory!
              </div>
            ) : (
              connections.map(c => {
                const isIncomingPending = c.toId === currentUser.id && c.status === 'pending';
                const isOutgoingPending = c.fromId === currentUser.id && c.status === 'pending';
                const isAccepted = c.status === 'accepted';

                return (
                  <div key={c.id} className="p-4 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <img src={c.fromAvatar} alt="" className="w-9 h-9 rounded-full object-cover border" />
                      <div>
                        <h4 className="font-semibold text-xs text-[#262626]">{c.fromName}</h4>
                        <p className="text-[11px] text-[#666666]">{c.fromDepartment} • {c.fromCollege}</p>
                        {c.note && <p className="text-[11px] text-[#999999] italic mt-0.5">"{c.note}"</p>}
                      </div>
                    </div>

                    <div>
                      {isIncomingPending && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptConnection(c.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectConnection(c.id)}
                            className="px-3 py-1 bg-white border border-[#E5E5E5] text-[#666666] rounded-lg text-xs"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {isOutgoingPending && (
                        <span className="text-[11px] text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Request Pending
                        </span>
                      )}

                      {isAccepted && (
                        <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                          <Check className="w-3 h-3" />
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

      {/* Avatar Selection Modal */}
      <AvatarPickerModal
        isOpen={avatarModalOpen}
        onClose={() => setAvatarModalOpen(false)}
        currentAvatar={currentUser.avatar}
        onSelectAvatar={handleAvatarSelected}
      />
    </div>
  );
};
