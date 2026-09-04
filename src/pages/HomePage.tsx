import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { StudentProfile, MatchingWeights } from '../types';
import { dataService } from '../services/dataService';
import { firestoreService } from '../services/firestoreService';
import { followService } from '../services/followService';
import { 
  ArrowRight, 
  Search, 
  MapPin, 
  Clock, 
  Calendar,
  Users,
  Sparkles,
  Share2
} from 'lucide-react';
import { CommunityCard } from '../components/CommunityCard';
import { StudentCard } from '../components/StudentCard';
import { InitialMessageModal } from '../components/InitialMessageModal';
import { HomeHeroVisual } from '../components/HomeHeroVisual';

interface Props {
  currentUser: StudentProfile;
  weights: MatchingWeights;
  onOpenWeightsDrawer: () => void;
}

export const HomePage: React.FC<Props> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [selectedStudentForMessage, setSelectedStudentForMessage] = useState<StudentProfile | null>(null);

  // Real Firestore students for discovery
  const [peopleToMeet, setPeopleToMeet] = useState<StudentProfile[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);

  // Content collections from dataService
  const allProjects = dataService.getAllProjects();
  const allEvents = dataService.getAllEvents();
  const allCommunities = dataService.getAllCommunities();

  // Load real Firestore students and following list
  useEffect(() => {
    let isMounted = true;
    setIsLoadingPeople(true);

    if (currentUser?.id) {
      followService.getFollowingList(currentUser.id).then(ids => {
        if (isMounted) setFollowingIds(ids);
      });
    }

    firestoreService.getAllStudents()
      .then(students => {
        if (isMounted) {
          const others = students.filter(s => s.id !== currentUser?.id);
          setPeopleToMeet(others.slice(0, 4));
          setIsLoadingPeople(false);
        }
      })
      .catch(err => {
        console.error('Failed to load real students for homepage:', err);
        if (isMounted) {
          setPeopleToMeet([]);
          setIsLoadingPeople(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/discover?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  const handleFollowChange = (targetStudentId: string, isNowFollowing: boolean) => {
    setFollowingIds(prev => 
      isNowFollowing 
        ? [...prev, targetStudentId]
        : prev.filter(id => id !== targetStudentId)
    );
  };

  // 2. What's Happening (Events, limit to 3)
  const upcomingEvents = allEvents.slice(0, 3);

  // 3. Projects looking for teammates (limit to 3)
  const showcaseProjects = allProjects.slice(0, 3);

  // 4. Campus Communities (limit to 4)
  const showcaseCommunities = allCommunities.slice(0, 4);

  const firstName = currentUser?.name ? currentUser.name.split(' ')[0] : 'Friend';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-12">
      
      {/* ======================================================== */}
      {/* 1. SOCIAL HERO: COMPACT, BALANCED & ALIVE                */}
      {/* ======================================================== */}
      <section className="bg-white border border-[#E5E5E5] rounded-3xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Greeting, Tagline, and Search */}
          <div className="lg:col-span-7 space-y-3.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] text-[#E63946] text-xs font-semibold border border-[#FFE4E6]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campusly College Community</span>
            </div>

            <h1 className="font-heading font-bold text-2xl sm:text-3xl lg:text-4xl text-[#262626] tracking-tight">
              Welcome back, {firstName} <span className="inline-block animate-pulse">👋</span>
            </h1>
            <p className="text-sm sm:text-base text-[#666666] font-normal leading-relaxed max-w-xl mx-auto lg:mx-0">
              Find your people. Build something together.
            </p>

            {/* Clean Global Search Input */}
            <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2 bg-[#FFF8F8] border border-[#E5E5E5] focus-within:border-[#FECDD3] focus-within:ring-2 focus-within:ring-[#FFF1F2] rounded-2xl p-1.5 transition shadow-2xs">
                <Search className="w-4 h-4 text-[#999999] ml-3 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students, projects, communities..."
                  className="w-full bg-transparent px-2 py-1.5 text-xs sm:text-sm text-[#262626] placeholder:text-[#999999] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#E63946] hover:bg-[#D62839] active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition duration-150 shrink-0 cursor-pointer shadow-xs"
                >
                  Search
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Compact Living Collaboration Visual */}
          <div className="lg:col-span-5 flex items-center justify-center pt-2 lg:pt-0">
            <HomeHeroVisual />
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 2. PEOPLE YOU MIGHT WANT TO MEET                         */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#262626]">
              People You Might Want to Meet
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Fellow students from {currentUser?.college ? currentUser.college.split(' ')[0] : 'Campus'} building and learning
            </p>
          </div>
          <Link
            to="/students"
            className="text-xs font-semibold text-[#E63946] hover:text-[#D62839] flex items-center gap-1 transition"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {isLoadingPeople && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white border border-[#E5E5E5] rounded-3xl p-5 shadow-xs animate-pulse space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-rose-100" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 bg-rose-100 rounded w-24" />
                    <div className="h-3 bg-rose-50 rounded w-16" />
                  </div>
                </div>
                <div className="h-10 bg-rose-50 rounded-xl" />
                <div className="h-8 bg-rose-100 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {/* Real Students Grid */}
        {!isLoadingPeople && peopleToMeet.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {peopleToMeet.map((student) => (
              <StudentCard
                key={student.id}
                student={student}
                currentStudentId={currentUser.id}
                currentUser={currentUser}
                isFollowing={followingIds.includes(student.id)}
                onFollowChange={handleFollowChange}
                onMessageClick={(s) => setSelectedStudentForMessage(s)}
              />
            ))}
          </div>
        )}

        {/* Clean Empty State (Zero Fake Students) */}
        {!isLoadingPeople && peopleToMeet.length === 0 && (
          <div className="p-8 sm:p-10 text-center bg-white border border-[#E5E5E5] rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#FFF1F2] text-[#E63946] mx-auto flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-base text-[#262626]">
              No other students found yet
            </h3>
            <p className="text-xs text-[#666666] max-w-md mx-auto leading-relaxed">
              Be a campus pioneer! Invite your classmates, project partners, and friends to sign up for Campusly so you can discover, follow, and collaborate with each other.
            </p>
            <div className="pt-2">
              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin);
                  alert('Campusly link copied to clipboard! Share it with your friends.');
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#E63946] hover:bg-[#D62839] active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition duration-150 shadow-xs cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Copy Campusly Invite Link</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ======================================================== */}
      {/* 3. WHAT'S HAPPENING (EVENTS)                             */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#262626]">
              What's Happening Around Campus
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Workshops, hackathons, and gatherings open for registration
            </p>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-[#E63946] hover:text-[#D62839] flex items-center gap-1 transition"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {upcomingEvents.map((evt) => {
            const seatsLeft = Math.max(0, evt.seatsTotal - evt.seatsFilled);
            return (
              <div
                key={evt.id}
                className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                      {evt.category}
                    </span>
                    <span className="text-xs text-[#666666] flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-[#E63946]" />
                      <span>{evt.date.split('2026')[0].trim()}</span>
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#262626] group-hover:text-[#E63946] transition line-clamp-1">
                    {evt.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-[#666666]">
                    <MapPin className="w-3.5 h-3.5 text-[#999999] shrink-0" />
                    <span className="truncate">{evt.location}</span>
                  </div>

                  <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed pt-0.5">
                    {evt.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span>{seatsLeft} seats left</span>
                  </span>
                  <Link
                    to={`/events/${evt.id}`}
                    className="px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D62839] active:scale-[0.98] text-white text-xs font-semibold rounded-xl transition duration-150 shadow-xs"
                  >
                    View Event
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 4. PROJECTS LOOKING FOR TEAMMATES                        */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#262626]">
              Projects Looking for Teammates
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Collaborate on exciting prototypes, hackathon ideas, and open projects
            </p>
          </div>
          <Link
            to="/projects"
            className="text-xs font-semibold text-[#E63946] hover:text-[#D62839] flex items-center gap-1 transition"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {showcaseProjects.map((proj) => {
            const openRoles = proj.roles.filter(r => !r.isFilled);
            const neededCount = openRoles.length;

            return (
              <div
                key={proj.id}
                className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xs hover:shadow-sm hover:-translate-y-0.5 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                      {proj.category}
                    </span>
                    <span className="text-xs text-[#666666] font-semibold flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#E63946]" />
                      <span>{neededCount > 0 ? `${neededCount} teammate${neededCount > 1 ? 's' : ''} needed` : 'Team Full'}</span>
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-[#262626] group-hover:text-[#E63946] transition line-clamp-1">
                    {proj.title}
                  </h3>

                  <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                    "{proj.description}"
                  </p>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.requiredSkills.slice(0, 3).map((skill) => (
                      <span
                        key={skill}
                        className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img
                      src={proj.creatorAvatar || '/avatars/avatar-1.png'}
                      alt={proj.creatorName}
                      className="w-6 h-6 rounded-full object-cover border border-[#E5E5E5]"
                    />
                    <span className="text-xs text-[#666666] font-medium truncate max-w-[100px]">
                      By {proj.creatorName.split(' ')[0]}
                    </span>
                  </div>

                  <Link
                    to={`/projects/${proj.id}`}
                    className="px-3.5 py-1.5 bg-[#FFF8F8] hover:bg-[#E63946] text-[#E63946] hover:text-white border border-[#E5E5E5] hover:border-[#E63946] active:scale-[0.98] text-xs font-semibold rounded-xl transition duration-150"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ======================================================== */}
      {/* 5. CAMPUS COMMUNITIES                                    */}
      {/* ======================================================== */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg sm:text-xl text-[#262626]">
              Campus Communities
            </h2>
            <p className="text-xs text-[#666666] mt-0.5">
              Join active student societies, tech hubs, and academic circles
            </p>
          </div>
          <Link
            to="/communities"
            className="text-xs font-semibold text-[#E63946] hover:text-[#D62839] flex items-center gap-1 transition"
          >
            <span>See all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {showcaseCommunities.map((community) => (
            <CommunityCard key={community.id} community={community} />
          ))}
        </div>
      </section>

      {/* Direct Message Introduction Modal */}
      {selectedStudentForMessage && (
        <InitialMessageModal
          isOpen={Boolean(selectedStudentForMessage)}
          onClose={() => setSelectedStudentForMessage(null)}
          sender={currentUser}
          receiver={selectedStudentForMessage}
        />
      )}

    </div>
  );
};
