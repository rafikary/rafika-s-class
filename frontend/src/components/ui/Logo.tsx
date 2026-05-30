import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Custom Logo SVG - Book with graduation cap */}
      <div className={`${sizeClasses[size]} relative flex-shrink-0`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Book */}
          <rect x="20" y="35" width="60" height="50" rx="4" fill="url(#grad1)" />
          <rect x="20" y="35" width="60" height="50" rx="4" fill="white" fillOpacity="0.2" />
          
          {/* Book spine */}
          <rect x="48" y="35" width="4" height="50" fill="white" fillOpacity="0.3" />
          
          {/* Book pages */}
          <path d="M 30 45 L 70 45" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
          <path d="M 30 55 L 65 55" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
          <path d="M 30 65 L 70 65" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
          
          {/* Pencil */}
          <g transform="rotate(-35 65 40)">
            <rect x="60" y="20" width="8" height="25" rx="1" fill="#FCD34D" />
            <polygon points="64,45 60,50 68,50" fill="#F59E0B" />
            <rect x="60" y="20" width="8" height="5" fill="#EC4899" />
          </g>
          
          {/* Sparkle */}
          <circle cx="75" cy="30" r="2" fill="#FCD34D" />
          <circle cx="25" cy="80" r="1.5" fill="#EC4899" />
          <circle cx="82" cy="70" r="1.5" fill="#60A5FA" />
          
          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <div>
          <h1 className="text-xl font-bold leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Miss Rafika's
            </span>
          </h1>
          <p className="text-sm font-semibold text-purple-600">Learning Center</p>
        </div>
      )}
    </div>
  );
}
