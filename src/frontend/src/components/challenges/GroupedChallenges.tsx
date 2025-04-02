import React, { useState } from 'react';
import { Challenge, PILLAR_NAMES, PillarId } from '../../types';
import ChallengeCard from './ChallengeCard';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface GroupedChallengesProps {
  challenges: Challenge[];
  childId: string;
}

export default function GroupedChallenges({ challenges, childId }: GroupedChallengesProps) {
  const [expandedPillars, setExpandedPillars] = useState<Set<number>>(new Set([1])); // Start with first pillar expanded

  // Group challenges by pillar
  const groupedChallenges = challenges.reduce((acc, challenge) => {
    const pillarId = challenge.pillar_id;
    if (!acc[pillarId]) {
      acc[pillarId] = [];
    }
    acc[pillarId].push(challenge);
    return acc;
  }, {} as Record<number, Challenge[]>);

  // Calculate pillar progress
  const pillarProgress = Object.entries(groupedChallenges).reduce((acc, [pillarId, pillarChallenges]) => {
    const completed = pillarChallenges.filter(c => c.is_completed).length;
    const total = pillarChallenges.length;
    acc[Number(pillarId)] = {
      completed,
      total,
      percentage: (completed / total) * 100
    };
    return acc;
  }, {} as Record<number, { completed: number; total: number; percentage: number }>);

  const togglePillar = (pillarId: number) => {
    const newExpanded = new Set(expandedPillars);
    if (newExpanded.has(pillarId)) {
      newExpanded.delete(pillarId);
    } else {
      newExpanded.add(pillarId);
    }
    setExpandedPillars(newExpanded);
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedChallenges).map(([pillarId, pillarChallenges]) => {
        const numericPillarId = Number(pillarId) as PillarId;
        const isExpanded = expandedPillars.has(numericPillarId);
        const progress = pillarProgress[numericPillarId];

        return (
          <div key={pillarId} className="border rounded-lg shadow-sm bg-white overflow-hidden">
            <button
              onClick={() => togglePillar(numericPillarId)}
              className="w-full p-4 flex items-center justify-between text-left bg-gradient-to-r from-kidoova-primary to-kidoova-accent text-white hover:from-kidoova-primary/90 hover:to-kidoova-accent/90 transition-colors"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{PILLAR_NAMES[numericPillarId]}</h3>
                <div className="mt-2">
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-500 ease-out"
                      style={{ width: `${progress.percentage}%` }}
                    />
                  </div>
                  <p className="text-sm mt-1">
                    {progress.completed} of {progress.total} challenges completed
                  </p>
                </div>
              </div>
              {isExpanded ? (
                <ChevronUpIcon className="w-6 h-6 flex-shrink-0" />
              ) : (
                <ChevronDownIcon className="w-6 h-6 flex-shrink-0" />
              )}
            </button>
            
            {isExpanded && (
              <div className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pillarChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.id}
                      challenge={challenge}
                      childId={childId}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
} 