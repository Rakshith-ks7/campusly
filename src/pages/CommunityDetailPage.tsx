import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Community, CommunityDiscussion, CommunityResource, CampusEvent, Project } from '../types';
import { ReportModal } from '../components/ReportModal';
import { 
  Users, 
  Layers, 
  Calendar, 
  FolderGit2, 
  FileText, 
  MessageSquare, 
  Check, 
  Plus, 
  ThumbsUp, 
  Download, 
  ShieldAlert, 
  ArrowLeft,
  Share2
} from 'lucide-react';

export const CommunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = dataService.getCurrentUser();

  const [community, setCommunity] = useState<Community | undefined>(
    dataService.getCommunityById(id || '') || dataService.getCommunityBySlug(id || '')
  );

  const [activeTab, setActiveTab] = useState<'about' | 'discussions' | 'events' | 'projects' | 'resources'>('about');
  const [discussions, setDiscussions] = useState<CommunityDiscussion[]>([]);
  const [resources, setResources] = useState<CommunityResource[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  
  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [newPostOpen, setNewPostOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');

  useEffect(() => {
    if (community) {
      setDiscussions(dataService.getCommunityDiscussions(community.id));
      setResources(dataService.getCommunityResources(community.id));
      setEvents(dataService.getAllEvents().filter(e => 
        e.tags.some(t => community.tags.includes(t)) || e.category.toLowerCase().includes(community.category.toLowerCase())
      ));
      setProjects(dataService.getAllProjects().filter(p => 
        p.requiredSkills.some(s => community.tags.includes(s))
      ));
    }
  }, [community?.id]);

  if (!community) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#262626]">Community Not Found</h2>
        <p className="text-sm text-[#666666]">The community you requested does not exist or has been removed.</p>
        <Link to="/communities" className="inline-block px-4 py-2 bg-[#E63946] text-white text-xs rounded-lg">
          Back to Communities
        </Link>
      </div>
    );
  }

  const handleToggleJoin = () => {
    if (community.isJoined) {
      dataService.leaveCommunity(community.id);
    } else {
      dataService.joinCommunity(community.id);
    }
    setCommunity(dataService.getCommunityById(community.id));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim()) return;

    const newDisc = dataService.addCommunityDiscussion(
      community.id,
      postTitle,
      postContent,
      community.tags.slice(0, 3)
    );
    setDiscussions([newDisc, ...discussions]);
    setPostTitle('');
    setPostContent('');
    setNewPostOpen(false);
  };

  const handleLike = (discId: string) => {
    dataService.likeCommunityDiscussion(discId);
    setDiscussions(dataService.getCommunityDiscussions(community.id));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Back link */}
      <div>
        <Link to="/communities" className="inline-flex items-center gap-1.5 text-xs text-[#666666] hover:text-[#E63946]">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Communities</span>
        </Link>
      </div>

      {/* Community Header Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#FFF1F2] border border-[#E5E5E5] flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {community.image || (community.avatar && (community.avatar.startsWith('http') || community.avatar.startsWith('/'))) ? (
                <img
                  src={community.image || community.avatar}
                  alt={`${community.name} community`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl">{community.avatar && !community.avatar.startsWith('http') ? community.avatar : '🚀'}</span>
              )}
            </div>
            <div className="space-y-1">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                {community.category}
              </span>
              <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
                {community.name}
              </h1>
              <p className="text-xs text-[#666666] flex items-center gap-2">
                <span>{community.memberCount} active members</span>
                <span>•</span>
                <span>Lead: {community.leadName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={handleToggleJoin}
              className={`flex-1 sm:flex-none px-5 py-2.5 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 shadow-xs ${
                community.isJoined
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-[#E63946] hover:bg-[#D62839] text-white'
              }`}
            >
              {community.isJoined ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Joined Community</span>
                </>
              ) : (
                <span>Join Community</span>
              )}
            </button>

            <button
              onClick={() => setReportModalOpen(true)}
              className="p-2.5 rounded-lg border border-[#E5E5E5] hover:border-rose-200 hover:text-rose-600 text-[#666666] transition"
              title="Report Community"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#E5E5E5]">
          {community.tags.map(t => (
            <span key={t} className="skill-tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-[#E5E5E5] overflow-x-auto pb-1">
        {[
          { id: 'about', label: 'About', icon: Layers },
          { id: 'discussions', label: `Discussions (${discussions.length})`, icon: MessageSquare },
          { id: 'events', label: `Events (${events.length})`, icon: Calendar },
          { id: 'projects', label: `Projects (${projects.length})`, icon: FolderGit2 },
          { id: 'resources', label: `Resources (${resources.length})`, icon: FileText }
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

      {/* Tab Contents */}
      <div className="space-y-6">
        
        {/* TAB 1: ABOUT */}
        {activeTab === 'about' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xs space-y-3">
                <h3 className="font-heading font-semibold text-base text-[#262626]">About this Community</h3>
                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {community.description}
                </p>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-xl p-6 shadow-xs space-y-3">
                <h3 className="font-heading font-semibold text-base text-[#262626]">Community Guidelines & Rules</h3>
                <ul className="space-y-2">
                  {community.rules.map((rule, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-[#666666]">
                      <span className="w-5 h-5 rounded-full bg-[#FFF1F2] text-[#E63946] flex items-center justify-center shrink-0 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-3">
                <h4 className="font-heading font-semibold text-sm text-[#262626]">Community Leadership</h4>
                <div className="flex items-center gap-3">
                  <img
                    src={community.leadAvatar}
                    alt={community.leadName}
                    className="w-10 h-10 rounded-full object-cover border border-[#E5E5E5]"
                  />
                  <div>
                    <h5 className="font-semibold text-xs text-[#262626]">{community.leadName}</h5>
                    <p className="text-[11px] text-[#666666]">Community Organizer</p>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-2 text-xs text-[#666666]">
                <div className="flex justify-between py-1 border-b border-[#E5E5E5]">
                  <span>Founded</span>
                  <span className="font-medium text-[#262626]">{community.createdAt}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#E5E5E5]">
                  <span>Total Members</span>
                  <span className="font-medium text-[#262626]">{community.memberCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span>Category</span>
                  <span className="font-medium text-[#262626]">{community.category}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DISCUSSIONS */}
        {activeTab === 'discussions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-semibold text-base text-[#262626]">Community Discussions</h3>
              <button
                onClick={() => setNewPostOpen(true)}
                className="px-3.5 py-1.5 bg-[#E63946] text-white text-xs font-medium rounded-lg"
              >
                + New Thread
              </button>
            </div>

            <div className="space-y-3">
              {discussions.length === 0 ? (
                <div className="p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666]">
                  No discussions yet. Be the first to start a conversation!
                </div>
              ) : (
                discussions.map(d => (
                  <div key={d.id} className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={d.authorAvatar} alt="" className="w-7 h-7 rounded-full object-cover border" />
                        <div>
                          <span className="font-semibold text-xs text-[#262626]">{d.authorName}</span>
                          <span className="text-[11px] text-[#999999] ml-2">{d.createdAt}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-[#E63946] bg-[#FFF1F2] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                        {d.category || 'General'}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-[#262626]">{d.title}</h4>
                    <p className="text-xs text-[#666666] leading-relaxed">{d.content}</p>

                    <div className="pt-2 border-t border-[#E5E5E5] flex items-center gap-4 text-xs">
                      <button
                        onClick={() => handleLike(d.id)}
                        className="flex items-center gap-1 text-[#666666] hover:text-[#E63946] font-medium"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{d.likes} Likes</span>
                      </button>
                      <span className="text-[#666666]">{d.comments.length} Comments</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 3: EVENTS */}
        {activeTab === 'events' && (
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-base text-[#262626]">Upcoming Community Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {events.length === 0 ? (
                <div className="col-span-2 p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666]">
                  No upcoming events currently scheduled for this community.
                </div>
              ) : (
                events.map(e => (
                  <div key={e.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex items-start justify-between gap-3 shadow-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-[#E63946] bg-[#FFF1F2] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                        {e.category}
                      </span>
                      <h4 className="font-semibold text-xs text-[#262626]">{e.title}</h4>
                      <p className="text-[11px] text-[#666666]">{e.date} • {e.location}</p>
                    </div>
                    <Link to={`/events/${e.id}`} className="px-3 py-1.5 bg-[#E63946] text-white text-xs font-medium rounded-lg shrink-0">
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: PROJECTS */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-base text-[#262626]">Member Projects Recruiting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.length === 0 ? (
                <div className="col-span-2 p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666]">
                  No active projects currently listed for this community.
                </div>
              ) : (
                projects.map(p => (
                  <div key={p.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex flex-col justify-between space-y-3 shadow-xs">
                    <div>
                      <h4 className="font-semibold text-sm text-[#262626]">{p.title}</h4>
                      <p className="text-xs text-[#666666] line-clamp-2 mt-1">{p.description}</p>
                    </div>
                    <div className="pt-2 border-t border-[#E5E5E5] flex justify-between items-center text-xs">
                      <span className="text-[#666666]">{p.roles.filter(r => !r.isFilled).length} open roles</span>
                      <Link to={`/projects/${p.id}`} className="text-[#E63946] font-semibold hover:underline">
                        Apply →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 5: RESOURCES */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <h3 className="font-heading font-semibold text-base text-[#262626]">Curated Community Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {resources.length === 0 ? (
                <div className="col-span-2 p-8 text-center bg-white border border-[#E5E5E5] rounded-xl text-xs text-[#666666]">
                  No resources uploaded yet.
                </div>
              ) : (
                resources.map(r => (
                  <div key={r.id} className="bg-white border border-[#E5E5E5] rounded-xl p-4 flex items-start justify-between gap-3 shadow-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-[#E63946] bg-[#FFF1F2] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                        {r.fileType.toUpperCase()}
                      </span>
                      <h4 className="font-semibold text-xs text-[#262626]">{r.title}</h4>
                      <p className="text-[11px] text-[#666666]">{r.description || 'Shared resource'}</p>
                    </div>
                    <button
                      onClick={() => alert(`Downloading "${r.title}"...`)}
                      className="px-2.5 py-1.5 bg-[#FFF8F8] hover:bg-[#FFF1F2] text-[#E63946] border border-[#E5E5E5] rounded-lg text-xs font-medium shrink-0 flex items-center gap-1"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Get</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetType="user"
        targetId={community.id}
        targetTitle={community.name}
      />

      {/* New Post Modal */}
      {newPostOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
          <div className="bg-white border border-[#E5E5E5] rounded-xl w-full max-w-md p-6 shadow-xl">
            <h3 className="font-heading font-semibold text-base text-[#262626] mb-3">
              Post to {community.name}
            </h3>
            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding semester project setup"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#262626] mb-1">Details</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Write your question or proposal..."
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
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
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
