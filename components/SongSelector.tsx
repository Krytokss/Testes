import React from 'react';
import { Song } from '../types';
import { SONGS } from '../constants';

interface SongSelectorProps {
  onSelect: (song: Song) => void;
}

export const SongSelector: React.FC<SongSelectorProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-techno-dark text-white p-4 relative z-10 font-sans selection:bg-techno-acid selection:text-black">
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,20,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.5)_1px,transparent_1px)] bg-[length:40px_40px] z-[-1]" />
      
      <div className="border-4 border-white p-2 mb-12 bg-black">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white bg-black px-4 py-2 border border-white">
          RHYTHM<span className="text-techno-acid">_</span>CORE
        </h1>
      </div>

      <div className="flex flex-col w-full max-w-4xl gap-4">
        {SONGS.map((song, index) => (
          <button
            key={song.id}
            onClick={() => onSelect(song)}
            className="group relative flex items-center justify-between bg-techno-gray hover:bg-white border-l-4 border-transparent hover:border-techno-acid p-6 transition-all duration-150 overflow-hidden w-full text-left"
          >
            <div className="flex items-center gap-6 z-10">
              <span className="text-4xl font-black text-gray-700 group-hover:text-black opacity-30">0{index + 1}</span>
              <div>
                <h2 className="text-2xl font-bold text-white group-hover:text-black tracking-wide uppercase">
                  {song.title}
                </h2>
                <p className="text-sm text-techno-green group-hover:text-black font-mono mt-1">
                  {song.artist} // BPM: {song.bpm}
                </p>
              </div>
            </div>

            <div className="z-10 flex flex-col items-end">
               <span className={`px-2 py-0.5 text-xs font-bold uppercase tracking-widest border ${
                  song.difficulty === 'Impossible' ? 'border-red-500 text-red-500 group-hover:border-black group-hover:text-black' :
                  song.difficulty === 'Extreme' ? 'border-yellow-500 text-yellow-500 group-hover:border-black group-hover:text-black' :
                  'border-techno-green text-techno-green group-hover:border-black group-hover:text-black'
               }`}>
                  {song.difficulty}
               </span>
               <span className="text-xs text-gray-500 group-hover:text-black mt-2 hidden md:block max-w-[300px] text-right">
                 {song.description}
               </span>
            </div>
            
            {/* Hover Background Fill */}
            <div className="absolute inset-0 bg-white translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
          </button>
        ))}
      </div>

      <div className="mt-16 text-center text-gray-600 font-mono text-xs uppercase tracking-widest">
        <p>System Ready // Input: A S J K L</p>
      </div>
    </div>
  );
};