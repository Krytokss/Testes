import React from 'react';

interface StarNoteProps {
  colorClass: string;
}

export const StarNote: React.FC<StarNoteProps> = ({ colorClass }) => {
  return (
    <div className={`w-12 h-12 flex items-center justify-center relative ${colorClass} rounded-full`}>
      {/* Inner Star SVG */}
      <svg 
        viewBox="0 0 24 24" 
        fill="white" 
        className="w-full h-full drop-shadow-lg animate-pulse-fast"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      {/* Glow effect ring */}
      <div className="absolute inset-0 rounded-full border-2 border-white opacity-50 animate-ping"></div>
    </div>
  );
};
