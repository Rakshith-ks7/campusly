import React from 'react';

export const LoginIllustration: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`} aria-hidden="true">
      <svg
        viewBox="0 0 540 380"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[480px] drop-shadow-2xs"
      >
        {/* Soft Background Warm Hub Oval */}
        <ellipse cx="270" cy="230" rx="240" ry="120" fill="#FFF1F2" />
        <ellipse cx="270" cy="240" rx="200" ry="90" fill="#FFE4E6" fillOpacity="0.45" />

        {/* Subtle Connection Lines linking student spots */}
        <path
          d="M 120 200 Q 200 130 270 170 T 420 190"
          stroke="#FECDD3"
          strokeWidth="2"
          strokeDasharray="4 4"
          fill="none"
        />
        <path
          d="M 180 230 Q 270 270 360 220"
          stroke="#FECDD3"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          fill="none"
        />

        {/* Collaboration Table */}
        <ellipse cx="270" cy="275" rx="190" ry="48" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="2" />
        <ellipse cx="270" cy="275" rx="175" ry="40" fill="#FFF8F8" />

        {/* ======================================================== */}
        {/* STUDENT 1: CODING / DEVELOPER (Left)                     */}
        {/* ======================================================== */}
        <g id="student-coder">
          {/* Chair back */}
          <rect x="110" y="195" width="36" height="55" rx="8" fill="#E5E5E5" />
          {/* Body / Hoodie (Campusly Red) */}
          <path d="M 105 240 Q 128 200 151 240 L 156 290 L 100 290 Z" fill="#E63946" />
          {/* Head / Hair */}
          <circle cx="128" cy="182" r="18" fill="#FBBF24" />
          <circle cx="128" cy="180" r="16" fill="#F87171" />
          {/* Face */}
          <ellipse cx="128" cy="184" rx="13" ry="14" fill="#FDE68A" />
          {/* Hair top */}
          <path d="M 115 178 Q 128 165 141 178 Q 135 170 128 170 Q 121 170 115 178 Z" fill="#78350F" />
          {/* Laptop */}
          <polygon points="135,260 175,260 185,275 130,275" fill="#262626" />
          <rect x="140" y="235" width="36" height="25" rx="3" fill="#3B82F6" />
          <rect x="144" y="239" width="28" height="17" rx="2" fill="#1E293B" />
          {/* Subtle code lines on laptop */}
          <line x1="148" y1="244" x2="162" y2="244" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="148" y1="248" x2="168" y2="248" stroke="#38BDF8" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="152" y1="252" x2="164" y2="252" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ======================================================== */}
        {/* STUDENT 2: UI/UX DESIGNER (Center Left)                  */}
        {/* ======================================================== */}
        <g id="student-designer">
          {/* Body / Sweater */}
          <path d="M 195 230 Q 220 195 245 230 L 250 285 L 190 285 Z" fill="#F87171" />
          {/* Head */}
          <circle cx="220" cy="172" r="17" fill="#38BDF8" />
          <ellipse cx="220" cy="174" rx="13" ry="14" fill="#FDE68A" />
          {/* Curly hair */}
          <path d="M 206 168 Q 220 152 234 168 Q 238 174 234 180 Q 220 162 206 180 Z" fill="#1F2937" />
          {/* Tablet & Stylus */}
          <rect x="210" y="252" width="38" height="26" rx="4" transform="rotate(-6 210 252)" fill="#FFFFFF" stroke="#E5E5E5" strokeWidth="1.5" />
          {/* Palette / Design rect on tablet */}
          <rect x="215" y="256" width="14" height="9" rx="2" fill="#FFE4E6" />
          <circle cx="236" cy="260" r="3" fill="#E63946" />
          <circle cx="242" cy="266" r="2.5" fill="#FBBF24" />
        </g>

        {/* ======================================================== */}
        {/* STUDENT 3: PROJECT CREATOR / BRAINSTORMER (Center Right) */}
        {/* ======================================================== */}
        <g id="student-creator">
          {/* Body */}
          <path d="M 295 230 Q 320 195 345 230 L 350 285 L 290 285 Z" fill="#262626" />
          {/* Head */}
          <ellipse cx="320" cy="172" rx="13" ry="14" fill="#FBCFE8" />
          {/* Sleek hair */}
          <path d="M 307 168 Q 320 155 333 168 L 333 178 Q 320 165 307 178 Z" fill="#4B5563" />
          {/* Notepad / Blueprint on table */}
          <rect x="285" y="258" width="34" height="24" rx="3" fill="#FFFFFF" stroke="#FECDD3" strokeWidth="1.5" />
          <line x1="290" y1="264" x2="310" y2="264" stroke="#E63946" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="290" y1="270" x2="306" y2="270" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="290" y1="276" x2="314" y2="276" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ======================================================== */}
        {/* STUDENT 4: AI & HARDWARE BUILDER (Right)                 */}
        {/* ======================================================== */}
        <g id="student-builder">
          {/* Chair back */}
          <rect x="394" y="195" width="36" height="55" rx="8" fill="#E5E5E5" />
          {/* Body / Campus Jacket */}
          <path d="M 389 240 Q 412 200 435 240 L 440 290 L 384 290 Z" fill="#E63946" />
          {/* Collar detail */}
          <path d="M 405 240 L 412 255 L 419 240 Z" fill="#FFE4E6" />
          {/* Head */}
          <circle cx="412" cy="182" r="18" fill="#1E293B" />
          <ellipse cx="412" cy="184" rx="13" ry="14" fill="#FED7AA" />
          <path d="M 399 178 Q 412 166 425 178 Q 418 172 412 172 Q 406 172 399 178 Z" fill="#18181B" />
          {/* Second Laptop */}
          <polygon points="365,260 405,260 415,275 360,275" fill="#262626" />
          <rect x="370" y="235" width="36" height="25" rx="3" fill="#E2E8F0" />
          <rect x="374" y="239" width="28" height="17" rx="2" fill="#FFE4E6" />
          {/* Small rocket/AI node inside screen */}
          <circle cx="388" cy="247" r="3" fill="#E63946" />
          <circle cx="382" cy="251" r="2" fill="#F87171" />
          <circle cx="394" cy="251" r="2" fill="#F87171" />
        </g>

        {/* Campus Coffee Cup on Table */}
        <rect x="260" y="260" width="12" height="18" rx="2" fill="#FFFFFF" stroke="#E63946" strokeWidth="1.5" />
        <rect x="259" y="258" width="14" height="3" rx="1" fill="#E63946" />

        {/* ======================================================== */}
        {/* SUBTLE LIVING FLOATING ELEMENTS (Keyframes)              */}
        {/* ======================================================== */}
        
        {/* 1. Floating Chat Bubble (Left - Top) */}
        <g className="animate-subtle-float">
          <rect x="90" y="105" width="46" height="32" rx="10" fill="#FFFFFF" stroke="#FFE4E6" strokeWidth="1.5" />
          <polygon points="105,137 114,137 108,145" fill="#FFFFFF" stroke="#FFE4E6" strokeWidth="1.5" />
          <polygon points="106,136 113,136 108,143" fill="#FFFFFF" />
          {/* 3 chat dots */}
          <circle cx="103" cy="121" r="2.5" fill="#E63946" />
          <circle cx="113" cy="121" r="2.5" fill="#F87171" />
          <circle cx="123" cy="121" r="2.5" fill="#FECDD3" />
        </g>

        {/* 2. Floating Star / Spark (Center - Top) */}
        <g className="animate-subtle-float-delayed">
          <circle cx="270" cy="100" r="16" fill="#FFF1F2" stroke="#FFE4E6" strokeWidth="1" />
          <path
            d="M 270 91 L 273 98 L 280 100 L 273 102 L 270 109 L 267 102 L 260 100 L 267 98 Z"
            fill="#E63946"
          />
        </g>

        {/* 3. Floating Code Tag Bubble (Right - Top) */}
        <g className="animate-subtle-float">
          <rect x="410" y="115" width="44" height="30" rx="10" fill="#FFFFFF" stroke="#FFE4E6" strokeWidth="1.5" />
          <polygon points="432,145 440,145 435,152" fill="#FFFFFF" stroke="#FFE4E6" strokeWidth="1.5" />
          <polygon points="433,144 439,144 435,150" fill="#FFFFFF" />
          {/* Brackets < > */}
          <path d="M 424 125 L 420 130 L 424 135" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 440 125 L 444 130 L 440 135" stroke="#E63946" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <line x1="434" y1="124" x2="430" y2="136" stroke="#FECDD3" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* 4. Subtle Notification Bell Dot (Left) */}
        <g className="animate-subtle-pulse">
          <circle cx="175" cy="140" r="8" fill="#E63946" />
          <circle cx="175" cy="140" r="4" fill="#FFFFFF" />
        </g>

        {/* 5. Subtle Project Rocket Node (Right) */}
        <g className="animate-subtle-float-delayed">
          <circle cx="365" cy="130" r="14" fill="#FFF1F2" stroke="#FFE4E6" strokeWidth="1" />
          {/* Mini Rocket Icon */}
          <path
            d="M 368 123 C 363 125 361 129 361 133 L 364 135 L 369 130 Z"
            fill="#E63946"
          />
          <circle cx="366" cy="128" r="1.5" fill="#FFFFFF" />
        </g>

      </svg>
    </div>
  );
};
