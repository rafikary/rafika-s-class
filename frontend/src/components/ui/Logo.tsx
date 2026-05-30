import React from 'react';
import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: { container: 'w-10 h-10', text: 'text-sm' },
    md: { container: 'w-14 h-14', text: 'text-base' },
    lg: { container: 'w-20 h-20', text: 'text-lg' },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Image */}
      <div className={`${currentSize.container} relative flex-shrink-0 rounded-full overflow-hidden border-2 border-[#D4BCFA]/40 shadow-lg shadow-[#D4BCFA]/20`}>
        <div className="w-full h-full bg-gradient-to-br from-[#FAF9FE] to-white p-1">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            {/* Book */}
            <rect x="20" y="35" width="60" height="50" rx="4" fill="url(#logoGrad)" />
            <rect x="20" y="35" width="60" height="50" rx="4" fill="white" fillOpacity="0.15" />
            
            {/* Book spine */}
            <rect x="48" y="35" width="4" height="50" fill="white" fillOpacity="0.25" />
            
            {/* Book pages */}
            <path d="M 30 45 L 70 45" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M 30 55 L 65 55" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
            <path d="M 30 65 L 70 65" stroke="white" strokeWidth="2" strokeOpacity="0.3" />
            
            {/* Pencil */}
            <g transform="rotate(-35 65 40)">
              <rect x="60" y="20" width="8" height="25" rx="1" fill="#FFDAB9" />
              <polygon points="64,45 60,50 68,50" fill="#FFB8A0" />
              <rect x="60" y="20" width="8" height="5" fill="#FFB8D1" />
            </g>
            
            {/* Sparkle */}
            <circle cx="75" cy="30" r="2" fill="#FFB8D1" />
            <circle cx="25" cy="80" r="1.5" fill="#B8F4D3" />
            <circle cx="82" cy="70" r="1.5" fill="#A8D8F0" />
            
            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A8D8F0" />
                <stop offset="50%" stopColor="#D4BCFA" />
                <stop offset="100%" stopColor="#FFB8D1" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      {showText && (
        <div>
          <h1 className={`${currentSize.text} font-bold leading-tight tracking-tight`}>
            <span className="bg-gradient-to-r from-[#7B68B0] via-[#D4BCFA] to-[#FFB8D1] bg-clip-text text-transparent">
              Belajar with
            </span>
          </h1>
          <p className={`text-${size === 'sm' ? 'xs' : 'sm'} font-semibold text-[#7B68B0] tracking-wide`}>
            Miss Fika
          </p>
        </div>
      )}
    </div>
  );
}
