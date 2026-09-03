import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../services/dataService';
import { CollegeClub } from '../types';
import { 
  Building2, 
  Users, 
  Calendar, 
  Bell, 
  ArrowRight, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export const ClubsPage: React.FC = () => {
  const [clubs] = useState<CollegeClub[]>(dataService.getAllClubs());
  const allEvents = dataService.getAllEvents();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Banner */}
      <div className="bg-white border border-[#E5E5E5] rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF1F2] border border-[#FFE4E6] text-[#E63946] text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Campus Student Societies</span>
          </div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-[#262626]">
            College Clubs & Chapters
          </h1>
          <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
            Officially recognized student-led organizations organizing technical bootcamps, workshops, hackathons, and creative media productions across campus.
          </p>
        </div>

        <Link
          to="/events"
          className="px-4 py-2 bg-white hover:bg-[#FFF1F2] text-[#E63946] border border-[#E5E5E5] hover:border-[#FECDD3] text-xs font-medium rounded-lg transition shrink-0"
        >
          View All Club Events →
        </Link>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clubs.map((club) => {
          const clubEvents = allEvents.filter(e => 
            e.organizerClub.toLowerCase().includes(club.name.toLowerCase()) ||
            club.upcomingEventIds.includes(e.id)
          );

          return (
            <div
              key={club.id}
              className="bg-white border border-[#E5E5E5] hover:border-[#FECDD3] rounded-2xl p-6 shadow-xs transition flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <img
                      src={club.logo}
                      alt={club.name}
                      className="w-14 h-14 rounded-xl object-cover border border-[#E5E5E5]"
                    />
                    <div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
                        {club.category}
                      </span>
                      <h3 className="font-heading font-bold text-base sm:text-lg text-[#262626] mt-1">
                        {club.name}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#666666] leading-relaxed">
                  {club.description}
                </p>

                {/* Leadership and Members */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={club.leadAvatar}
                      alt=""
                      className="w-6 h-6 rounded-full object-cover border"
                    />
                    <span className="text-[#666666]">Lead: <strong className="text-[#262626]">{club.leadName}</strong></span>
                  </div>
                  <div className="text-[#666666] font-medium">
                    {club.memberCount} Members
                  </div>
                </div>

                {/* Announcements */}
                {club.announcements.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-xs font-semibold text-[#262626] flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-[#E63946]" />
                      <span>Latest Announcement</span>
                    </div>
                    {club.announcements.slice(0, 1).map(ann => (
                      <div key={ann.id} className="p-2.5 rounded-lg bg-white border border-[#E5E5E5] text-xs space-y-1">
                        <div className="font-semibold text-[#262626]">{ann.title}</div>
                        <p className="text-[#666666] text-[11px] line-clamp-2">{ann.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div className="pt-4 border-t border-[#E5E5E5] flex items-center justify-between">
                <span className="text-xs text-[#666666]">
                  {clubEvents.length} upcoming workshop(s)
                </span>

                <Link
                  to="/events"
                  className="px-3.5 py-1.5 bg-[#E63946] hover:bg-[#D62839] text-white text-xs font-medium rounded-lg transition"
                >
                  View Events
                </Link>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
