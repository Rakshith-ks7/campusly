import React from 'react';
import { MessageSquare, Code, Rocket, Users } from 'lucide-react';

export const HomeHeroVisual: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div 
      className={`relative w-full max-w-[360px] sm:max-w-[400px] h-[220px] sm:h-[240px] flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      {/* Background SVG connecting arcs */}
      <svg
        viewBox="0 0 400 240"
        className="absolute inset-0 w-full h-full"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Soft backdrop oval */}
        <ellipse cx="200" cy="120" rx="170" ry="90" fill="#FFF1F2" fillOpacity="0.7" />
        <ellipse cx="200" cy="120" rx="130" ry="70" fill="#FFE4E6" fillOpacity="0.4" />

        {/* Subtle connection paths */}
        <path
          d="M 80 70 Q 150 120 200 120 T 320 60"
          stroke="#FECDD3"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 100 170 Q 180 140 200 120 T 300 175"
          stroke="#FECDD3"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 80 70 L 100 170"
          stroke="#FFE4E6"
          strokeWidth="1.5"
        />
        <path
          d="M 320 60 L 300 175"
          stroke="#FFE4E6"
          strokeWidth="1.5"
        />
      </svg>

      {/* Central Campusly Collaboration Node */}
      <div className="absolute z-10 w-11 h-11 rounded-2xl bg-white border-2 border-[#E63946] flex items-center justify-center shadow-xs">
        <Rocket className="w-5 h-5 text-[#E63946]" />
      </div>

      {/* Avatar Node 1: Top Left (Developer / Coder) */}
      <div className="absolute top-4 left-8 sm:left-10 z-20 animate-subtle-float flex items-center gap-2">
        <div className="relative">
          <img
            src="/avatars/avatar-1.png"
            alt=""
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#FFE4E6] flex items-center justify-center text-[#E63946] shadow-2xs">
            <Code className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Avatar Node 2: Top Right (Designer / Project Lead) */}
      <div className="absolute top-3 right-8 sm:right-10 z-20 animate-subtle-float-delayed flex items-center gap-2">
        <div className="relative">
          <img
            src="/avatars/avatar-4.png"
            alt=""
            className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#FFE4E6] flex items-center justify-center text-[#E63946] shadow-2xs">
            <MessageSquare className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Avatar Node 3: Bottom Left (Peer / Contributor) */}
      <div className="absolute bottom-5 left-12 sm:left-14 z-20 animate-subtle-float-delayed flex items-center gap-2">
        <div className="relative">
          <img
            src="/avatars/avatar-8.png"
            alt=""
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white border border-[#FFE4E6] flex items-center justify-center text-[#E63946] shadow-2xs">
            <Users className="w-3 h-3" />
          </span>
        </div>
      </div>

      {/* Avatar Node 4: Bottom Right (Creator / Partner) */}
      <div className="absolute bottom-4 right-10 sm:right-12 z-20 animate-subtle-float flex items-center gap-2">
        <div className="relative">
          <img
            src="/avatars/avatar-12.png"
            alt=""
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
          />
          <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
        </div>
      </div>

      {/* Subtle Floating Notification Pill */}
      <div className="absolute -bottom-2 z-30 animate-subtle-pulse">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#FFE4E6] shadow-xs text-[11px] font-semibold text-[#262626]">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span className="text-[#666666]">Squad:</span>
          <span className="text-[#E63946]">Teammates connected</span>
        </div>
      </div>
    </div>
  );
};
