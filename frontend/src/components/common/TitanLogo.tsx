import React from 'react';

export const TitanLogo: React.FC<{ size?: number; className?: string }> = ({ size = 24, className = '' }) => {
  return (
    <div
      style={{ width: size, height: size }}
      className={`grid grid-cols-2 gap-0.5 p-0.5 rounded-sm bg-neutral-900 ${className}`}
    >
      <div className="bg-[#E4262D] rounded-[1px]" />
      <div className="bg-[#2563B0] rounded-[1px]" />
      <div className="bg-[#F6CF1D] rounded-[1px]" />
      <div className="bg-[#1F9D5B] rounded-[1px]" />
    </div>
  );
};
