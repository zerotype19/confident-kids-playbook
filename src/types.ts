export interface Child {
  id: string;
  first_name: string;
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
} 