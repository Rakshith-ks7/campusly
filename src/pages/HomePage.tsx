import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StudentProfile, MatchingWeights } from '../types';
import { dataService } from '../services/dataService';
import { 
  ArrowRight, 
  Users, 
  Search,
  Compass, 
  Calendar, 
  Sparkles, 
  BookOpen, 
  Camera, 
  HeartHandshake,
  Check,
  UserPlus,
  Clock,
  MapPin,
  Plus
} from 'lucide-react';
import { CreateHubModal } from '../components/CreateHubModal';
import { CommunityCard } from '../components/CommunityCard';

interface Props {
  currentUser: StudentProfile;
  weights: MatchingWeights;
  onOpenWeightsDrawer: () => void;
}

export const HomePage: React.FC<Props> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeInterestFilter, setActiveInterestFilter] = useState<string>('All');
  const [connectSuccessMap, setConnectSuccessMap] = useState<Record<string, boolean>>({});
  const [isCreateHubOpen, setIsCreateHubOpen] = useState(false);
  const [allCommunities, setAllCommunities] = useState(dataService.getAllCommunities());

  const allProjects = dataService.getAllProjects();
  const allStudents = dataService.getAllStudents();
  const allEvents = dataService.getAllEvents();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  // Connect request handler
  const handleConnect = (targetStudentId: string) => {
    dataService.sendConnectionRequest(
      targetStudentId,
      `Hi! I noticed we share mutual interests at ${currentUser.college}. Let's connect on Campusly!`
    );
    setConnectSuccessMap(prev => ({ ...prev, [targetStudentId]: true }));
  };

  // People you might want to meet: 4 students
  const peopleToMeet = allStudents
    .filter(s => s.id !== currentUser.id)
    .slice(0, 4);

  // Filter events and projects
  const upcomingEvents = allEvents.slice(0, 2);
  const showcaseProjects = allProjects.slice(0, 2);

  // User interests fallback
  const userInterests = currentUser.interests && currentUser.interests.length > 0
    ? currentUser.interests
    : ['Python', 'AI', 'React', 'Hackathons', 'Gaming'];

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. HERO / WELCOME CARD */}
      <section className="pt-6 sm:pt-10 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-10 shadow-xs relative overflow-hidden space-y-6">
          
          <div className="space-y-2">
            <h1 className="font-heading font-bold text-2xl sm:text-4xl text-[#262626] tracking-tight">
              Welcome back, <span className="text-[#E63946]">{currentUser.name.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-sm sm:text-base text-[#666666] font-medium">
              Find your people. Build something together.
            </p>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/students"
              className="px-5 py-2.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs sm:text-sm font-semibold rounded-xl transition shadow-xs flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              <span>Discover People</span>
            </Link>

            <Link
              to="/projects"
              className="px-5 py-2.5 bg-white hover:bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5] hover:border-[#FECDD3] text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#E63946]" />
              <span>Find Teammates</span>
            </Link>

            <Link
              to="/events"
              className="px-5 py-2.5 bg-white hover:bg-[#FFF8F8] text-[#262626] border border-[#E5E5E5] hover:border-[#FECDD3] text-xs sm:text-sm font-semibold rounded-xl transition flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-[#E63946]" />
              <span>Explore Events</span>
            </Link>
          </div>

          {/* Universal Quick Search Bar */}
          <div className="pt-2">
            <form 
              onSubmit={handleSearchSubmit} 
              className="p-1.5 rounded-2xl bg-[#FFF8F8] border border-[#E5E5E5] focus-within:border-[#FECDD3] focus-within:ring-2 focus-within:ring-[#FFF1F2] transition flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center gap-2.5 px-3 w-full">
                <Search className="w-4 h-4 text-[#666666] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="🔍 Search students, projects, events, communities..."
                  className="w-full bg-transparent text-xs sm:text-sm text-[#262626] placeholder:text-[#999999] focus:outline-none py-1.5"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl transition shrink-0"
              >
                Search
              </button>
            </form>
          </div>

        </div>
      </section>

      {/* 2. YOUR INTERESTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="bg-white border border-[#E5E5E5] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#262626] mr-1">
              Your Interests
            </span>
            {userInterests.map((interest) => (
              <button
                key={interest}
                onClick={() => setActiveInterestFilter(interest === activeInterestFilter ? 'All' : interest)}
                className={`text-xs px-3.5 py-1.5 rounded-xl transition font-medium border ${
                  activeInterestFilter === interest
                    ? 'bg-[#E63946] text-white border-[#E63946] shadow-xs'
                    : 'bg-[#FFF8F8] text-[#262626] border-[#E5E5E5] hover:border-[#FECDD3]'
                }`}
              >
                {interest}
              </button>
            ))}
          </div>

          <Link
            to="/profile"
            className="text-xs font-bold text-[#E63946] hover:underline flex items-center gap-1"
          >
            <span>Edit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 3. EXPLORE CAMPUS HUBS & COMMUNITIES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#262626]">
              Explore Campus Hubs & Communities
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Join student societies, coding guilds, academic study circles, or launch your own
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsCreateHubOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF1F2] hover:bg-[#FFE4E6] text-[#E63946] border border-[#FFE4E6] rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create a Hub</span>
            </button>
            <Link to="/communities" className="text-xs font-semibold text-[#E63946] hover:underline flex items-center gap-1 ml-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Community Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {allCommunities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>

      {/* 4. PEOPLE YOU MIGHT WANT TO MEET */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#262626] uppercase tracking-wide text-xs">
            People You Might Want to Meet
          </h2>
          <Link
            to="/students"
            className="text-xs font-semibold text-[#E63946] hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {peopleToMeet.map((student) => {
            const hasConnected = connectSuccessMap[student.id];
            const topSkill = student.skills[0]?.name || student.interests[0] || 'Builder';

            return (
              <div 
                key={student.id} 
                className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-4 flex flex-col items-center text-center justify-between transition shadow-xs"
              >
                <div className="space-y-2 w-full flex flex-col items-center">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[#FFE4E6] p-0.5 bg-white shadow-xs"
                  />
                  <div>
                    <h4 className="font-heading font-bold text-sm text-[#262626]">
                      {student.name.split(' ')[0]}
                    </h4>
                    <span className="inline-block mt-0.5 text-[11px] font-semibold text-[#E63946] bg-[#FFF1F2] px-2.5 py-0.5 rounded-full border border-[#FFE4E6]">
                      {topSkill}
                    </span>
                  </div>
                </div>

                <div className="w-full pt-3 mt-3 border-t border-[#E5E5E5]">
                  <button
                    onClick={() => handleConnect(student.id)}
                    disabled={hasConnected}
                    className={`w-full py-1.5 px-2 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                      hasConnected
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-[#FFF8F8] hover:bg-[#E63946] text-[#E63946] hover:text-white border border-[#E5E5E5] hover:border-[#E63946]'
                    }`}
                  >
                    {hasConnected ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Connected</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Connect</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. UPCOMING EVENTS */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#262626] uppercase tracking-wide text-xs">
            Upcoming Events
          </h2>
          <Link to="/events" className="text-xs font-semibold text-[#E63946] hover:underline flex items-center gap-1">
            <span>Explore all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcomingEvents.map((evt) => (
            <div
              key={evt.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-5 flex items-center justify-between gap-4 transition shadow-xs group"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                    {evt.category}
                  </span>
                  <span className="text-xs text-[#666666] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#999999]" />
                    <span>{evt.date.split('2026')[0].trim()} • {evt.time.split('–')[0].trim()}</span>
                  </span>
                </div>

                <h3 className="font-heading font-bold text-sm sm:text-base text-[#262626] group-hover:text-[#E63946] transition">
                  {evt.title}
                </h3>

                <div className="text-xs text-[#666666] flex items-center gap-2">
                  <span>{evt.location}</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-semibold">
                    {evt.seatsTotal - evt.seatsFilled} seats left
                  </span>
                </div>
              </div>

              <Link
                to={`/events/${evt.id}`}
                className="px-4 py-2 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-semibold rounded-xl shrink-0 transition shadow-xs"
              >
                {evt.isRegistered ? 'Registered' : 'View Event'}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. PROJECTS LOOKING FOR TEAMMATES */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg sm:text-xl text-[#262626] uppercase tracking-wide text-xs">
            Projects Looking for Teammates
          </h2>
          <Link
            to="/projects"
            className="text-xs font-semibold text-[#E63946] hover:underline flex items-center gap-1"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {showcaseProjects.map((proj) => {
            const filledCount = proj.roles.filter(r => r.isFilled).length;
            const totalCount = proj.roles.length;

            return (
              <div
                key={proj.id}
                className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-5 flex items-center justify-between gap-4 transition shadow-xs group"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                      {proj.category}
                    </span>
                    <span className="text-xs font-semibold text-[#666666]">
                      {filledCount}/{totalCount} members
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-sm sm:text-base text-[#262626] group-hover:text-[#E63946] transition">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-[#666666] line-clamp-1">
                    {proj.description}
                  </p>
                </div>

                <Link
                  to={`/projects/${proj.id}`}
                  className="px-4 py-2 bg-white hover:bg-[#FFF1F2] text-[#E63946] border border-[#E5E5E5] hover:border-[#FECDD3] text-xs font-semibold rounded-xl shrink-0 transition"
                >
                  Join Team
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Create Campus Hub Modal */}
      <CreateHubModal
        isOpen={isCreateHubOpen}
        onClose={() => setIsCreateHubOpen(false)}
        onHubCreated={() => setAllCommunities(dataService.getAllCommunities())}
      />

    </div>
  );
};
