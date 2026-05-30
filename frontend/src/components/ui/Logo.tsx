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
      <div className={`${currentSize.container} relative flex-shrink-0 rounded-full overflow-hidden border-2 border-[#C4A5D8]/30 shadow-md`}>
        <div className="w-full h-full bg-gradient-to-br from-[#F5F1F8] to-white p-1">
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
              <rect x="60" y="20" width="8" height="25" rx="1" fill="#E5B8A0" />
              <polygon points="64,45 60,50 68,50" fill="#D4A088" />
              <rect x="60" y="20" width="8" height="5" fill="#D4A5C3" />
            </g>
            
            {/* Sparkle */}
            <circle cx="75" cy="30" r="2" fill="#E5B8A0" />
            <circle cx="25" cy="80" r="1.5" fill="#D4A5C3" />
            <circle cx="82" cy="70" r="1.5" fill="#9EB6C7" />
            
            {/* Gradient Definitions */}
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#9EB6C7" />
                <stop offset="50%" stopColor="#C4A5D8" />
                <stop offset="100%" stopColor="#D4A5C3" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      
      {showText && (
        <div>
          <h1 className={`${currentSize.text} font-bold leading-tight tracking-tight`}>
            <span className="bg-gradient-to-r from-[#8B7A99] via-[#C4A5D8] to-[#D4A5C3] bg-clip-text text-transparent">
              Belajar with
            </span>
          </h1>
          <p className={`text-${size === 'sm' ? 'xs' : 'sm'} font-semibold text-[#8B7A99] tracking-wide`}>
            Miss Fika
          </p>
        </div>
      )}
    </div>
  );
}
