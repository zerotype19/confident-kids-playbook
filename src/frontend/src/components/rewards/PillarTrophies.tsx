import React, { useState } from 'react';
import { ProgressSummary, Reward } from '../../types';
import { TrophyCase } from './TrophyCase';

const PILLAR_NAMES = {
  1: 'Independence & Problem-Solving',
  2: 'Growth Mindset & Resilience',
  3: 'Social Confidence & Communication',
  4: 'Purpose & Strength Discovery',
  5: 'Managing Fear & Anxiety'
} as const;

interface PillarTrophiesProps {
  progress: ProgressSummary | null;
  childId: string;
  rewards: Reward[];
}

export default function PillarTrophies({ progress, childId, rewards }: PillarTrophiesProps) {
  const [selectedPillar, setSelectedPillar] = useState<number | null>(null);

  if (!progress) return null;

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <select
          value={selectedPillar || ''}
          onChange={(e) => setSelectedPillar(e.target.value ? Number(e.target.value) : null)}
          className="w-60 bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-kidoova-accent"
        >
          <option value="">All Pillars</option>
          {Object.entries(progress.pillar_progress).map(([pillarId, pillarData]) => (
            <option key={pillarId} value={pillarId}>
              {PILLAR_NAMES[Number(pillarId) as keyof typeof PILLAR_NAMES]}
            </option>
          ))}
        </select>
      </div>
      <h3 className="text-xl font-heading text-kidoova-green">Pillar Trophies</h3>
      <TrophyCase rewards={rewards} />
    </div>
  );
} 