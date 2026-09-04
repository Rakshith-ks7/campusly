import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StudentProfile } from '../types';
import { dataService } from '../services/dataService';
import { 
  Search, 
  Plus, 
  Calendar, 
  MapPin, 
  ArrowRight,
  Compass
} from 'lucide-react';

interface Props {
  currentUser: StudentProfile;
  onCreateProjectClick: () => void;
}

export const ProjectMarketplacePage: React.FC<Props> = ({ 
  onCreateProjectClick 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWorkMode, setSelectedWorkMode] = useState<string>('All');

  const projects = dataService.getAllProjects();

  const categories = ['All', 'Hackathon', 'College Project', 'Startup / MVP', 'Robotics', 'Research'];
  const workModes = ['All', 'Online', 'Offline', 'Hybrid'];

  const filtered = projects.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesQuery = 
      p.title.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.requiredSkills.some(s => s.toLowerCase().includes(query)) ||
      p.locationName.toLowerCase().includes(query);

    if (!matchesQuery) return false;
    if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
    if (selectedWorkMode !== 'All' && p.locationType !== selectedWorkMode) return false;

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Projects & Hackathons
          </h1>
          <p className="text-sm text-[#666666] mt-1">
            Join student-led initiatives, hackathon squads, and capstone research projects.
          </p>
        </div>

        <button
          onClick={onCreateProjectClick}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition shadow-xs cursor-pointer min-h-[44px]"
        >
          <Plus className="w-4 h-4" />
          <span>Post a Project</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-[#E5E5E5] rounded-xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-[#666666] absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects by keyword, technology (e.g. PyTorch, React), or campus..."
              className="w-full bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg pl-10 pr-4 py-2 text-sm text-[#262626] placeholder:text-[#999999] focus:outline-none focus:border-[#FECDD3]"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <span className="text-xs text-[#666666] whitespace-nowrap font-medium">Mode:</span>
            <select
              value={selectedWorkMode}
              onChange={(e) => setSelectedWorkMode(e.target.value)}
              className="w-full md:w-auto bg-[#FFF8F8] border border-[#E5E5E5] rounded-lg px-3 py-2 text-xs text-[#262626] focus:outline-none focus:border-[#FECDD3]"
            >
              {workModes.map(m => (
                <option key={m} value={m} className="bg-white">{m === 'All' ? 'All Modes' : m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <span className="text-xs text-[#666666] whitespace-nowrap mr-1 font-medium">Category:</span>
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
      </div>

      {/* Project Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E5E5E5] rounded-xl p-12 text-center space-y-3">
          <h3 className="font-heading font-semibold text-lg text-[#262626]">No projects found</h3>
          <p className="text-sm text-[#666666]">Try clearing filters or search for another keyword.</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedCategory('All'); setSelectedWorkMode('All'); }}
            className="px-4 py-2 bg-[#E63946] text-white text-xs font-medium rounded-lg"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => {
            const filledRoles = project.roles.filter(r => r.isFilled).length;
            const openRoles = project.roles.filter(r => !r.isFilled);
            const percentFilled = Math.round((filledRoles / project.roles.length) * 100);

            return (
              <div
                key={project.id}
                className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-5 flex flex-col justify-between transition shadow-xs"
              >
                <div>
                  {/* Meta Badges */}
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                      {project.category}
                    </span>
                    <span className="text-xs text-[#666666] flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#999999]" />
                      {project.deadline.split('(')[0]}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-heading font-semibold text-base text-[#262626] hover:text-[#E63946] transition">
                    <Link to={`/projects/${project.id}`}>{project.title}</Link>
                  </h3>

                  <p className="text-xs text-[#666666] mt-2 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Team Roster Progress */}
                  <div className="mt-4 p-3 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5]">
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                      <span className="text-[#666666]">Team Composition</span>
                      <span className="text-[#262626] font-semibold">{filledRoles} / {project.roles.length} Members</span>
                    </div>
                    <div className="w-full bg-[#E5E5E5] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#E63946] h-full rounded-full transition-all"
                        style={{ width: `${percentFilled}%` }}
                      ></div>
                    </div>

                    {/* Vacant Roles Pills */}
                    {openRoles.length > 0 && (
                      <div className="mt-2.5">
                        <div className="text-[10px] font-semibold text-[#E63946] uppercase tracking-wider mb-1">
                          Looking for:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {openRoles.map(r => (
                            <span
                              key={r.id}
                              className="text-[11px] bg-white border border-[#FFE4E6] text-[#E63946] px-2 py-0.5 rounded font-medium"
                            >
                              + {r.title}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Required Tech Pills */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {project.requiredSkills.slice(0, 3).map((s) => (
                      <span key={s} className="skill-tag">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="mt-5 pt-3.5 border-t border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={project.creatorAvatar}
                      alt={project.creatorName}
                      className="w-7 h-7 rounded-full object-cover border border-[#E5E5E5]"
                    />
                    <div>
                      <div className="text-xs font-semibold text-[#262626] truncate max-w-[100px]">{project.creatorName}</div>
                      <div className="text-[11px] text-[#666666] flex items-center gap-0.5">
                        <MapPin className="w-3 h-3 text-[#999999]" />
                        <span>{project.locationName.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/projects/${project.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium transition flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
