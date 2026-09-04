import React, { useState } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'bottom',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          role="tooltip"
          className={`absolute z-50 pointer-events-none px-2 py-1 text-[11px] font-medium text-white bg-[#262626] rounded-md shadow-md whitespace-nowrap animate-in fade-in zoom-in-95 duration-100 ${positionClasses[position]}`}
        >
          {content}
          <div
            className={`absolute w-1.5 h-1.5 bg-[#262626] rotate-45 ${
              position === 'bottom'
                ? '-top-0.5 left-1/2 -translate-x-1/2'
                : position === 'top'
                ? '-bottom-0.5 left-1/2 -translate-x-1/2'
                : position === 'left'
                ? '-right-0.5 top-1/2 -translate-y-1/2'
                : '-left-0.5 top-1/2 -translate-y-1/2'
            }`}
          />
        </div>
      )}
    </div>
  );
};
