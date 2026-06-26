import React, { useState, useEffect } from 'react';
import { KeyBindings } from '../types';
import { soundEngine } from './SoundEngine';
import { RotateCcw, Keyboard, Check, ShieldAlert, Zap } from 'lucide-react';

interface OptionsMenuProps {
  bindings: KeyBindings;
  onSaveBindings: (newBindings: KeyBindings) => void;
  onBack: () => void;
}

const actionLabels: Record<keyof KeyBindings, { title: string; desc: string; icon: string }> = {
  moveLeft: { title: 'เดินซ้าย (Move Left)', desc: 'ควบคุมตัวละครให้เคลื่อนที่ไปทางซ้าย', icon: '←' },
  moveRight: { title: 'เดินขวา (Move Right)', desc: 'ควบคุมตัวละครให้เคลื่อนที่ไปทางขวา', icon: '→' },
  jump: { title: 'กระโดด (Jump)', desc: 'กระโดดขึ้นเพื่อข้ามสิ่งกีดขวางหรือหลบหลีก', icon: '↑' },
  attack: { title: 'โจมตีดาบไม้ (Attack)', desc: 'แกว่งดาบไม้พะเนียงเพื่อทำลายสิ่งกีดขวางหรือศัตรู', icon: '⚔️' },
  dash: { title: 'แดช/พุ่งตัว (Dash)', desc: 'พุ่งตัวไปข้างหน้าอย่างรวดเร็วเพื่อหลบหลีก', icon: '⚡' },
  specialSkill: { title: 'พลังหน้ากากผีตาโขน (Special Skill)', desc: 'เปิดใช้งานพลังลี้ลับประจำหน้ากากที่สวมใส่', icon: '👺' },
};

const defaultBindings: KeyBindings = {
  moveLeft: 'ArrowLeft',
  moveRight: 'ArrowRight',
  jump: 'ArrowUp',
  attack: 'KeyZ',
  dash: 'KeyX',
  specialSkill: 'KeyC',
};

const wasdBindings: KeyBindings = {
  moveLeft: 'KeyA',
  moveRight: 'KeyD',
  jump: 'KeyW',
  attack: 'KeyJ',
  dash: 'KeyK',
  specialSkill: 'KeyL',
};

