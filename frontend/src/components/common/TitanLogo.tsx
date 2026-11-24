import React from 'react';

export const TitanLogo: React.FC<{ size?: number; className?: string }> = ({ size = 28, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform hover:scale-105 ${className}`}
    >
      <defs>
        <linearGradient id="titanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="titanAccent" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#93C5FD" />
        </linearGradient>
        <filter id="titanGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#2563EB" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Hexagonal Shield Background */}
      <rect width="32" height="32" rx="7" fill="#0A0A0A" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#262626" />

      {/* Stylized TITAN 'T' Monogram */}
      <g filter="url(#titanGlow)">
        {/* Top Horizontal Bar */}
        <path
          d="M6 8.5C6 7.67157 6.67157 7 7.5 7H24.5C25.3284 7 26 7.67157 26 8.5V11C26 11.5523 25.5523 12 25 12H7C6.44772 12 6 11.5523 6 11V8.5Z"
          fill="url(#titanAccent)"
        />
        {/* Central Vertical Pillar with Angular Bevel */}
        <path
          d="M13 12H19V21.5L16 25L13 21.5V12Z"
          fill="url(#titanGradient)"
        />
        {/* Futuristic Side Accents */}
        <path d="M8 14.5L10.5 17V20.5L8 18V14.5Z" fill="#3B82F6" fillOpacity="0.8" />
        <path d="M24 14.5L21.5 17V20.5L24 18V14.5Z" fill="#3B82F6" fillOpacity="0.8" />
      </g>

      {/* Core Energy Dot */}
      <circle cx="16" cy="15.5" r="1.5" fill="#FFFFFF" />
    </svg>
  );
};
