
import { LaneIndex, Song } from './types';

export const KEYS = {
  a: LaneIndex.L1,
  s: LaneIndex.L2,
  j: LaneIndex.L3,
  k: LaneIndex.L4,
  l: LaneIndex.L5,
};

// Hit window in seconds
export const HIT_WINDOW = 0.140; 
export const PERFECT_WINDOW = 0.045; 

// Faster speed for Techno feel
export const NOTE_TRAVEL_TIME = 1200; 

// Visual offset
export const VISUAL_OFFSET = 0.0; 

export const SONGS: Song[] = [
  {
    id: 'top_gear',
    title: 'HORIZON CIRCUIT',
    artist: '16_BIT_DRIVER',
    bpm: 145,
    difficulty: 'Extreme',
    duration: 160,
    description: 'The legendary racing anthem. Driving basslines and nitro arpeggios.'
  },
  {
    id: 'warehouse_acid',
    title: 'ACID PROTOCOL',
    artist: 'System_303',
    bpm: 135,
    difficulty: 'Hard',
    duration: 120,
    description: 'Relentless acid basslines in an abandoned factory. Keep the rhythm strict.'
  },
  {
    id: 'industrial_hammer',
    title: 'HAMMER STRIKE',
    artist: 'Pneumatic',
    bpm: 145,
    difficulty: 'Extreme',
    duration: 140,
    description: 'Heavy industrial pounding. Mechanical precision required.'
  },
  {
    id: 'mainframe_breach',
    title: 'MAINFRAME BREACH',
    artist: 'Root_Access',
    bpm: 170,
    difficulty: 'Impossible',
    duration: 180,
    description: 'High-speed data transfer overload. Pure minimal techno chaos.'
  }
];

// Techno Palette: White, Acid Green, Grey, Alert Red, Electric Blue
// Using box-shadows to simulate LED lights
export const LANE_COLORS = [
  'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)]',      // A (Snare/High)
  'bg-techno-acid shadow-[0_0_15px_rgba(204,255,0,0.8)]',  // S (Acid)
  'bg-techno-green shadow-[0_0_15px_rgba(0,255,65,0.8)]',  // J (Mid)
  'bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)]',      // K (Alert)
  'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.8)]'      // L (Deep)
];

export const LANE_KEYS_DISPLAY = ['A', 'S', 'J', 'K', 'L'];
