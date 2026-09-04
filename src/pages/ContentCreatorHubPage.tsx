import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { 
  Camera, 
  Video, 
  PenTool, 
  Mic, 
  Sparkles, 
  Users, 
  FolderGit2, 
  ArrowRight,
  ExternalLink,
  Calendar
} from 'lucide-react';

export const ContentCreatorHubPage: React.FC = () => {
  const currentUser = dataService.getCurrentUser();
  const allStudents = dataService.getAllStudents();
  const allProjects = dataService.getAllProjects();

  const [filterIAm, setFilterIAm] = useState<string>('All');
  const [filterLookingFor, setFilterLookingFor] = useState<string>('All');

  const creatorRoles = [
    'All',
    'Video Editor',
    'Photographer',
    'UI/UX Designer',
    'Content Writer',
    'Podcaster',
    'YouTuber'
  ];

  const lookingForOptions = [
    'All',
    'Video Editor',
    'Photographer',
    'Designer',
    'Presenter',
    'Writer'
  ];

  // Filter creator students
  const creators = allStudents.filter(s => {
    if (s.id === currentUser.id) return false;
    const matchesIAm = filterIAm === 'All' || 
      (s.creatorRole && s.creatorRole.toLowerCase().includes(filterIAm.toLowerCase())) ||
      s.skills.some(sk => sk.category === 'Design' || sk.name.toLowerCase().includes(filterIAm.toLowerCase()));
    
    const matchesLookingFor = filterLookingFor === 'All' ||
      s.creatorLookingFor?.some(r => r.toLowerCase().includes(filterLookingFor.toLowerCase())) ||
      s.lookingFor?.some(r => r.toLowerCase().includes(filterLookingFor.toLowerCase()));

    return matchesIAm && matchesLookingFor;
  });

  // Creator Projects
  const creatorProjects = [
    {
      id: 'cp-podcast',
      title: 'Campus Tech & Founders Podcast (Season 2)',
      organizer: 'Media & Creative Guild',
      rolesNeeded: ['Sound Editor', 'Graphic Designer', 'Guest Host'],
      description: 'Interviewing successful alumni founders and software engineers on career breakthroughs.',
      deadline: '28 September 2026'
    },
    {
      id: 'cp-reels',
      title: 'College Fest 2026 Teaser Video & Reel Series',
      organizer: 'Cultural Council & Ananya Roy',
      rolesNeeded: ['Drone Videographer', 'DaVinci / Premiere Editor', 'Voiceover Artist'],
      description: 'Creating high-energy cinematic promo clips for Instagram and YouTube Shorts.',
      deadline: '15 October 2026'
    },
    {
      id: 'cp-magazine',
      title: 'Annual Student Design & Tech Magazine',
      organizer: 'Editorial Board',
      rolesNeeded: ['Layout Designer (InDesign / Figma)', 'Copywriter', 'Illustrator'],
      description: 'Curating student essays, research highlights, and campus photo showcases.',
      deadline: '10 November 2026'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
            <Camera className="w-3.5 h-3.5" />
            <span>Creative Media Hub</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Content Creator Hub
          </h1>
          <p className="text-sm text-[#E63946] font-medium">
            "Find creators and build something together."
          </p>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Collaborate with student photographers, video editors, designers, podcasters, scriptwriters, and digital visual artists on creative campus productions.
          </p>
        </div>

        <Link
          to="/projects"
          className="px-4 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition shrink-0 flex items-center gap-1.5 shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>Post Creative Project</span>
        </Link>
      </div>

      {/* Role Filters Section */}
      <section className="bg-white border border-[#E5E5E5] rounded-xl p-5 shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* I am */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[#666666] mb-2">
              Filter by Creator Skill / Role:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {creatorRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterIAm(role)}
                  className={`text-xs px-3 py-1 rounded-md transition font-medium ${
                    filterIAm === role
                      ? 'bg-[#E63946] text-white'
                      : 'bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5] hover:border-[#FECDD3]'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Looking for */}
          <div>
            <label className="block text-xs font-semibold uppercase text-[#666666] mb-2">
              Filter by What They Are Looking For:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {lookingForOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterLookingFor(opt)}
                  className={`text-xs px-3 py-1 rounded-md transition font-medium ${
                    filterLookingFor === opt
                      ? 'bg-[#E63946] text-white'
                      : 'bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5] hover:border-[#FECDD3]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Creators Directory Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-semibold text-lg sm:text-xl text-[#262626] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#E63946]" />
              <span>Campus Creators</span>
            </h2>
            <p className="text-xs text-[#666666]">
              Student creators available for team projects and video collaborations
            </p>
          </div>
          <span className="text-xs text-[#666666]">
            Showing {creators.length} creators
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators.map((student) => (
            <div
              key={student.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-5 shadow-xs transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#E5E5E5]"
                  />
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-[#262626]">{student.name}</h3>
                    <div className="text-xs text-[#E63946] font-medium mt-0.5">
                      {student.creatorRole || 'Digital Designer & Media Lead'}
                    </div>
                    <p className="text-[11px] text-[#666666]">{student.college}</p>
                  </div>
                </div>

                <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                  {student.bio}
                </p>

                {/* Looking for tags */}
                <div className="p-2.5 rounded-lg bg-[#FFF8F8] border border-[#E5E5E5] space-y-1 text-xs">
                  <div className="text-[11px] font-semibold text-[#262626]">Looking to collaborate with:</div>
                  <div className="flex flex-wrap gap-1">
                    {(student.creatorLookingFor || ['Video Editor', 'Photographer']).map(tag => (
                      <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded bg-white text-[#262626] border border-[#E5E5E5]">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-[11px] text-emerald-600 font-medium">
                  Open to projects
                </span>
                <Link
                  to={`/profile/${student.id}`}
                  className="px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                >
                  Collaborate
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Creator Projects & Media Initiatives */}
      <section className="space-y-4">
        <div>
          <h2 className="font-heading font-semibold text-lg sm:text-xl text-[#262626] flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-[#E63946]" />
            <span>Creative Projects Seeking Team</span>
          </h2>
          <p className="text-xs text-[#666666]">
            Campus productions, podcasts, and media series currently recruiting
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creatorProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-xl p-5 shadow-xs transition flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                    Creative Project
                  </span>
                  <span className="text-[11px] text-[#666666] flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#999999]" />
                    {project.deadline}
                  </span>
                </div>

                <h3 className="font-heading font-semibold text-sm sm:text-base text-[#262626]">
                  {project.title}
                </h3>
                <p className="text-xs text-[#666666] leading-relaxed">
                  {project.description}
                </p>

                <div className="mt-2 space-y-1">
                  <div className="text-[11px] font-semibold text-[#262626]">Roles Needed:</div>
                  <div className="flex flex-wrap gap-1">
                    {project.rolesNeeded.map(role => (
                      <span key={role} className="skill-tag">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-[11px] text-[#666666] truncate max-w-[130px]">
                  By {project.organizer}
                </span>
                <Link
                  to="/projects"
                  className="text-xs font-semibold text-[#E63946] hover:underline"
                >
                  Apply →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
