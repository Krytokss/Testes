
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameState, Note, Song, ScoreData, LaneIndex } from '../types';
import { KEYS, LANE_COLORS, LANE_KEYS_DISPLAY, HIT_WINDOW, PERFECT_WINDOW, NOTE_TRAVEL_TIME, VISUAL_OFFSET } from '../constants';
import { audioService } from '../services/audioService';
import { generateChart } from '../services/chartGenerator';
import { StarNote } from './StarNote';

interface GameEngineProps {
  song: Song;
  onGameOver: (score: ScoreData) => void;
  onExit: () => void;
}

interface Feedback {
  id: number;
  text: string;
  color: string;
  time: number;
}

export const GameEngine: React.FC<GameEngineProps> = ({ song, onGameOver, onExit }) => {
  const [scoreData, setScoreData] = useState<ScoreData>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    notesHit: 0,
    notesMissed: 0,
    multiplier: 1
  });

  const [visibleNotes, setVisibleNotes] = useState<Note[]>([]);
  const [activeLanes, setActiveLanes] = useState<boolean[]>([false, false, false, false, false]);
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [beatPulse, setBeatPulse] = useState(false);

  // Refs for loop
  const notesRef = useRef<Note[]>([]);
  const animationFrameRef = useRef<number>(0);
  const scoreDataRef = useRef<ScoreData>(scoreData);
  const audioStartTimeRef = useRef<number>(0);

  useEffect(() => {
    // Init Game
    audioService.startMusic(song.bpm, song.id);
    audioStartTimeRef.current = audioService.getStartTime();
    notesRef.current = generateChart(song);
    
    scoreDataRef.current = {
      score: 0,
      combo: 0,
      maxCombo: 0,
      notesHit: 0,
      notesMissed: 0,
      multiplier: 1
    };

    const loop = () => {
      const audioTime = audioService.getCurrentTime();
      const songTime = audioTime - audioStartTimeRef.current;

      // Pulse Effect on Beat (every 60/bpm seconds)
      const beatDuration = 60 / song.bpm;
      const currentBeat = Math.floor(songTime / beatDuration);
      // Rough visual sync for background pulse
      if ((songTime % beatDuration) < 0.1) {
          setBeatPulse(true);
      } else {
          setBeatPulse(false);
      }

      // End Game Check
      if (songTime > song.duration + 2) { 
        onGameOver(scoreDataRef.current);
        return;
      }

      // Update Notes Logic
      let misses = 0;
      notesRef.current.forEach(note => {
        if (!note.hit && !note.missed && songTime > note.time + HIT_WINDOW) {
          note.missed = true;
          misses++;
          audioService.playMissSound();
          addFeedback("MISS", "text-red-600");
        }
      });

      if (misses > 0) {
        handleMiss(misses);
      }

      const travelTimeSec = NOTE_TRAVEL_TIME / 1000;
      
      const visible = notesRef.current.filter(n => 
        !n.hit && 
        !n.missed && 
        n.time < songTime + travelTimeSec && 
        n.time > songTime - 0.2
      );

      setVisibleNotes(visible);
      setFeedbackList(prev => prev.filter(f => performance.now() - f.time < 800));

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
      audioService.stopMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [song]);

  const addFeedback = (text: string, color: string) => {
    setFeedbackList(prev => [...prev, { id: Math.random(), text, color, time: performance.now() }]);
  };

  const handleMiss = (count: number) => {
    const current = scoreDataRef.current;
    const newData = {
      ...current,
      combo: 0,
      notesMissed: current.notesMissed + count,
      multiplier: 1
    };
    scoreDataRef.current = newData;
    setScoreData(newData);
  };

  const handleHit = (note: Note, difference: number) => {
    const current = scoreDataRef.current;
    let points = 100;
    let text = "HIT";
    let color = "text-white";
    
    // Accuracy bonus
    if (Math.abs(difference) < PERFECT_WINDOW) {
      points = 300; 
      text = "CRITICAL";
      color = "text-techno-acid";
    }

    addFeedback(text, color);

    const newCombo = current.combo + 1;
    const newMultiplier = Math.min(8, 1 + Math.floor(newCombo / 20));

    const newData = {
      ...current,
      score: current.score + (points * current.multiplier),
      combo: newCombo,
      maxCombo: Math.max(current.maxCombo, newCombo),
      notesHit: current.notesHit + 1,
      multiplier: newMultiplier
    };
    
    scoreDataRef.current = newData;
    setScoreData(newData);
    
    audioService.playHitSound(note.lane);
    note.hit = true;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const laneIndex = (KEYS as any)[key];

    if (laneIndex !== undefined) {
      setActiveLanes(prev => {
        const next = [...prev];
        next[laneIndex] = true;
        return next;
      });

      const audioTime = audioService.getCurrentTime();
      const songTime = audioTime - audioStartTimeRef.current;

      const candidates = notesRef.current.filter(n => 
        !n.hit && 
        !n.missed && 
        n.lane === laneIndex &&
        Math.abs(n.time - songTime) <= HIT_WINDOW
      );

      if (candidates.length > 0) {
        candidates.sort((a, b) => Math.abs(a.time - songTime) - Math.abs(b.time - songTime));
        handleHit(candidates[0], candidates[0].time - songTime);
      } else {
        if (scoreDataRef.current.combo > 0) {
           handleMiss(0); 
        }
      }
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
     const key = e.key.toLowerCase();
     const laneIndex = (KEYS as any)[key];
     if (laneIndex !== undefined) {
       setActiveLanes(prev => {
         const next = [...prev];
         next[laneIndex] = false;
         return next;
       });
     }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const audioTime = audioService.getCurrentTime();
  const currentSongTime = (audioTime - audioStartTimeRef.current) - VISUAL_OFFSET;
  const travelTimeSec = NOTE_TRAVEL_TIME / 1000;
  const HIT_POSITION_PERCENT = 85;

  return (
    <div className={`relative w-full h-full bg-techno-dark overflow-hidden flex flex-col items-center select-none ${beatPulse ? 'bg-[#0a0a0a]' : 'bg-black'} transition-colors duration-100`}>
      
      {/* SCANLINES OVERLAY */}
      <div className="scanline"></div>

      {/* HUD LEFT */}
      <div className="absolute top-8 left-8 z-30 font-sans text-xl pointer-events-none uppercase tracking-widest">
        <div className="flex flex-col border-l-4 border-techno-acid pl-4">
          <span className="text-xs text-gray-500">SYSTEM SCORE</span>
          <span className="text-3xl font-black text-white">{scoreData.score.toLocaleString()}</span>
        </div>
        <div className="mt-4 text-xs text-gray-500">
          MULTIPLIER <span className="text-techno-acid text-lg ml-2">x{scoreData.multiplier}</span>
        </div>
      </div>
      
      {/* HUD RIGHT */}
      <div className="absolute top-8 right-8 z-30 font-sans text-xl text-right pointer-events-none uppercase tracking-widest">
        <div className="flex flex-col border-r-4 border-techno-green pr-4">
          <span className="text-xs text-gray-500">CHAIN LINK</span>
          <span className="text-4xl font-black text-techno-green">{scoreData.combo}</span>
        </div>
      </div>

      <button 
        onClick={onExit}
        className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-1 bg-red-900/20 border border-red-600/50 text-red-500 text-xs font-mono hover:bg-red-600 hover:text-black transition-colors"
      >
        [ TERMINATE PROCESS ]
      </button>

      {/* Feedback Text */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        {feedbackList.map(f => (
          <div key={f.id} className={`absolute -translate-x-1/2 text-5xl font-black tracking-tighter ${f.color} opacity-80 animate-[ping_0.3s_ease-out_forwards]`}>
            {f.text}
          </div>
        ))}
      </div>

      {/* 3D Container */}
      <div className="perspective-container w-full max-w-4xl h-full relative mt-0">
        
        {/* The Tunnel/Floor */}
        <div className="highway w-full h-[120%] bg-[#080808] relative border-x border-gray-800 left-0 top-[-10%] origin-bottom">
          
          {/* Lane Lines */}
          <div className="absolute inset-0 flex justify-between px-0 opacity-30">
             {[0, 1, 2, 3, 4, 5].map(i => (
               <div key={i} className="w-px h-full bg-gray-600" />
             ))}
          </div>

           {/* Moving Wireframe Grid */}
           <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_48%,rgba(50,50,50,0.5)_50%,transparent_52%)] bg-[length:100%_100px]" 
                style={{ backgroundPositionY: `${(currentSongTime * 600) % 100}px` }} 
           />
           
           {/* Center Guide Line */}
           <div className="absolute left-1/2 -translate-x-1/2 w-px h-full bg-techno-green/20" />

          {/* Hit Line */}
          <div 
            className="absolute w-full h-2 bg-white/20 border-y border-white/50 z-10" 
            style={{ top: `${HIT_POSITION_PERCENT}%` }}
          />

          {/* Receptors */}
          <div className="absolute w-full flex justify-between px-0 z-10" style={{ top: `${HIT_POSITION_PERCENT - 2.5}%` }}>
            {activeLanes.map((isActive, i) => (
               <div 
                key={i}
                className={`w-[20%] h-16 flex justify-center items-center transition-all duration-50 relative`}
               >
                 {/* Receptor Box */}
                 <div className={`w-full h-4 absolute top-1/2 -translate-y-1/2 transition-colors ${isActive ? 'bg-white' : 'bg-gray-800'}`}></div>
                 
                 <div className={`relative font-sans font-bold text-xl z-20 ${isActive ? 'text-black' : 'text-gray-600'}`}>
                    {LANE_KEYS_DISPLAY[i]}
                 </div>
                 
                 {/* Laser Beam on Press */}
                 {isActive && (
                   <div className={`absolute bottom-0 w-full h-[800px] bg-gradient-to-t from-white/20 to-transparent pointer-events-none mix-blend-overlay`} />
                 )}
               </div>
            ))}
          </div>

          {/* NOTES rendering */}
          <div className="absolute inset-0 pointer-events-none w-full h-full">
             {visibleNotes.map((note) => {
               const timeUntilHit = note.time - currentSongTime;
               const percentTraveled = 1 - (timeUntilHit / travelTimeSec);
               const topPos = percentTraveled * HIT_POSITION_PERCENT;

               if (topPos < -10 || topPos > 110) return null;

               return (
                 <div 
                    key={note.id}
                    className="absolute w-[20%] flex justify-center will-change-[top,transform]"
                    style={{
                      left: `${note.lane * 20}%`,
                      top: `${topPos}%`,
                      transform: `translateY(-50%) scale(${0.5 + (percentTraveled * 0.5)})`,
                      zIndex: Math.floor(percentTraveled * 100)
                    }}
                 >
                   <StarNote colorClass={LANE_COLORS[note.lane].split(' ')[0]} />
                 </div>
               )
             })}
          </div>

        </div>
      </div>
    </div>
  );
};
