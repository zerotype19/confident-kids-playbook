export interface Child {
  id: string;
  name: string;
  age_range: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  goal: string;
  steps: string[];
  example_dialogue?: string;
  tip?: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlags {
  'premium.dashboard_insights': boolean;
  'premium.practice_modules': boolean;
  'premium.journal_export': boolean;
  'premium.calendar_schedule': boolean;
  'premium.badge_details': boolean;
}

export interface ProgressSummary {
  child_id: string;
  streak_days: number;
  total_coins: number;
  pillar_progress: {
    1: number; // Independence
    2: number; // Growth
    3: number; // Social
    4: number; // Strength
    5: number; // Emotion
  };
  badges: string[];
} 