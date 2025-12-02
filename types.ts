export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  GAME_OVER = 'GAME_OVER',
  PAUSED = 'PAUSED'
}

export enum LaneIndex {
  L1 = 0,
  L2 = 1,
  L3 = 2,
  L4 = 3,
  L5 = 4
}

export interface Note {
  id: string;
  lane: LaneIndex;
  time: number; // Time in SECONDS when the note hits the target (AudioContext time)
  hit: boolean;
  missed: boolean;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  difficulty: 'Hard' | 'Extreme' | 'Impossible';
  duration: number; // in seconds
  description: string;
}

export interface ScoreData {
  score: number;
  combo: number;
  maxCombo: number;
  notesHit: number;
  notesMissed: number;
  multiplier: number;
}