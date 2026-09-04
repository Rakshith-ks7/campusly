import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { firestoreService } from '../services/firestoreService';
import { useAuth } from '../context/AuthContext';
import { UniversalSearchResult } from '../types';
import { 
  Search, 
  ArrowRight, 
  Code, 
  BookOpen, 
  Camera, 
  HeartHandshake, 
  Users, 
  Compass, 
  Calendar, 
  FolderGit2, 
  MessageSquare,
  Sparkles,
  Plus
} from 'lucide-react';
import { CreateHubModal } from '../components/CreateHubModal';
import { CommunityCard } from '../components/CommunityCard';

export const DiscoverPage: React.FC = () => {
  const { studentProfile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [query, setQuery] = useState(queryParam);
  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'projects' | 'events' | 'communities' | 'study'>('all');
  const [searchResults, setSearchResults] = useState<UniversalSearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreateHubOpen, setIsCreateHubOpen] = useState(false);
  const [allCommunities, setAllCommunities] = useState(dataService.getAllCommunities());

  const executeSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setSearchResults(null);
      return;
    }
    setIsSearching(true);
    const localMatches = dataService.universalSearch(searchTerm);
    try {
      const realStudents = await firestoreService.searchStudents(searchTerm, studentProfile?.id);
      setSearchResults({
        ...localMatches,
        students: realStudents
      });
    } catch (err) {
      console.error('Error querying students for discover search:', err);
      setSearchResults(localMatches);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      setQuery(queryParam);
      executeSearch(queryParam);
    } else {
      setSearchResults(null);
    }
  }, [queryParam, studentProfile?.id]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      executeSearch(query.trim());
    } else {
      setSearchParams({});
      setSearchResults(null);
    }
  };

  const hubs = [
    {
      title: 'Programming Hub',
      subtitle: 'Learn together. Code together. Build together.',
      desc: 'Find coding buddies, DSA practice groups, open source contributors, and competitive programming partners.',
      icon: Code,
      link: '/discover/programming',
      tags: ['C++', 'Python', 'React', 'DSA', 'Competitive Coding'],
      badge: '340+ Coders'
    },
    {
      title: 'Exam Preparation Hub',
      subtitle: 'Study together. Help each other. Prepare better.',
      desc: 'Connect with study partners, download verified lecture notes and solved papers, and join peer revision rooms.',
      icon: BookOpen,
      link: '/discover/exams',
      tags: ['DBMS', 'OS', 'Math', 'Notes', 'Question Papers'],
      badge: '410+ Notes & Papers'
    },
    {
      title: 'Content Creator Hub',
      subtitle: 'Find creators and build something together.',
      desc: 'Collaborate with student photographers, video editors, designers, podcasters, writers, and digital artists.',
      icon: Camera,
      link: '/discover/creators',
      tags: ['Video Editing', 'Photography', 'Design', 'YouTube', 'Podcast'],
      badge: '180+ Creators'
    },
    {
      title: 'Friends Hub',
      subtitle: 'Make new friends around shared hobbies & activities.',
      desc: 'Safe and respectful friendship connections for gaming, sports, film discussions, music jams, and campus walks.',
      icon: HeartHandshake,
      link: '/discover/friends',
      tags: ['Gaming', 'Music', 'Sports', 'Fitness', 'Campus Life'],
      badge: '310+ Students'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
          <Compass className="w-3.5 h-3.5" />
          <span>Campus Discovery</span>
        </div>
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-[#262626]">
          Discover Your People
        </h1>
        <p className="text-sm sm:text-base text-[#666666] leading-relaxed">
          Find students, communities, events and activities that match your exact interests and learning goals.
        </p>

        {/* Global Search Input */}
        <form onSubmit={handleSearch} className="pt-2 max-w-xl mx-auto">
          <div className="p-1.5 rounded-xl bg-white border border-[#E5E5E5] focus-within:border-[#FECDD3] focus-within:ring-2 focus-within:ring-[#FFF1F2] transition flex items-center gap-2 shadow-xs">
            <Search className="w-4 h-4 text-[#666666] ml-2 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students, skills, projects or communities..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#262626] focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-lg shrink-0 transition"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      {/* If Search Results Active */}
      {searchResults ? (
        <div className="space-y-6 pt-2 animate-in fade-in">
          
          <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
            <div>
              <h2 className="font-heading font-semibold text-lg text-[#262626]">
                Search Results for "{queryParam}"
              </h2>
              <p className="text-xs text-[#666666]">
                Found matches across campus directory
              </p>
            </div>
            <button
              onClick={() => { setQuery(''); setSearchParams({}); setSearchResults(null); }}
              className="text-xs font-medium text-[#E63946] hover:underline"
            >
              Clear Search
            </button>
          </div>

          {/* Results Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                activeTab === 'all' ? 'bg-[#E63946] text-white' : 'bg-white border border-[#E5E5E5] text-[#666666]'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                activeTab === 'students' ? 'bg-[#E63946] text-white' : 'bg-white border border-[#E5E5E5] text-[#666666]'
              }`}
            >
              Students ({searchResults.students.length})
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                activeTab === 'projects' ? 'bg-[#E63946] text-white' : 'bg-white border border-[#E5E5E5] text-[#666666]'
              }`}
            >
              Projects ({searchResults.projects.length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                activeTab === 'events' ? 'bg-[#E63946] text-white' : 'bg-white border border-[#E5E5E5] text-[#666666]'
              }`}
            >
              Events ({searchResults.events.length})
            </button>
            <button
              onClick={() => setActiveTab('communities')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                activeTab === 'communities' ? 'bg-[#E63946] text-white' : 'bg-white border border-[#E5E5E5] text-[#666666]'
              }`}
            >
              Communities ({searchResults.communities.length})
            </button>
            <button
              onClick={() => setActiveTab('study')}
              className={`px-3 py-1.5 text-xs rounded-lg font-medium transition ${
                activeTab === 'study' ? 'bg-[#E63946] text-white' : 'bg-white border border-[#E5E5E5] text-[#666666]'
              }`}
            >
              Study Groups ({searchResults.studyGroups.length})
            </button>
          </div>

          {/* Results Grid */}
          <div className="space-y-6">
            
            {/* Students */}
            {(activeTab === 'all' || activeTab === 'students') && searchResults.students.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-sm text-[#262626] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#E63946]" />
                  <span>Matching Students</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {searchResults.students.map((s) => (
                    <div key={s.id} className="p-3.5 bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl flex items-center justify-between gap-3 shadow-xs transition">
                      <Link to={`/profile/${s.id}`} className="flex items-center gap-2.5 hover:opacity-85 transition">
                        <img src={s.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-[#E5E5E5]" />
                        <div>
                          <h4 className="font-semibold text-xs text-[#262626]">{s.name}</h4>
                          <p className="text-[11px] text-[#666666]">{s.department.split('&')[0]} • {s.year}</p>
                        </div>
                      </Link>
                      <Link to={`/profile/${s.id}`} className="text-xs text-[#E63946] font-medium hover:underline">
                        Profile →
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {(activeTab === 'all' || activeTab === 'events') && searchResults.events.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-sm text-[#262626] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#E63946]" />
                  <span>Matching Workshops & Events</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.events.map((e) => (
                    <div key={e.id} className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between gap-3 shadow-xs">
                      <div>
                        <span className="text-[10px] font-semibold text-[#E63946] bg-[#FFF1F2] px-2 py-0.5 rounded-full border border-[#FFE4E6]">
                          {e.category}
                        </span>
                        <h4 className="font-semibold text-xs text-[#262626] mt-1">{e.title}</h4>
                        <p className="text-[11px] text-[#666666]">{e.date} • {e.organizerClub}</p>
                      </div>
                      <Link to={`/events/${e.id}`} className="px-3 py-1.5 bg-[#E63946] text-white text-xs font-medium rounded-lg shrink-0">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Communities */}
            {(activeTab === 'all' || activeTab === 'communities') && searchResults.communities.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-heading font-semibold text-sm text-[#262626] flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#E63946]" />
                  <span>Matching Communities</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {searchResults.communities.map((c) => (
                    <div key={c.id} className="p-3.5 bg-white border border-[#E5E5E5] rounded-xl flex items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-center gap-2.5">
                        <img src={c.avatar} alt="" className="w-9 h-9 rounded-lg object-cover border border-[#E5E5E5]" />
                        <div>
                          <h4 className="font-semibold text-xs text-[#262626]">{c.name}</h4>
                          <p className="text-[11px] text-[#666666]">{c.memberCount} members</p>
                        </div>
                      </div>
                      <Link to={`/communities/${c.id}`} className="px-3 py-1.5 bg-[#FFF1F2] text-[#E63946] text-xs font-medium rounded-lg shrink-0">
                        Explore
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      ) : (
        /* The Major Hub Gateway Sections */
        <div className="space-y-6">
          {/* Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FFF8F8] border border-[#FFE4E6] p-4 sm:p-5 rounded-2xl">
            <div>
              <h3 className="font-heading font-bold text-base text-[#262626]">
                Campus Hubs & Guilds
              </h3>
              <p className="text-xs text-[#666666] mt-0.5">
                Join our core hubs, explore student collectives, or launch a new hub for your campus interest
              </p>
            </div>
            <button
              onClick={() => setIsCreateHubOpen(true)}
              className="px-4 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition shadow-xs flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create a Hub</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {hubs.map((hub) => {
              const Icon = hub.icon;
              return (
                <div
                  key={hub.title}
                  className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-6 shadow-xs transition flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-xl bg-[#FFF1F2] border border-[#FFE4E6] flex items-center justify-center text-[#E63946] group-hover:bg-[#E63946] group-hover:text-white transition">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF8F8] text-[#666666] border border-[#E5E5E5]">
                        {hub.badge}
                      </span>
                    </div>

                    <div>
                      <h2 className="font-heading font-bold text-xl text-[#262626] group-hover:text-[#E63946] transition">
                        {hub.title}
                      </h2>
                      <p className="text-xs font-medium text-[#E63946] mt-0.5">
                        "{hub.subtitle}"
                      </p>
                      <p className="text-xs sm:text-sm text-[#666666] mt-2 leading-relaxed">
                        {hub.desc}
                      </p>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hub.tags.map(tag => (
                        <span key={tag} className="skill-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                    <span className="text-xs text-[#666666]">Open to all students</span>
                    <Link
                      to={hub.link}
                      className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition flex items-center gap-1"
                    >
                      <span>Explore Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}

            {/* Custom Student Created Hubs */}
            {allCommunities.filter(c => c.id.startsWith('comm-')).map(hub => (
              <CommunityCard key={hub.id} community={hub} />
            ))}

          </div>
        </div>
      )}

      {/* Create Campus Hub Modal */}
      <CreateHubModal
        isOpen={isCreateHubOpen}
        onClose={() => setIsCreateHubOpen(false)}
        onHubCreated={() => setAllCommunities(dataService.getAllCommunities())}
      />

    </div>
  );
};
