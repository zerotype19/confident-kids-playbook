import { FeatureFlags } from '../../../backend/types';

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  createdAt: string;
  childId: string;
}

export interface PracticeModule {
  id: string;
  title: string;
  description: string;
  steps: PracticeStep[];
  completed: boolean;
  progress: number;
}

export interface PracticeStep {
  id: string;
  type: 'text' | 'question' | 'reflection';
  content: string;
  options?: {
    text: string;
    isCorrect: boolean;
  }[];
}

export interface FeatureFlagsResponse {
  flags: FeatureFlags | null;
  loading: boolean;
  error: string | null;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
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
  children: Array<{
    id: string;
    name: string;
    age: number;
  }>;
  created_at: string;
  updated_at: string;
}

export const PILLAR_NAMES = {
  social: 'Social Skills',
  emotional: 'Emotional Intelligence',
  academic: 'Academic Confidence',
  physical: 'Physical Confidence',
} as const;

export type PillarId = keyof typeof PILLAR_NAMES;

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
  success_signals: string[];
  why_it_matters: string;
  tags: string[];
  is_completed: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'streak' | 'pillar';
  criteria_value: number;
  pillar_id?: number;
  level?: number;
  unlockable_content?: string;
  reward_type: string;
  created_at: string;
  updated_at: string;
}

export interface ProgressSummary {
  milestones_completed: number;
  current_streak: number;
  longest_streak: number;
  weekly_challenges: number;
  pillar_progress: Record<string, {
    total: number;
    completed: number;
    percentage: number;
  }>;
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