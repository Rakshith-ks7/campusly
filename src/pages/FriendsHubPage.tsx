import React, { useState } from 'react';
import { dataService } from '../services/dataService';
import { 
  HeartHandshake, 
  Users, 
  Gamepad2, 
  Music, 
  Film, 
  Dumbbell, 
  BookOpen, 
  Check, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const FriendsHubPage: React.FC = () => {
  const currentUser = dataService.getCurrentUser();
  const allStudents = dataService.getAllStudents();
  const [selectedHobby, setSelectedHobby] = useState<string>('All');
  const [connections, setConnections] = useState(dataService.getConnectionsForUser(currentUser.id));
  const [connectedIds, setConnectedIds] = useState<string[]>(
    dataService.getConnectionsForUser(currentUser.id).map(c => c.toId === currentUser.id ? c.fromId : c.toId)
  );

  const hobbies = [
    'All',
    'Gaming',
    'Music',
    'Movies',
    'Coding',
    'Sports',
    'Fitness',
    'Reading',
    'Photography',
    'Robotics'
  ];

  const handleConnect = (studentId: string, studentName: string) => {
    dataService.sendConnectionRequest(studentId, `Hi ${studentName}! I'd love to connect on campus.`);
    setConnectedIds([...connectedIds, studentId]);
    setConnections(dataService.getConnectionsForUser(currentUser.id));
  };

  // Filter students
  const filteredStudents = allStudents.filter(s => {
    if (s.id === currentUser.id) return false;
    if (selectedHobby === 'All') return true;
    return s.interests.some(i => i.toLowerCase().includes(selectedHobby.toLowerCase())) ||
      s.bio.toLowerCase().includes(selectedHobby.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
            <HeartHandshake className="w-3.5 h-3.5" />
            <span>Campus Social & Friendships</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            Friends Hub
          </h1>
          <p className="text-sm text-[#E63946] font-medium">
            "Meet people with shared hobbies and interests on campus."
          </p>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Find college peers who share your passions outside the classroom — gaming sessions, badminton matches, music jams, film screenings, and study breaks.
          </p>
          
          <div className="pt-2 flex items-center gap-2 text-xs text-[#666666]">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Safe, respectful, strictly collegiate community for making university friends.</span>
          </div>
        </div>
      </div>

      {/* Hobbies Filter Pills */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-heading font-semibold text-base text-[#262626]">
            Explore by Hobby & Interest:
          </h2>
          <span className="text-xs text-[#666666]">
            Showing {filteredStudents.length} students
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {hobbies.map((hobby) => (
            <button
              key={hobby}
              onClick={() => setSelectedHobby(hobby)}
              className={`text-xs px-3.5 py-1.5 rounded-lg transition font-medium whitespace-nowrap ${
                selectedHobby === hobby
                  ? 'bg-[#E63946] text-white shadow-xs'
                  : 'bg-white border border-[#E5E5E5] text-[#666666] hover:border-[#FECDD3]'
              }`}
            >
              {hobby}
            </button>
          ))}
        </div>
      </section>

      {/* Friends Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStudents.map((student) => {
          const isConnected = connectedIds.includes(student.id);
          const sharedHobbies = student.interests.filter(i => currentUser.interests.includes(i));

          return (
            <div
              key={student.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-5 shadow-xs transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={student.avatar}
                    alt={student.name}
                    className="w-12 h-12 rounded-full object-cover border border-[#E5E5E5]"
                  />
                  <div>
                    <h3 className="font-heading font-semibold text-base text-[#262626]">{student.name}</h3>
                    <p className="text-xs text-[#666666]">{student.department.split('&')[0]} • {student.year}</p>
                    <p className="text-[11px] text-[#999999]">{student.college}</p>
                  </div>
                </div>

                <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">
                  {student.bio}
                </p>

                {/* Hobbies / Interests */}
                <div className="space-y-1">
                  <div className="text-[11px] font-semibold text-[#262626]">Hobbies & Interests:</div>
                  <div className="flex flex-wrap gap-1">
                    {student.interests.map(interest => {
                      const isShared = currentUser.interests.includes(interest);
                      return (
                        <span
                          key={interest}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-md border transition ${
                            isShared
                              ? 'bg-[#FFF1F2] text-[#E63946] border-[#FFE4E6] font-semibold'
                              : 'bg-[#FFF8F8] text-[#666666] border-[#E5E5E5]'
                          }`}
                        >
                          {interest} {isShared && '★'}
                        </span>
                      );
                    })}
                  </div>
                </div>

                {sharedHobbies.length > 0 && (
                  <div className="p-2 rounded-lg bg-[#FFF1F2]/60 border border-[#FFE4E6] text-[11px] text-[#E63946]">
                    You both enjoy <strong>{sharedHobbies.join(', ')}</strong>!
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-[11px] text-[#666666]">
                  {student.localityRadius || 'Same College'}
                </span>

                <button
                  onClick={() => handleConnect(student.id, student.name)}
                  disabled={isConnected}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    isConnected
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-[#E63946] hover:bg-[#D62839] text-white'
                  }`}
                >
                  {isConnected ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Request Sent</span>
                    </>
                  ) : (
                    <>
                      <HeartHandshake className="w-3.5 h-3.5" />
                      <span>Connect</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </section>

    </div>
  );
};
