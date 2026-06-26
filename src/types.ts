export interface KeyBindings {
  moveLeft: string;
  moveRight: string;
  jump: string;
  attack: string;
  dash: string;
  specialSkill: string;
}

export type GameScreen = 'TITLE' | 'GAMEPLAY' | 'OPTIONS' | 'LORE' | 'LEADERBOARD';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  maskType: string;
  date: string;
}

export interface MaskOption {
  id: string;
  name: string;
  nameTh: string;
  color: string;
  glow: string;
  skill: string;
  skillTh: string;
  descriptionTh: string;
  descriptionEn: string;
  statSpeed: number; // 1-5
  statJump: number; // 1-5
  statAttack: number; // 1-5
}
