export interface Child {
  id: string;
  first_name: string;
  name: string;
  avatar_url?: string;
}

export interface Challenge {
  id: string;
  title: string;
  pillar: string;
  goal: string;
  description: string;
  is_completed: boolean;
  reflection?: string;
}

export interface ProgressSummary {
  streak_days: number;
  total_coins: number;
  pillar_progress?: {
    [key: string]: number;
  };
  badges?: {
    id: string;
    name: string;
    description: string;
    icon_url: string;
  }[];
}

export interface FeatureFlags {
  'premium.dashboard_insights': boolean;
  'premium.journal_export': boolean;
  'premium.calendar_schedule': boolean;
  'premium.practice_modules': boolean;
  'premium.badge_details': boolean;
  [key: string]: boolean;
}

export type PillarId = 1 | 2 | 3 | 4 | 5;

export const PILLAR_NAMES: Record<PillarId, string> = {
  1: 'Independence',
  2: 'Growth',
  3: 'Social',
  4: 'Strength',
  5: 'Emotion'
}; 