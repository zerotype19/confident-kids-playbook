import React from 'react';
import { ProgressSummary } from '../types';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

interface ProgressSummaryCardProps {
  progress: ProgressSummary;
  showBadges?: boolean;
}

const PILLAR_NAMES = {
  1: 'Independence',
  2: 'Growth',
  3: 'Social',
  4: 'Strength',
  5: 'Emotion'
} as const;

type PillarId = keyof typeof PILLAR_NAMES;

export const ProgressSummaryCard: React.FC<ProgressSummaryCardProps> = ({
  progress,
  showBadges = true
}) => {
  const flags = useFeatureFlags();

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <span className="text-2xl mr-2">🔥</span>
          <span className="text-lg font-semibold">{progress.streak_days} Day Streak</span>
        </div>
        <div className="flex items-center">
          <span className="text-2xl mr-2">🪙</span>
          <span className="text-lg font-semibold">{progress.total_coins} Coins</span>
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(progress.pillar_progress).map(([pillarId, value]) => {
          const pillarNumber = parseInt(pillarId, 10) as PillarId;
          return (
            <div key={pillarId}>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">
                  {PILLAR_NAMES[pillarNumber]}
                </span>
                <span className="text-sm text-gray-500">{value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {showBadges && progress.badges.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-3">Earned Badges</h3>
          <div className="flex flex-wrap gap-2">
            {progress.badges.map((badge) => (
              <div
                key={badge}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium text-gray-700"
              >
                {badge}
              </div>
            ))}
          </div>
        </div>
      )}

      {flags['premium.dashboard_insights'] && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-3">Premium Insights</h3>
          <p className="text-sm text-gray-600">
            Track your child's growth across all pillars and unlock detailed progress reports.
          </p>
        </div>
      )}
    </div>
  );
}; 