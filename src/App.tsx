/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { GameScreen, KeyBindings } from './types';
import MainMenu from './components/MainMenu';
import GameCanvas from './components/GameCanvas';
import OptionsMenu from './components/OptionsMenu';
import LoreBook from './components/LoreBook';
import Leaderboard from './components/Leaderboard';
import { soundEngine } from './components/SoundEngine';

const DEFAULT_BINDINGS: KeyBindings = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  jump: 'ArrowUp',
  attack: 'KeyZ',
  dash: 'KeyX',
  specialSkill: 'KeyC',
};

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [bindings, setBindings] = useState<KeyBindings>(DEFAULT_BINDINGS);

  // Load saved keybindings on mount
  useEffect(() => {
    const saved = localStorage.getItem('dansai_bindings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setBindings({ ...DEFAULT_BINDINGS, ...parsed });
      } catch (err) {
        console.warn('Could not parse saved keybindings, using defaults');
      }
    }
  }, []);

  const handleSaveBindings = (newBindings: KeyBindings) => {
    setBindings(newBindings);
    localStorage.setItem('dansai_bindings', JSON.stringify(newBindings));
  };

  const handleScreenNavigation = (nextScreen: GameScreen) => {
    setScreen(nextScreen);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 md:p-8 select-none relative overflow-y-auto">
      {/* Absolute Header Overlay */}
      <div className="absolute top-6 left-6 z-50 pointer-events-none hidden md:block font-sans">
        <div className="text-[9px] tracking-[0.2em] text-white/40 font-bold uppercase">
          DAN SAI ADVENTURE
        </div>
      </div>

      <div className="w-full max-w-4xl z-10 transition-all duration-300">
        {screen === 'TITLE' && (
          <MainMenu onNavigate={handleScreenNavigation} />
        )}

        {screen === 'GAMEPLAY' && (
          <GameCanvas bindings={bindings} onExit={() => handleScreenNavigation('TITLE')} />
        )}

        {screen === 'OPTIONS' && (
          <OptionsMenu
            bindings={bindings}
            onSaveBindings={handleSaveBindings}
            onBack={() => handleScreenNavigation('TITLE')}
          />
        )}

        {screen === 'LORE' && (
          <LoreBook onBack={() => handleScreenNavigation('TITLE')} />
        )}

        {screen === 'LEADERBOARD' && (
          <Leaderboard onBack={() => handleScreenNavigation('TITLE')} />
        )}
      </div>

      {/* Floating Sparkles and Atmospheric Background Elements */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-red-950/10 to-transparent pointer-events-none" />
    </div>
  );
}

