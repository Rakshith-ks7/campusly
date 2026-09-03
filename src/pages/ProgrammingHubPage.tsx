import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { 
  Code, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Plus, 
  Send, 
  ThumbsUp, 
  ArrowRight,
  ExternalLink,
  Calendar,
  Check
} from 'lucide-react';

export const ProgrammingHubPage: React.FC = () => {
  const currentUser = dataService.getCurrentUser();
  const allStudents = dataService.getAllStudents();
  const allProjects = dataService.getAllProjects();
  const [selectedTech, setSelectedTech] = useState<string>('All');
  const [selectedGoal, setSelectedGoal] = useState<string>('All');

  // Discussions
  const [discussions, setDiscussions] = useState(
    dataService.getCommunityDiscussions('comm-programming')
  );
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');

  // Groups
  const [joinedGroups, setJoinedGroups] = useState<string[]>(['group-dsa']);

  const techFilters = ['All', 'Python', 'C++', 'React', 'Java', 'AI / ML', 'Competitive Programming', 'Open Source'];
  const goalFilters = ['All', 'Coding partner', 'DSA partner', 'Project partner', 'Learning group'];

  // Filter students
  const codingBuddies = allStudents.filter(s => {
    if (s.id === currentUser.id) return false;
    const hasTech = selectedTech === 'All' || s.skills.some(sk => sk.name.toLowerCase().includes(selectedTech.toLowerCase()));
    const matchesGoal = selectedGoal === 'All' || s.lookingFor?.includes(selectedGoal) || true;
    return hasTech && matchesGoal;
  });

  // Programming projects
  const codingProjects = allProjects.filter(p => 
    p.requiredSkills.some(s => ['Python', 'React', 'C++', 'Node.js', 'PyTorch'].includes(s))
  );

  const codingGroups = [
    {
      id: 'group-dsa',
      title: 'DSA Beginners & Interview Ladder',
      members: 24,
      currentTopic: 'Arrays → Linked Lists → Binary Trees',
      nextSession: 'Saturday, 10:00 AM',
      description: 'Daily problem solving on LeetCode with whiteboard explanation practice.'
    },
    {
      id: 'group-webdev',
      title: 'Fullstack Web Dev Sprint Group',
      members: 19,
      currentTopic: 'Building RESTful APIs with FastAPI & Next.js',
      nextSession: 'Sunday, 3:00 PM',
      description: 'Reviewing pull requests and building real collegiate tools.'
    },
    {
      id: 'group-cp',
      title: 'Competitive Programming Guild',
      members: 31,
      currentTopic: 'Codeforces Div 2 & CodeChef contest debriefs',
      nextSession: 'Tuesday, 8:00 PM',
      description: 'Deep diving into Number Theory, Segment Trees and Greedy algorithms.'
    }
  ];

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim()) return;

    const post = dataService.addCommunityDiscussion(
      'comm-programming',
      newPostTitle,
      newPostContent,
      ['Programming', 'Coding'],
      'Coding Buddies'
    );
    setDiscussions([post, ...discussions]);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostOpen(false);
  };

  const handleLike = (id: string) => {
    dataService.likeCommunityDiscussion(id);
    setDiscussions(dataService.getCommunityDiscussions('comm-programming'));
  };

  const toggleJoinGroup = (groupId: string) => {
    if (joinedGroups.includes(groupId)) {
      setJoinedGroups(joinedGroups.filter(g => g !== groupId));
    } else {
      setJoinedGroups([...joinedGroups, groupId]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Hero Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
            <Code className="w-3.5 h-3.5" />
            <span>Campus Coding Community</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Programming Hub
          </h1>
          <p className="text-sm text-[#E63946] font-medium">
            "Learn together. Code together. Build together."
          </p>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Connect with student software developers, find pair programming partners, join DSA revision squads, and collaborate on production code.
          </p>
        </div>

        <button
          onClick={() => setNewPostOpen(true)}
          className="px-4 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Start a Discussion</span>
        </button>
      </div>

      {/* Coding Buddies Section */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-heading font-semibold text-lg sm:text-xl text-[#262626] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E63946]" />
              <span>Coding Buddies</span>
            </h2>
            <p className="text-xs text-[#666666]">
              Find student developers looking for study partners, pair coding, or hackathon squads
            </p>
          </div>

          {/* Goal Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#666666] font-medium hidden sm:inline">Looking for:</span>
            <select
              value={selectedGoal}
              onChange={(e) => setSelectedGoal(e.target.value)}
              className="bg-white border border-[#E5E5E5] rounded-lg px-2.5 py-1.5 text-xs text-[#262626] focus:outline-none"
            >
              {goalFilters.map(g => (
                <option key={g} value={g}>{g === 'All' ? 'All Goals' : g}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tech Stack Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {techFilters.map((tech) => (
            <button
              key={tech}
              onClick={() => setSelectedTech(tech)}
              className={`text-xs px-3 py-1 rounded-md transition font-medium whitespace-nowrap ${
                selectedTech === tech
                  ? 'bg-[#E63946] text-white'
                  : 'bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#FECDD3]'
              }`}
            >
              {tech}
            </button>
          ))}
        </div>

        {/* Buddies Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {codingBuddies.slice(0, 6).map((student) => (
            <div
              key={student.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-4 shadow-xs transition flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]"
                  />
                  <div>
                    <h3 className="font-semibold text-sm text-[#262626]">{student.name}</h3>
                    <p className="text-xs text-[#666666]">{student.department.split('&')[0]} • {student.year}</p>
                  </div>
                </div>

                <p className="text-xs text-[#666666] line-clamp-2 mt-2 leading-relaxed">
                  {student.bio}
                </p>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {student.skills.slice(0, 3).map(sk => (
                    <span key={sk.name} className="skill-tag">
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Looking for: {student.lookingFor?.[0] || 'Coding partner'}
                </span>
                <Link
                  to={`/students?q=${encodeURIComponent(student.name)}`}
                  className="px-3 py-1 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                >
                  Connect
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coding Study Groups */}
      <section className="space-y-4">
        <div>
          <h2 className="font-heading font-semibold text-lg sm:text-xl text-[#262626] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#E63946]" />
            <span>Active Coding Groups</span>
          </h2>
          <p className="text-xs text-[#666666]">
            Join ongoing peer practice squads learning together
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {codingGroups.map((group) => {
            const isJoined = joinedGroups.includes(group.id);
            return (
              <div
                key={group.id}
                className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-5 shadow-xs transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-[#E63946] bg-[#FFF1F2] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                      {group.members} Members
                    </span>
                    <span className="text-xs text-[#666666] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#999999]" />
                      {group.nextSession.split(',')[0]}
                    </span>
                  </div>

                  <h3 className="font-heading font-semibold text-base text-[#262626]">{group.title}</h3>
                  <p className="text-xs text-[#666666] leading-relaxed">{group.description}</p>
                  
                  <div className="p-2 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5] text-[11px] text-[#666666]">
                    <strong className="text-[#262626]">Focus: </strong>{group.currentTopic}
                  </div>
                </div>

                <button
                  onClick={() => toggleJoinGroup(group.id)}
                  className={`w-full py-2 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1 ${
                    isJoined
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#E63946] hover:bg-[#D62839] text-white'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Joined Group</span>
                    </>
                  ) : (
                    <span>Join Group</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Programming Discussions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg sm:text-xl text-[#262626] flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#E63946]" />
              <span>Programming Discussions</span>
            </h2>
            <p className="text-xs text-[#666666]">
              Ask questions, discuss tech roadmaps, and propose coding projects
            </p>
          </div>
          <button
            onClick={() => setNewPostOpen(true)}
            className="text-xs font-semibold text-[#E63946] hover:underline"
          >
            + New Post
          </button>
        </div>

        {/* Discussions List */}
        <div className="space-y-3">
          {discussions.map((disc) => (
            <div
              key={disc.id}
              className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={disc.authorAvatar}
                    alt=""
                    className="w-7 h-7 rounded-full object-cover border border-[#E5E5E5]"
                  />
                  <div>
                    <span className="font-semibold text-xs text-[#262626]">{disc.authorName}</span>
                    <span className="text-[11px] text-[#999999] ml-2">{disc.createdAt}</span>
                  </div>
                </div>
                <span className="text-[10px] font-medium bg-[#FFF1F2] text-[#E63946] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                  {disc.category || 'Discussion'}
                </span>
              </div>

              <h3 className="font-heading font-semibold text-sm sm:text-base text-[#262626]">
                {disc.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                {disc.content}
              </p>

              <div className="pt-2 border-t border-[#E5E5E5] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleLike(disc.id)}
                    className="flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#E63946] transition font-medium"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{disc.likes} Likes</span>
                  </button>
                  <span className="text-xs text-[#666666]">
                    {disc.comments.length} Comments
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* New Post Modal */}
      {newPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-heading font-semibold text-base text-[#262626] mb-3">
              Post to Programming Hub
            </h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Topic Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anyone practicing DSA Graphs this week?"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details, schedules, or question..."
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg p-3 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setNewPostOpen(false)}
                  className="px-4 py-2 text-xs text-[#666666] hover:text-[#262626] bg-white border border-[#E5E5E5] rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                >
                  Post Discussion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
