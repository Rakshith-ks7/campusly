import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Trophy, 
  Calendar, 
  X, 
  Minimize2, 
  Maximize2, 
  ChevronRight, 
  Sparkles, 
  Users, 
  Clock,
  ArrowRight
} from 'lucide-react';
import { CampusEvent } from '../types';
import { dataService } from '../services/dataService';

export const CampusAlertPopup: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    // Check if user dismissed today
    const dismissedDate = localStorage.getItem('campusly_alert_dismissed_today');
    const today = new Date().toISOString().split('T')[0];

    if (dismissedDate === today) {
      setIsVisible(false);
      return;
    }

    // Gentle delayed appearance (2.5 seconds after page loads) so it doesn't interrupt initial page load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    if (dontShowAgain) {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('campusly_alert_dismissed_today', today);
    }
  };

  if (!isVisible) return null;

  // Minimized state: sleek non-disturbing floating pill in corner
  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-40 animate-in fade-in slide-in-from-bottom-3">
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white border border-[#FECDD3] shadow-md hover:shadow-lg hover:border-[#E63946] text-xs font-semibold text-[#262626] transition group"
        >
          <span className="w-2 h-2 rounded-full bg-[#E63946] animate-ping" />
          <span className="text-[#E63946]">🚀 Hackathon & Workshop Alert</span>
          <Maximize2 className="w-3.5 h-3.5 text-[#999999] group-hover:text-[#E63946] ml-1" />
        </button>
      </div>
    );
  }

  return (
    <aside 
      aria-label="Upcoming Campus Hackathons & Events Alert"
      className="fixed bottom-5 right-5 z-40 w-[calc(100vw-2.5rem)] sm:w-[370px] bg-white border border-[#FECDD3] rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300"
    >
      {/* Top Alert Header */}
      <div className="bg-[#FFF1F2] px-4 py-2.5 border-b border-[#FFE4E6] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#E63946] text-white flex items-center justify-center">
            <Trophy className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-[#E63946] tracking-tight">
            Upcoming Hackathons & Events
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Minimize button */}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 rounded-md text-[#999999] hover:text-[#262626] hover:bg-white/80 transition"
            title="Minimize"
          >
            <Minimize2 className="w-3.5 h-3.5" />
          </button>
          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="p-1 rounded-md text-[#999999] hover:text-[#262626] hover:bg-white/80 transition"
            title="Dismiss"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Alert Body */}
      <div className="p-4 space-y-3.5">
        
        {/* Item 1: Hackathon Highlight */}
        <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] hover:border-[#FECDD3] transition space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              ⚡ Campus Qualifier
            </span>
            <span className="text-[11px] text-[#E63946] font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Closes in 3 days</span>
            </span>
          </div>

          <h4 className="font-heading font-bold text-xs sm:text-sm text-[#262626] group-hover:text-[#E63946] transition">
            Smart India Hackathon (SIH 2026) Internal Screening
          </h4>

          <p className="text-[11px] text-[#666666] leading-relaxed">
            Register your 6-member team. Top 5 teams represent the college at national finals.
          </p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#666666] flex items-center gap-1">
              <Users className="w-3 h-3 text-[#999999]" />
              <span>4-6 students/team</span>
            </span>
            <Link
              to="/events/event-sih-bootcamp"
              onClick={() => setIsVisible(false)}
              className="text-xs font-semibold text-[#E63946] hover:underline inline-flex items-center gap-0.5"
            >
              <span>View Details</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* Item 2: Hands-on Workshop */}
        <div className="p-3 rounded-xl bg-[#FFF8F8] border border-[#E5E5E5] hover:border-[#FECDD3] transition space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#FFF1F2] text-[#E63946] border border-[#FFE4E6]">
              💻 Technical Workshop
            </span>
            <span className="text-[11px] text-emerald-600 font-medium">
              12 seats remaining
            </span>
          </div>

          <h4 className="font-heading font-bold text-xs sm:text-sm text-[#262626] group-hover:text-[#E63946] transition">
            Hands-on Modern React & Next.js Workshop
          </h4>

          <div className="flex items-center gap-2 text-[11px] text-[#666666]">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#999999]" />
              <span>Sep 7 • 4:00 PM</span>
            </span>
            <span>•</span>
            <span>Auditorium C</span>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#666666]">By GDSC & Web Dev Club</span>
            <Link
              to="/events/event-react-workshop"
              onClick={() => setIsVisible(false)}
              className="px-2.5 py-1 rounded-lg bg-[#E63946] hover:bg-[#D62839] text-white text-[11px] font-semibold transition"
            >
              Register Now
            </Link>
          </div>
        </div>

      </div>

      {/* Non-disturbing Footer with "Don't show again today" checkbox */}
      <div className="px-4 py-2.5 bg-[#FFF8F8] border-t border-[#E5E5E5] flex items-center justify-between text-[11px] text-[#666666]">
        <label className="flex items-center gap-1.5 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded text-[#E63946] focus:ring-[#FECDD3] w-3.5 h-3.5"
          />
          <span>Don't show again today</span>
        </label>

        <button
          onClick={handleDismiss}
          className="font-semibold text-[#262626] hover:text-[#E63946] transition"
        >
          Got it
        </button>
      </div>

    </aside>
  );
};
