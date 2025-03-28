export interface Child {
  id: string;
  name: string;
  age_range: string;
  avatar_url?: string;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string | string[];
  example_dialogue?: string;
  tip?: string;
  pillar_id: number;
  age_range: string;
  difficulty_level: string;
  created_at: string;
  updated_at: string;
}

export interface FeatureFlags {
  is_premium: boolean;
  practice_enabled: boolean;
  media_uploads: boolean;
  calendar_enabled: boolean;
  journal_enabled: boolean;
  family_sharing: boolean;
  'premium.dashboard_insights': boolean;
}

export interface FeatureFlagsResponse {
  flags: FeatureFlags | null;
  loading: boolean;
  error: string | null;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string;
}

export interface ProgressSummary {
  streak_days: number;
  total_coins: number;
  pillar_progress?: {
    [key: string]: number;
  };
  badges?: Badge[];
}

export interface JournalEntry {
  id: string;
  child_id: string;
  challenge_id?: string;
  text: string;
  created_at: string;
  updated_at: string;
}

export type PillarId = 1 | 2 | 3 | 4 | 5;

export const PILLAR_NAMES: Record<PillarId, string> = {
  1: 'Self-Awareness',
  2: 'Self-Management',
  3: 'Social Awareness',
  4: 'Relationship Skills',
  5: 'Responsible Decision-Making'
};

export interface PracticeModule {
  id: string;
  title: string;
  description: string;
  pillar_id: number;
  steps: {
    id: string;
    title: string;
    content: string;
    type: 'text' | 'interactive' | 'reflection';
    options?: {
      text: string;
      isCorrect: boolean;
    }[];
  }[];
  completed_steps: string[];
  created_at: string;
  updated_at: string;
}

export interface PracticeProgress {
  module_id: string;
  completed_steps: string[];
  completed_at?: string;
}

export interface FamilyMember {
  id: string;
  user_id: string;
  role: 'owner' | 'member';
  created_at: string;
  updated_at: string;
}

export interface Family {
  id: string;
  name: string;
  members: FamilyMember[];
  children: string[];
  created_at: string;
  updated_at: string;
} 