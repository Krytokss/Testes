
import { Note, Song, LaneIndex } from '../types';

export const generateChart = (song: Song): Note[] => {
  const notes: Note[] = [];
  const beatTime = 60 / song.bpm;
  const totalBeats = (song.duration * song.bpm) / 60;
  
  let currentTime = 1.0; 
  let currentBeat = 0;

  // Generate a pattern of 16 steps (4 beats * 4 sixteenths)
  const generatePattern = (density: number) => {
    const pattern = [];
    for(let i=0; i<16; i++) {
        // High probability of note on downbeats (0, 4, 8, 12)
        const isDownbeat = i % 4 === 0;
        const isOffbeat = i % 2 !== 0;
        
        let prob = density;
        if(isDownbeat) prob += 0.3;
        if(isOffbeat) prob -= 0.1;

        if(Math.random() < prob) {
            pattern.push({
                offset: i * 0.25, // Offset in beats
                lane: Math.floor(Math.random() * 5)
            });
        }
    }
    return pattern;
  };

  // Base density
  let density = 0.3;
  if (song.difficulty === 'Extreme') density = 0.5;
  if (song.difficulty === 'Impossible') density = 0.7;

  // How many times to repeat a pattern before generating a new one
  // For Top Gear style, we want slightly longer loops to feel like a melody
  const patternRepetitions = song.id === 'top_gear' ? 2 : 4; 

  while (currentBeat < totalBeats) {
    // Generate a new pattern for this section
    const pattern = generatePattern(density);

    // Apply this pattern for N repetitions
    for (let r = 0; r < patternRepetitions; r++) {
        if (currentBeat >= totalBeats) break;

        pattern.forEach(p => {
             // For melodic songs, try to make the notes ascend/descend more logically
             // But for now, random lanes is fine for gameplay
             notes.push(createNote(p.lane, currentTime + (p.offset * beatTime)));
        });

        // Advance 4 beats (1 measure)
        currentTime += (4 * beatTime);
        currentBeat += 4;
    }
    
    // Increase intensity slightly over time
    density = Math.min(0.9, density + 0.05);
  }
  
  // Sort notes by time just in case
  return notes.sort((a, b) => a.time - b.time);
};

let noteIdCounter = 0;
const createNote = (lane: number, time: number): Note => {
  return {
    id: `note-${noteIdCounter++}`,
    lane: lane as LaneIndex,
    time: time, 
    hit: false,
    missed: false
  };
};
