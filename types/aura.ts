// Core types for Dad Aura app

export type AuraSource = 'sms' | 'web' | 'watch' | 'shortcut';

export interface AuraEvent {
  id: string;
  timestamp: string;
  emoji: string;
  points: number;
  note?: string;
  source: AuraSource;
  created_at: string;
}

export interface DailyAuraTotal {
  date: string;
  daily_total: number;
  event_count: number;
  emojis: string[];
}

export interface AuraTrend {
  date: string;
  total: number;
  events: number;
}

export interface AuraStats {
  currentTotal: number;
  todayTotal: number;
  last7Days: AuraTrend[];
  last30Days: AuraTrend[];
  recentEvents: AuraEvent[];
}

export interface EmojiPreset {
  emoji: string;
  points: number;
  label: string;
}

export interface ParsedSMS {
  emoji: string;
  points: number;
  note?: string;
}

export interface DadFlip {
  id: string;
  timestamp: string;
  previous_total: number;
  flipped_total: number;
  created_at: string;
}

export interface FlipConfig {
  id: number;
  max_flips_per_day: number;
  updated_at: string;
}

export interface FlipStatus {
  canFlip: boolean;
  flipsUsedToday: number;
  maxFlipsPerDay: number;
  flipsRemainingToday: number;
}

