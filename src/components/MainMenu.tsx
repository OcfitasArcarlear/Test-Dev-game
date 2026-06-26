import React, { useState, useEffect } from 'react';
import { GameScreen } from '../types';
import { soundEngine } from './SoundEngine';
import { Play, Settings, BookOpen, Trophy, Volume2, VolumeX, ShieldAlert, Sparkles, MapPin, Layers } from 'lucide-react';

interface MainMenuProps {
  onNavigate: (screen: GameScreen) => void;
}

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const [isMuted, setIsMuted] = useState(soundEngine.getMuted());
  const [sparkles, setSparkles] = useState<{ id: number; left: string; top: string; size: string; delay: string }[]>([]);

  // Generate glowing firefly/candle sparkles on the black background
  useEffect(() => {
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 2.5 + 1.5}px`,
      delay: `${Math.random() * 8}s`,
    }));
    setSparkles(list);
  }, []);

  const handleMenuClick = (screen: GameScreen) => {
    soundEngine.playSelect();
    onNavigate(screen);
  };

  const handleHover = () => {
    soundEngine.playHover();
  };

  const toggleSound = () => {
    const nextMute = soundEngine.toggleMute();
    setIsMuted(nextMute);
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-[620px] bg-black border border-white/10 rounded-2xl p-6 md:p-12 relative flex flex-col justify-between items-center overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.04)] elegant-radial-bg">
      
      {/* Background Animated Sparks */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          className="absolute bg-white rounded-full opacity-30 animate-pulse pointer-events-none"
          style={{
            left: sp.left,
            top: sp.top,
            width: sp.size,
            height: sp.size,
            animationDelay: sp.delay,
            animationDuration: '4s',
            filter: 'blur(0.5px)'
          }}
        />
      ))}

      {/* Elegant Radial Gradients */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.25)_0%,rgba(0,0,0,1)_100%)]"></div>

      {/* Sound Toggle & Location (Top-Right) */}
      <div className="w-full flex justify-between items-start z-10">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-gray-400 backdrop-blur-sm">
            <MapPin size={11} className="text-white animate-pulse" />
            <span>อ.ด่านซ้าย จ.เลย • Dan Sai, Loei</span>
          </div>
        </div>

        <button
          onClick={toggleSound}
          className="p-2.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 rounded-lg transition duration-200 backdrop-blur-sm"
          title={isMuted ? 'เปิดเสียงเพลงประกอบ' : 'ปิดเสียงเพลงประกอบ'}
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="animate-pulse" />}
        </button>
      </div>

      {/* Main Container Layout */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-6 z-10">
        
        {/* Left Side: Geometric Logo & Titles */}
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
          
          {/* Geometric Diamond Frame wrapping the Logo */}
          <div className="w-36 h-36 mb-6 border-2 border-white flex items-center justify-center relative float-anim select-none">
            <div className="absolute inset-0 border border-white/20 transform rotate-45 scale-110"></div>
            <div className="absolute inset-0 border border-white/10 transform -rotate-45 scale-115"></div>
            
            {/* Logo Image */}
            <img
              src="https://res.cloudinary.com/dd86koakl/image/upload/v1782440054/logo_odpi3y.png"
              alt="Dan Sai Adventure Logo"
              className="w-24 h-24 object-contain pixelated z-10 logo-glow"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Titles in Elegant font */}
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[0.1em] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500 font-sans uppercase drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] leading-tight">
              Dan Sai<br/>
              <span className="text-2xl md:text-3xl lg:text-4xl font-light tracking-[0.25em] text-gray-300">Adventure</span>
            </h1>
            <p className="text-xs md:text-sm font-semibold tracking-widest text-gray-400 font-sans uppercase border-l-2 border-white pl-3">
              ผจญภัยดินแดนหน้ากากผีตาโขน
            </p>
          </div>

          <div className="h-[2px] w-20 bg-white/40 mt-6"></div>
        </div>

        {/* Right Side: Menu Buttons & HUD System Status */}
        <div className="lg:col-span-5 flex flex-col space-y-6 w-full max-w-sm mx-auto lg:mx-0">
          
          {/* Main Action Menu Buttons */}
          <div className="space-y-3">
            {/* 1. START GAME */}
            <button
              onClick={() => handleMenuClick('GAMEPLAY')}
              onMouseEnter={handleHover}
              className="w-full group relative py-3.5 bg-white text-black hover:bg-gray-100 font-extrabold text-sm tracking-widest rounded-lg transition duration-300 transform active:scale-[0.98] flex items-center justify-center gap-2.5 shadow-[0_0_20px_rgba(255,255,255,0.25)]"
            >
              <Play size={14} fill="currentColor" />
              <span>START ADVENTURE</span>
            </button>

            {/* 2. OPTIONS (Keys Config) */}
            <button
              onClick={() => handleMenuClick('OPTIONS')}
              onMouseEnter={handleHover}
              className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-semibold text-xs tracking-widest rounded-lg border border-white/10 hover:border-white/30 transition duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Settings size={13} className="text-gray-400" />
              <span>OPTIONS MENU</span>
            </button>

            {/* 3. LORE BOOK */}
            <button
              onClick={() => handleMenuClick('LORE')}
              onMouseEnter={handleHover}
              className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-semibold text-xs tracking-widest rounded-lg border border-white/10 hover:border-white/30 transition duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <BookOpen size={13} className="text-gray-400" />
              <span>CULTURAL LORE</span>
            </button>

            {/* 4. LEADERBOARD */}
            <button
              onClick={() => handleMenuClick('LEADERBOARD')}
              onMouseEnter={handleHover}
              className="w-full py-3 bg-transparent hover:bg-white/5 text-gray-300 hover:text-white font-semibold text-xs tracking-widest rounded-lg border border-white/10 hover:border-white/30 transition duration-200 transform active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Trophy size={13} className="text-gray-400" />
              <span>HIGH SCORES</span>
            </button>
          </div>

          {/* System status box */}
          <div className="p-4 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
            <p className="text-[9px] text-gray-500 font-bold mb-2 tracking-widest uppercase">System Status</p>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-gray-400 uppercase">Engine Status</span>
              <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
                STABLE
              </span>
            </div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[9px] text-gray-400 uppercase">Resolution</span>
              <span className="text-[9px] text-white">Full Responsive</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[9px] text-gray-400 uppercase">Audio Device</span>
              <span className="text-[9px] text-white">Retro Synthesizer</span>
            </div>
          </div>

        </div>
      </div>

      {/* Footer bar */}
      <div className="w-full mt-6 text-center z-10 border-t border-white/10 pt-5 flex flex-col md:flex-row justify-between items-center text-[10px] text-gray-500 gap-2">
        <div className="text-left font-mono">
          <p>© 2026 DAN SAI ADVENTURE. THAI CULTURAL PRESERVATION.</p>
        </div>
        <div className="flex items-center gap-3 font-mono">
          <span>BUILD VER 1.0.4-STABLE</span>
          <span>•</span>
          <span>CRAFTED WITH GOOGLE DESIGN LABS</span>
        </div>
      </div>

    </div>
  );
}

