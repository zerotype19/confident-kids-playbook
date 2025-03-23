import { FeatureFlags } from '../../backend/types';

export interface MediaItem {
  id: string;
  child_id: string;
  type: string;
  url: string;
  key: string;
  filename: string;
  size: number;
  created_at: string;
}

export interface PracticeModule {
  id: string;
  pillar_id: string;
  title: string;
  description: string;
  steps: Array<{
    id: string;
    title: string;
    content: string;
    type: 'interactive' | 'reflection';
    options?: Array<{
      text: string;
      isCorrect: boolean;
    }>;
  }>;
}

export type PillarId = keyof typeof PILLAR_NAMES;

export const PILLAR_NAMES = {
  '1': 'Self-Awareness',
  '2': 'Self-Management',
  '3': 'Social Awareness',
  '4': 'Relationship Skills',
  '5': 'Responsible Decision-Making',
} as const;

export interface FeatureFlagsResponse {
  flags: FeatureFlags;
  loading: boolean;
  error: string | null;
  isFeatureEnabled: (feature: keyof FeatureFlags) => boolean;
} 