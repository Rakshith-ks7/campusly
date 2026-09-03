import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudentProfile, MatchingWeights } from '../types';
import { dataService } from '../services/dataService';
import { calculateStudentMatch } from '../services/matchingAlgorithm';
import { 
  Search, 
  MapPin, 
  Send, 
  CheckCircle2,
  X,
  Sliders,
  Sparkles,
  UserPlus,
  UserCheck,
  MessageSquare
} from 'lucide-react';
import { followService } from '../services/followService';
import { InitialMessageModal } from '../components/InitialMessageModal';

interface Props {
  currentUser: StudentProfile;
  weights: MatchingWeights;
  onOpenWeightsDrawer: () => void;
}

export const StudentDirectoryPage: React.FC<Props> = ({
  currentUser,
  weights,
  onOpenWeightsDrawer,
}) => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocality, setSelectedLocality] = useState<string>('All');
  const [targetProjectId, setTargetProjectId] = useState<string>('');
  
  // Invite Modal
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedStudentForInvite, setSelectedStudentForInvite] = useState<StudentProfile | null>(null);
  const [selectedRoleToInvite, setSelectedRoleToInvite] = useState<string>('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [inviteSentSuccess, setInviteSentSuccess] = useState(false);

  // Follow & Message states
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [selectedStudentForMessage, setSelectedStudentForMessage] = useState<StudentProfile | null>(null);

  useEffect(() => {
    followService.getFollowingList(currentUser.id).then(setFollowingIds);
  }, [currentUser.id]);

  const handleToggleFollow = async (targetStudent: StudentProfile) => {
    const isCurrentlyFollowing = followingIds.includes(targetStudent.id);
    if (isCurrentlyFollowing) {
      await followService.unfollowUser(currentUser.id, targetStudent.id);
      setFollowingIds(prev => prev.filter(id => id !== targetStudent.id));
    } else {
      await followService.followUser(currentUser.id, targetStudent.id, currentUser, targetStudent);
      setFollowingIds(prev => [...prev, targetStudent.id]);
    }
  };

  useEffect(() => {
    if (searchParams.get('q')) {
      setSearchQuery(searchParams.get('q') || '');
    }
  }, [searchParams]);

  const allStudents = dataService.getAllStudents();
  const allProjects = dataService.getAllProjects();
  const myProjects = allProjects.filter(p => p.creatorId === currentUser.id);

  const activeProject = targetProjectId 
    ? allProjects.find(p => p.id === targetProjectId)
    : myProjects[0] || allProjects[0];

  const categories: string[] = [
    'All',
    'Programming',
    'AI / ML',
    'Web Development',
    'Design',
    'Hardware & IoT',
    'Business & Product'
  ];

  const localities = ['All', 'Same College', '5 km', '10 km', 'City', 'Remote'];
  const lookingForOptions = ['All', 'Coding partner', 'Study partner', 'Project partner', 'Creative collaborator', 'Friends'];
  const [selectedLookingFor, setSelectedLookingFor] = useState<string>('All');

  // Filter students
  const filteredStudents = allStudents.filter(student => {
    if (student.id === currentUser.id) return false;

    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      student.name.toLowerCase().includes(query) ||
      student.college.toLowerCase().includes(query) ||
      student.department.toLowerCase().includes(query) ||
      student.skills.some(s => s.name.toLowerCase().includes(query)) ||
      student.interests.some(i => i.toLowerCase().includes(query));

    if (!matchesQuery) return false;

    if (selectedCategory !== 'All') {
      const hasSkillInCat = student.skills.some(s => s.category === selectedCategory);
      if (!hasSkillInCat) return false;
    }

    if (selectedLocality !== 'All') {
      if (student.localityRadius !== selectedLocality) return false;
    }

    if (selectedLookingFor !== 'All') {
      const matchesLooking = student.lookingFor?.some(lf => lf.toLowerCase().includes(selectedLookingFor.toLowerCase()));
      if (!matchesLooking) return false;
    }

    return true;
  });

  // Calculate matching scores
  const studentsWithScores = filteredStudents.map(student => {
    const requiredSkills = activeProject ? activeProject.requiredSkills : ['React', 'Python'];
    const projectInterests = activeProject ? activeProject.tags : ['Hackathon'];
    const match = calculateStudentMatch(
      student,
      requiredSkills,
      projectInterests,
      student.location,
      weights
    );
    return {
      student,
      match
    };
  });

  studentsWithScores.sort((a, b) => b.match.overallMatch - a.match.overallMatch);

  const handleOpenInvite = (student: StudentProfile) => {
    setSelectedStudentForInvite(student);
    setInviteSentSuccess(false);
    setInviteMessage(`Hey ${student.name}! I checked out your profile and your experience with ${student.skills[0]?.name || 'tech'} is a great match for our project.`);
    if (myProjects[0]?.roles.find(r => !r.isFilled)) {
      setSelectedRoleToInvite(myProjects[0].roles.find(r => !r.isFilled)?.id || '');
    }
    setInviteModalOpen(true);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForInvite || !myProjects[0]) return;
    
    dataService.applyToRole(
      myProjects[0].id,
      selectedRoleToInvite || myProjects[0].roles[0]?.id || 'role-1',
      myProjects[0].roles.find(r => r.id === selectedRoleToInvite)?.title || 'Teammate',
      inviteMessage,
      95
    );

    setInviteSentSuccess(true);
    setTimeout(() => {
      setInviteModalOpen(false);
      setInviteSentSuccess(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Find Teammates
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Find students with the skills and interests you need for your squad.
          </p>
        </div>

        {/* Project Target Selector & Weights Action */}
        <div className="flex flex-wrap items-center gap-2">
          {myProjects.length > 0 && (
            <div className="flex items-center gap-2 bg-white border border-[#E5E5E5] rounded-lg px-3 py-1.5 text-xs shadow-2xs">
              <span className="text-[#666666]">Match against:</span>
              <select
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="bg-transparent text-[#E63946] font-semibold focus:outline-none"
              >
                {allProjects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white text-[#262626]">
                    {p.title.slice(0, 26)}...
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenWeightsDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-[#FFF1F2] border border-[#E5E5E5] hover:border-[#FECDD3] text-[#262626] hover:text-[#E63946] text-xs font-medium transition shadow-2xs"
          >
            <Sliders className="w-3.5 h-3.5 text-[#E63946]" />
            <span>Customize Weights</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, skill (e.g. React, Python), or college..."
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg pl-10 pr-4 py-2 text-sm text-[#262626] placeholder:text-[#999999] focus:outline-none focus:border-[#FECDD3] focus:ring-1 focus:ring-[#FECDD3]"
            />
          </div>

          {/* Locality Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-[#666666] whitespace-nowrap hidden sm:inline">Proximity:</span>
            <select
              value={selectedLocality}
              onChange={(e) => setSelectedLocality(e.target.value)}
              className="w-full md:w-auto bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            >
              {localities.map(loc => (
                <option key={loc} value={loc} className="bg-white">{loc === 'All' ? 'All Campuses' : loc}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Skill Category Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-xs text-[#666666] whitespace-nowrap mr-1 font-medium">Domain:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1 rounded-md whitespace-nowrap transition font-medium ${
                selectedCategory === cat
                  ? 'bg-[#E63946] text-white'
                  : 'bg-[#FFF8F8] text-[#666666] hover:text-[#262626] border border-[#E5E5E5] hover:border-[#FECDD3]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Looking For Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 border-t border-[#E5E5E5]/60">
          <span className="text-xs text-[#666666] whitespace-nowrap mr-1 font-medium">Looking For:</span>
          {lookingForOptions.map((lf) => (
            <button
              key={lf}
              onClick={() => setSelectedLookingFor(lf)}
              className={`text-xs px-3 py-1 rounded-md whitespace-nowrap transition font-medium ${
                selectedLookingFor === lf
                  ? 'bg-[#E63946] text-white'
                  : 'bg-[#FFF8F8] text-[#666666] hover:text-[#262626] border border-[#E5E5E5] hover:border-[#FECDD3]'
              }`}
            >
              {lf}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-[#666666] px-1">
        <div>Showing <strong className="text-[#262626]">{studentsWithScores.length}</strong> students</div>
        <div>Matched relative to <span className="text-[#E63946] font-semibold">{activeProject?.title}</span></div>
      </div>

      {/* Students Cards Grid */}
      {studentsWithScores.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center space-y-3">
          <h3 className="font-heading font-semibold text-lg text-[#262626]">No teammates found</h3>
          <p className="text-sm text-[#666666]">Try changing your search keywords or clearing some filters.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedLocality('All'); }}
            className="px-4 py-2 bg-[#E63946] text-white text-xs font-medium rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentsWithScores.map(({ student, match }) => (
            <div
              key={student.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-5 flex flex-col justify-between transition shadow-xs"
            >
              <div>
                {/* Profile Head */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-12 h-12 rounded-full object-cover border border-[#E5E5E5] shrink-0"
                    />
                    <div>
                      <h3 className="font-heading font-semibold text-base text-[#262626]">
                        {student.name}
                      </h3>
                      <div className="text-xs text-[#666666]">
                        {student.department.split('&')[0]} • {student.year}
                      </div>
                      <div className="text-xs text-[#666666] flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-[#999999]" />
                        <span className="truncate max-w-[140px]">{student.college}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6] shrink-0">
                    {match.overallMatch}% Match
                  </span>
                </div>

                {/* Bio */}
                <p className="text-xs text-[#666666] line-clamp-2 mt-1 leading-relaxed">
                  {student.bio}
                </p>

                {/* Skills Section */}
                <div className="mt-3.5">
                  <div className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-1.5">
                    Skills:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {student.skills.slice(0, 4).map((sk) => (
                      <span key={sk.name} className="skill-tag">
                        {sk.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Interested in */}
                {student.interests && student.interests.length > 0 && (
                  <div className="mt-3">
                    <div className="text-[11px] font-semibold text-[#666666] uppercase tracking-wider mb-1">
                      Interested In:
                    </div>
                    <div className="text-xs text-[#666666]">
                      {student.interests.slice(0, 3).join(' • ')}
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3.5 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Available
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Follow Button */}
                  <button
                    onClick={() => handleToggleFollow(student)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                      followingIds.includes(student.id)
                        ? 'bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5] hover:border-rose-300'
                        : 'bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6] hover:bg-[#FFE4E6]'
                    }`}
                  >
                    {followingIds.includes(student.id) ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>

                  {/* Message / Message Request Button */}
                  <button
                    onClick={() => {
                      setSelectedStudentForMessage(student);
                      setMessageModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition flex items-center gap-1 shadow-xs"
                    title="Send message or introduction request"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && selectedStudentForInvite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-lg shadow-xl p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStudentForInvite.avatar}
                  alt={selectedStudentForInvite.name}
                  className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]"
                />
                <div>
                  <h3 className="font-heading font-semibold text-base text-[#262626]">
                    Invite {selectedStudentForInvite.name}
                  </h3>
                  <p className="text-xs text-[#666666]">{selectedStudentForInvite.department} • {selectedStudentForInvite.college}</p>
                </div>
              </div>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="text-[#666666] hover:text-[#262626] p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inviteSentSuccess ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-heading font-semibold text-lg text-[#262626]">Invitation Sent!</h4>
                <p className="text-xs text-[#666666]">
                  {selectedStudentForInvite.name} has been notified with your project invite.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="mt-4 space-y-4">
                {myProjects.length > 0 ? (
                  <div>
                    <label className="block text-xs font-medium text-[#262626] mb-1">Select Project Role</label>
                    <select
                      value={selectedRoleToInvite}
                      onChange={(e) => setSelectedRoleToInvite(e.target.value)}
                      className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                    >
                      {myProjects[0].roles.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.title} ({r.skills.join(', ')}) {r.isFilled ? '[Filled]' : '[Open]'}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="p-3 rounded-lg bg-[#FFF1F2] border border-[#FFE4E6] text-xs text-[#E63946]">
                    You don't have an active project right now. Create one first or invite to collaborate generally!
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[#262626] mb-1">Personal Note</label>
                  <textarea
                    rows={4}
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                  />
                </div>

                <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 text-xs text-[#666666] hover:text-[#262626] bg-white border border-[#E5E5E5] rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                  >
                    Send Invitation
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Initial Message Request Modal */}
      {selectedStudentForMessage && (
        <InitialMessageModal
          isOpen={messageModalOpen}
          onClose={() => {
            setMessageModalOpen(false);
            setSelectedStudentForMessage(null);
          }}
          sender={currentUser}
          receiver={selectedStudentForMessage}
        />
      )}

    </div>
  );
};
