import React, { useState } from 'react';
import { soundEngine } from './SoundEngine';
import { Trophy, Award, Search, RefreshCw, Star } from 'lucide-react';
import { LeaderboardEntry } from '../types';

interface LeaderboardProps {
  onBack: () => void;
}

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: 'ยอดกัลยารัตน์', score: 9850, maskType: 'หน้ากากเจ้าพ่อกวน', date: '2026-06-25' },
  { rank: 2, name: 'เด็กวัดโพนชัย', score: 8720, maskType: 'หน้ากากผีตาโขนเล็ก', date: '2026-06-24' },
  { rank: 3, name: 'เสือป่าด่านซ้าย', score: 7990, maskType: 'หน้ากากผีตาโขนใหญ่', date: '2026-06-25' },
  { rank: 4, name: 'พญาแถนลิขิต', score: 7420, maskType: 'หน้ากากสัจจะสองรัก', date: '2026-06-23' },
  { rank: 5, name: 'หมากกระแหล่งระฆัง', score: 6810, maskType: 'หน้ากากผีตาโขนเล็ก', date: '2026-06-25' },
  { rank: 6, name: 'สายด่วนกุดป่อง', score: 5930, maskType: 'หน้ากากผีตาโขนใหญ่', date: '2026-06-22' },
  { rank: 7, name: 'หนุ่มเมืองหมัน', score: 5120, maskType: 'หน้ากากเจ้าแม่นางเทียม', date: '2026-06-24' },
];

export default function Leaderboard({ onBack }: LeaderboardProps) {
  const [filterMask, setFilterMask] = useState<string>('ALL');
  const [list, setList] = useState<LeaderboardEntry[]>(mockLeaderboard);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    soundEngine.playSelect();
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const filteredList = filterMask === 'ALL'
    ? list
    : list.filter(entry => entry.maskType.includes(filterMask));

  return (
    <div className="w-full max-w-2xl mx-auto p-6 md:p-10 bg-black border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(255,255,255,0.04)] relative overflow-hidden flex flex-col elegant-radial-bg">
      {/* Radiant Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-white/5 blur-[80px] rounded-full pointer-events-none" />

      {/* Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-5 mb-6">
        <div className="flex items-center gap-2.5">
          <Trophy className="text-white w-7 h-7 float-anim" />
          <div>
            <h2 className="text-xl font-black text-white font-sans tracking-widest uppercase">
              HIGH SCORES
            </h2>
            <p className="text-[11px] text-gray-400 mt-1">
              ทำเนียบสุดยอดผู้พิทักษ์แห่งประเพณีบุญหลวงด่านซ้าย
            </p>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition"
          title="โหลดคะแนนใหม่"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-white' : ''} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'ALL', label: 'ทั้งหมด' },
          { id: 'ผีตาโขนเล็ก', label: 'ผีตาโขนเล็ก' },
          { id: 'ผีตาโขนใหญ่', label: 'ผีตาโขนใหญ่' },
          { id: 'เจ้าพ่อกวน', label: 'สายเวทย์เจ้าพ่อ' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              soundEngine.playSelect();
              setFilterMask(tab.id);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterMask === tab.id
                ? 'bg-white text-black font-extrabold'
                : 'bg-white/5 text-gray-400 hover:text-white border border-white/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Table */}
      <div className="flex-1 space-y-2">
        {filteredList.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs uppercase tracking-wider">
            No scores match this filter.
          </div>
        ) : (
          filteredList.map((entry, idx) => {
            const isTop3 = entry.rank <= 3;
            return (
              <div
                key={entry.rank}
                className={`flex items-center justify-between p-3.5 rounded-xl border transition duration-200 elegant-glass ${
                  isTop3
                    ? 'border-white/30 bg-white/5 shadow-[0_0_15px_rgba(255,255,255,0.05)]'
                    : 'border-white/5 hover:border-white/10'
                }`}
              >
                {/* Left side: Rank + Avatar + Name */}
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg font-bold text-xs flex items-center justify-center ${
                    entry.rank === 1 ? 'bg-white text-black font-black shadow-[0_0_12px_rgba(255,255,255,0.2)]' :
                    entry.rank === 2 ? 'bg-gray-300 text-black' :
                    entry.rank === 3 ? 'bg-gray-700 text-white' :
                    'bg-white/5 text-gray-400 border border-white/10'
                  }`}>
                    {entry.rank === 1 ? <Award size={14} /> : entry.rank}
                  </div>

                  <div>
                    <div className="font-semibold text-white text-xs md:text-sm flex items-center gap-1.5">
                      {entry.name}
                      {entry.rank === 1 && <Star size={11} className="text-white fill-white animate-spin" style={{ animationDuration: '8s' }} />}
                    </div>
                    <div className="text-[10px] text-gray-500 flex items-center gap-2 mt-0.5 font-mono">
                      <span className="bg-white/5 px-1.5 py-0.5 rounded text-[9px] border border-white/5 text-white">
                        {entry.maskType}
                      </span>
                      <span>• {entry.date}</span>
                    </div>
                  </div>
                </div>

                {/* Right side: Score */}
                <div className="text-right">
                  <div className="font-mono text-sm md:text-base font-bold text-white">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">PTS</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Back button */}
      <div className="mt-8 border-t border-white/10 pt-5">
        <button
          onClick={() => {
            soundEngine.playSelect();
            onBack();
          }}
          className="w-full py-3 bg-white text-black hover:bg-gray-200 font-extrabold text-xs tracking-widest rounded-lg transition duration-200 text-center"
        >
          BACK TO TITLE
        </button>
      </div>
    </div>
  );
}

