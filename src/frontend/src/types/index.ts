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
  description: string;
  pillar: PillarId;
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  tip?: string;
  completed: boolean;
  completedAt?: string;
}

export interface ProgressSummary {
  totalChallenges: number;
  completedChallenges: number;
  currentStreak: number;
  longestStreak: number;
  pillarProgress: Record<PillarId, number>;
} 