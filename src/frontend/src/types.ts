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