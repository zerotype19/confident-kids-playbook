import React from 'react';
import { ProgressSummary, Reward } from '../../types';
import { TrophyCase } from './TrophyCase';

interface PillarTrophiesProps {
  progress: ProgressSummary | null;
  childId: string;
  rewards: Reward[];
}

export default function PillarTrophies({ progress, childId, rewards }: PillarTrophiesProps) {
  if (!progress) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-heading text-kidoova-green">Pillar Trophies</h3>
      <TrophyCase rewards={rewards} />
    </div>
  );
} 