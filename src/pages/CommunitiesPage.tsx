import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { Community, CommunityCategory } from '../types';
import { 
  Layers, 
  Users, 
  ArrowRight, 
  Check, 
  Plus, 
  Search,
  Sparkles
} from 'lucide-react';
import { CreateHubModal } from '../components/CreateHubModal';

export const CommunitiesPage: React.FC = () => {
  const [communities, setCommunities] = useState<Community[]>(dataService.getAllCommunities());
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateHubOpen, setIsCreateHubOpen] = useState(false);

  const categories = [
    'All',
    'Programming',
    'AI & Data',
    'Exam & Academic',
    'Content & Media',
    'Robotics & Hardware',
    'Social & Hobbies',
    'Entrepreneurship'
  ];

  const handleToggleJoin = (id: string, isJoined?: boolean) => {
    if (isJoined) {
      dataService.leaveCommunity(id);
    } else {
      dataService.joinCommunity(id);
    }
    setCommunities(dataService.getAllCommunities());
  };

  const filteredCommunities = communities.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Campus Societies & Communities</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Campus Communities
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Join long-term student societies, technical guilds, creative collectives, and academic study circles. Participate in discussions, events, and shared projects.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsCreateHubOpen(true)}
            className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create a Hub</span>
          </button>
          <Link
            to="/discover"
            className="px-4 py-2 bg-white hover:bg-[#FFF1F2] text-[#E63946] border border-[#E5E5E5] hover:border-[#FECDD3] text-xs font-medium rounded-lg transition shrink-0"
          >
            Explore Campus Hubs →
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-[#E63946] text-white shadow-xs'
                    : 'bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#FECDD3]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-4 h-4 text-[#999999] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search communities..."
              className="w-full bg-white border border-[#E5E5E5] rounded-lg pl-9 pr-3 py-1.5 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            />
          </div>
        </div>
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCommunities.map((comm) => {
          const candidateUrl = comm.image || (
            comm.avatar && (comm.avatar.startsWith('http') || comm.avatar.startsWith('/')) ? comm.avatar : ''
          );

          return (
            <div
              key={comm.id}
              className="community-card bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl overflow-hidden shadow-xs hover:shadow-sm transition flex flex-col justify-between group"
            >
              {/* Community Image Container */}
              <div className="community-image w-full h-[160px] bg-[#FFF8F8] relative overflow-hidden shrink-0">
                {candidateUrl ? (
                  <img
                    src={candidateUrl}
                    alt={`${comm.name} community`}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-[#FFF1F2] border-b border-[#FFE4E6] flex items-center justify-center text-3xl">
                    <span>{comm.avatar && !comm.avatar.startsWith('http') ? comm.avatar : '🚀'}</span>
                  </div>
                )}
                <span className="absolute top-2.5 right-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[#E63946] border border-[#FFE4E6] shadow-xs">
                  {comm.category}
                </span>
              </div>

              {/* Community Content */}
              <div className="community-content p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-base text-[#262626] hover:text-[#E63946] transition">
                    <Link to={`/communities/${comm.id}`}>{comm.name}</Link>
                  </h3>
                  <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                    {comm.description}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {comm.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="skill-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3.5 border-t border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#666666] font-medium">
                    <Users className="w-3.5 h-3.5 text-[#999999]" />
                    <span>{comm.memberCount} members</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleJoin(comm.id, comm.isJoined)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1 ${
                        comm.isJoined
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946]'
                      }`}
                    >
                      {comm.isJoined ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Joined</span>
                        </>
                      ) : (
                        <span>Join</span>
                      )}
                    </button>

                    <Link
                      to={`/communities/${comm.id}`}
                      className="px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-lg transition shadow-xs"
                    >
                      Explore
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Campus Hub Modal */}
      <CreateHubModal
        isOpen={isCreateHubOpen}
        onClose={() => setIsCreateHubOpen(false)}
        onHubCreated={() => setCommunities(dataService.getAllCommunities())}
      />

    </div>
  );
};