export default function OptionsMenu({ bindings, onSaveBindings, onBack }: OptionsMenuProps) {
  const [activeBindingField, setActiveBindingField] = useState<keyof KeyBindings | null>(null);
  const [tempBindings, setTempBindings] = useState<KeyBindings>({ ...bindings });
  const [pressedKey, setPressedKey] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  // Keyboard test listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default browser scroll behaviors
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      setPressedKey(e.code);

      if (activeBindingField) {
        soundEngine.playSelect();
        const updated = { ...tempBindings, [activeBindingField]: e.code };
        setTempBindings(updated);
        onSaveBindings(updated);
        setActiveBindingField(null);
        
        // Show brief visual feedback toast
        setShowSavedToast(true);
        const timer = setTimeout(() => setShowSavedToast(false), 2000);
        return () => clearTimeout(timer);
      }
    };

    const handleKeyUp = () => {
      setPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeBindingField, tempBindings, onSaveBindings]);

  const applyPreset = (preset: KeyBindings) => {
    soundEngine.playSelect();
    setTempBindings(preset);
    onSaveBindings(preset);
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  // Helper to make key codes look friendly
  const formatKeyName = (code: string) => {
    if (!code) return 'ไม่มี';
    return code
      .replace('Key', '')
      .replace('Digit', '')
      .replace('ArrowLeft', '← (ลูกศรซ้าย)')
      .replace('ArrowRight', '→ (ลูกศรขวา)')
      .replace('ArrowUp', '↑ (ลูกศรขึ้น)')
      .replace('ArrowDown', '↓ (ลูกศรลง)')
      .replace('Space', 'Spacebar')
      .replace('ShiftLeft', 'Shift ซ้าย')
      .replace('ShiftRight', 'Shift ขวา')
      .replace('ControlLeft', 'Ctrl ซ้าย')
      .replace('ControlRight', 'Ctrl ขวา');
  };

  const isKeyInUse = (key: string, field: keyof KeyBindings) => {
    return Object.entries(tempBindings).some(([k, v]) => v === key && k !== field);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 bg-black border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.04)] relative overflow-hidden elegant-radial-bg">
      {/* Radiant Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-black text-white font-sans tracking-widest uppercase">
            CONTROL OPTIONS
          </h2>
          <p className="text-gray-400 text-xs mt-1">
            ปรับแต่งปุ่มบังคับตามความถนัดของคุณเพื่อการผจญภัยในด่านซ้ายได้อย่างราบรื่น
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={() => applyPreset(defaultBindings)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg border border-white/10 transition duration-200"
          >
            <RotateCcw size={12} />
            ค่าเริ่มต้น (Arrows)
          </button>
          <button
            onClick={() => applyPreset(wasdBindings)}
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold rounded-lg border border-white/10 transition duration-200"
          >
            <Keyboard size={12} />
            ปุ่มถนัด (WASD + JKL)
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left column: Keybindings forms */}
        <div className="lg:col-span-7 space-y-3">
          {Object.entries(actionLabels).map(([key, labelInfo]) => {
            const field = key as keyof KeyBindings;
            const currentBoundKey = tempBindings[field];
            const isBindingThis = activeBindingField === field;
            const duplicateDetected = isKeyInUse(currentBoundKey, field);

            return (
              <div
                key={field}
                className={`p-3 md:p-4 rounded-xl transition duration-200 border flex items-center justify-between elegant-glass ${
                  isBindingThis
                    ? 'border-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
                    : 'border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-center gap-3 mr-3">
                  <div className="text-xl md:text-2xl w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    {labelInfo.icon}
                  </div>
                  <div>
                    <h3 className="text-xs md:text-sm font-semibold text-white tracking-wider">{labelInfo.title}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">{labelInfo.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {duplicateDetected && (
                    <div
                      className="text-amber-500 animate-pulse"
                      title="คำเตือน: มีปุ่มซ้ำซ้อนกัน อาจทำให้เกิดปัญหาขณะควบคุม!"
                    >
                      <ShieldAlert size={15} />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      soundEngine.playSelect();
                      setActiveBindingField(isBindingThis ? null : field);
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded transition-all duration-200 min-w-[110px] text-center ${
                      isBindingThis
                        ? 'bg-white text-black border-white animate-pulse'
                        : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10'
                    }`}
                  >
                    {isBindingThis ? 'กดปุ่มใหม่...' : formatKeyName(currentBoundKey)}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column: Interactive Visual Controller Test Pad */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="elegant-glass border border-white/15 rounded-xl p-5 relative overflow-hidden flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Keyboard size={16} className="text-gray-300" />
                <h3 className="font-semibold text-xs text-white uppercase tracking-widest">Controller Test Pad</h3>
              </div>
              <p className="text-[11px] text-gray-400 mb-4 leading-relaxed">
                ทดลองกดปุ่มบนคีย์บอร์ดเพื่อตรวจสอบการตอบสนองจริง แผงควบคุมเสมือนจะสว่างขึ้นเมื่อระบบรับคำสั่งสำเร็จ
              </p>
            </div>

            {/* Virtual Interactive Controller Grid */}
            <div className="space-y-3 py-2">
              <div className="flex justify-center gap-2">
                {/* Jump button mapping */}
                <div
                  className={`w-14 h-12 rounded-lg flex flex-col items-center justify-center border transition-all duration-150 ${
                    pressedKey === tempBindings.jump
                      ? 'bg-white border-white text-black scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-black border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider">JUMP ↑</span>
                  <span className={`text-xs font-bold mt-0.5 ${pressedKey === tempBindings.jump ? 'text-black' : 'text-white'}`}>
                    {tempBindings.jump.replace('ArrowUp', '↑').replace('Key', '')}
                  </span>
                </div>
              </div>

              <div className="flex justify-center gap-2">
                {/* Left button */}
                <div
                  className={`w-14 h-12 rounded-lg flex flex-col items-center justify-center border transition-all duration-150 ${
                    pressedKey === tempBindings.moveLeft
                      ? 'bg-white border-white text-black scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-black border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider">LEFT ←</span>
                  <span className={`text-xs font-bold mt-0.5 ${pressedKey === tempBindings.moveLeft ? 'text-black' : 'text-white'}`}>
                    {tempBindings.moveLeft.replace('ArrowLeft', '←').replace('Key', '')}
                  </span>
                </div>

                <div className="w-14 h-12 rounded-lg flex items-center justify-center border border-white/5 bg-white/5 text-gray-500 text-[10px] font-semibold tracking-wider uppercase">
                  PAD
                </div>

                {/* Right button */}
                <div
                  className={`w-14 h-12 rounded-lg flex flex-col items-center justify-center border transition-all duration-150 ${
                    pressedKey === tempBindings.moveRight
                      ? 'bg-white border-white text-black scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-black border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider">RIGHT →</span>
                  <span className={`text-xs font-bold mt-0.5 ${pressedKey === tempBindings.moveRight ? 'text-black' : 'text-white'}`}>
                    {tempBindings.moveRight.replace('ArrowRight', '→').replace('Key', '')}
                  </span>
                </div>
              </div>

              {/* Action buttons ZXC */}
              <div className="flex justify-center gap-2 pt-3 border-t border-white/10">
                {/* Attack Action */}
                <div
                  className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center border transition-all duration-150 ${
                    pressedKey === tempBindings.attack
                      ? 'bg-white border-white text-black scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-black border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider">ATTACK</span>
                  <span className={`text-[11px] font-bold mt-0.5 ${pressedKey === tempBindings.attack ? 'text-black' : 'text-white'}`}>
                    {tempBindings.attack.replace('Key', '')}
                  </span>
                </div>

                {/* Dash Action */}
                <div
                  className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center border transition-all duration-150 ${
                    pressedKey === tempBindings.dash
                      ? 'bg-white border-white text-black scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-black border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider">DASH</span>
                  <span className={`text-[11px] font-bold mt-0.5 ${pressedKey === tempBindings.dash ? 'text-black' : 'text-white'}`}>
                    {tempBindings.dash.replace('Key', '')}
                  </span>
                </div>

                {/* Special Action */}
                <div
                  className={`flex-1 h-12 rounded-lg flex flex-col items-center justify-center border transition-all duration-150 ${
                    pressedKey === tempBindings.specialSkill
                      ? 'bg-white border-white text-black scale-95 shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                      : 'bg-black border-white/10 text-gray-400'
                  }`}
                >
                  <span className="text-[8px] uppercase tracking-wider">SKILL</span>
                  <span className={`text-[11px] font-bold mt-0.5 ${pressedKey === tempBindings.specialSkill ? 'text-black' : 'text-white'}`}>
                    {tempBindings.specialSkill.replace('Key', '')}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center text-[10px] text-gray-500 mt-2">
              {activeBindingField ? (
                <span className="text-white font-medium animate-pulse">กำลังรอรับสัญญาณแป้นพิมพ์...</span>
              ) : (
                <span>ลองกดปุ่มที่หน้าจอหรือคีย์บอร์ดจริงเพื่อตรวจสอบ</span>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <button
            onClick={() => {
              soundEngine.playSelect();
              onBack();
            }}
            className="w-full py-3 bg-white text-black hover:bg-gray-200 font-extrabold text-xs tracking-widest rounded-lg transition-all duration-200 transform active:scale-98 shadow-md text-center"
          >
            BACK TO TITLE
          </button>
        </div>
      </div>

      {/* Floating Save confirmation */}
      {showSavedToast && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white text-black px-4 py-2 rounded-full font-bold text-xs flex items-center gap-1.5 shadow-xl border border-white/20 animate-bounce">
          <Check size={12} />
          <span className="tracking-widest uppercase text-[10px]">SAVED CONFIG</span>
        </div>
      )}
    </div>
  );
}

