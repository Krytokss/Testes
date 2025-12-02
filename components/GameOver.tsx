import React from 'react';
import { ScoreData } from '../types';

interface GameOverProps {
  data: ScoreData;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({ data, onRetry, onMenu }) => {
  const rank = 
    data.notesMissed === 0 ? 'S' :
    data.score > 50000 ? 'A' :
    data.score > 25000 ? 'B' : 'C';

  return (
    <div className="flex flex-col items-center justify-center w-full h-full bg-black/90 text-white z-50 absolute inset-0 backdrop-blur-sm">
      <h2 className="text-6xl font-black text-cyber-pink mb-8 animate-bounce">
        RUN COMPLETE
      </h2>

      <div className="flex flex-col gap-4 text-center font-mono text-xl mb-12 border border-cyber-blue p-8 rounded-lg bg-cyber-dark/80 shadow-[0_0_50px_rgba(0,255,255,0.2)]">
        <div className="text-8xl font-bold mb-4 text-white drop-shadow-[0_0_10px_white]">
          {rank}
        </div>
        
        <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-left">
          <span className="text-gray-400">FINAL SCORE</span>
          <span className="text-cyber-blue font-bold text-right">{data.score.toLocaleString()}</span>
          
          <span className="text-gray-400">MAX COMBO</span>
          <span className="text-yellow-400 font-bold text-right">{data.maxCombo}</span>
          
          <span className="text-gray-400">PERFECT HITS</span>
          <span className="text-green-400 font-bold text-right">{data.notesHit}</span>
          
          <span className="text-gray-400">ERRORS</span>
          <span className="text-red-500 font-bold text-right">{data.notesMissed}</span>
        </div>
      </div>

      <div className="flex gap-8">
        <button 
          onClick={onRetry}
          className="px-8 py-3 bg-cyber-blue text-black font-bold text-xl rounded hover:bg-white hover:scale-110 transition-all"
        >
          RETRY
        </button>
        <button 
          onClick={onMenu}
          className="px-8 py-3 border-2 border-cyber-pink text-cyber-pink font-bold text-xl rounded hover:bg-cyber-pink hover:text-white transition-all"
        >
          MAIN MENU
        </button>
      </div>
    </div>
  );
};
