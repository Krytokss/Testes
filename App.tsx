import React, { useState } from 'react';
import { GameState, Song, ScoreData } from './types';
import { SongSelector } from './components/SongSelector';
import { GameEngine } from './components/GameEngine';
import { GameOver } from './components/GameOver';

function App() {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [lastScore, setLastScore] = useState<ScoreData | null>(null);

  const handleSelectSong = (song: Song) => {
    setSelectedSong(song);
    setGameState(GameState.PLAYING);
  };

  const handleGameOver = (data: ScoreData) => {
    setLastScore(data);
    setGameState(GameState.GAME_OVER);
  };

  const handleExit = () => {
    setGameState(GameState.MENU);
    setSelectedSong(null);
  };

  const handleRetry = () => {
    setGameState(GameState.PLAYING);
  };

  return (
    <div className="w-full h-screen overflow-hidden bg-black font-sans">
      
      {gameState === GameState.MENU && (
        <SongSelector onSelect={handleSelectSong} />
      )}

      {gameState === GameState.PLAYING && selectedSong && (
        <GameEngine 
          song={selectedSong} 
          onGameOver={handleGameOver}
          onExit={handleExit}
        />
      )}

      {gameState === GameState.GAME_OVER && lastScore && (
        <GameOver 
          data={lastScore} 
          onRetry={handleRetry} 
          onMenu={handleExit} 
        />
      )}
    </div>
  );
}

export default App;
