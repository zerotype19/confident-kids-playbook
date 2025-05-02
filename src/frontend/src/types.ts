export interface Child {
  id: string;
  name: string;
  birthdate?: string;
  gender?: string;
  avatar_url?: string;
  age_range: string;
  created_at: string;
  updated_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  pillar_id: number;
  age_range: string;
  challenge_type_id: number;
  difficulty_level: number;
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
  is_completed?: boolean;
  challenge_type: {
    name: string;
    description: string;
  };
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

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'streak' | 'pillar';
  criteria_value: number;
  pillar_id?: number;
  earned_at?: string;
}

export interface ProgressSummary {
  milestones_completed: number;
  current_streak: number;
  longest_streak: number;
  weekly_challenges: number;
  pillar_progress: {
    [key: number]: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  milestone_progress: {
    current: number;
    next: number;
    percentage: number;
  };
  next_reward?: {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: 'milestone' | 'streak' | 'pillar';
    criteria_value: number;
    pillar_id?: number;
    progress: number;
  };
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
  1: 'Independence & Problem-Solving',
  2: 'Growth Mindset & Resilience',
  3: 'Social Confidence & Communication',
  4: 'Purpose & Strength Discovery',
  5: 'Managing Fear & Anxiety'
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

export interface Pillar {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface User {
  id: string;
  email: string;
  childId: string;
  // ... other existing fields ...
}

export interface RewardsOverviewProps {
  progress: ProgressSummary | null;
}

export interface TrophyCaseProps {
  rewards: Reward[];
}

export interface ChallengeType {
  pillar_id: number;
  challenge_type_id: number;
  name: string;
  description: string;
} 