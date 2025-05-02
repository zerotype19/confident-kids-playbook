import React from 'react';
import { ProgressSummary } from '../../types';
import { TrophyIcon } from '../../icons/TrophyIcon';

interface RewardsOverviewProps {
  progress: ProgressSummary | null;
}

export default function RewardsOverview({ progress }: RewardsOverviewProps) {
  if (!progress) return null;

  console.log('RewardsOverview: Raw progress data:', progress);
  console.log('RewardsOverview: Weekly challenges:', {
    value: progress.weekly_challenges,
    type: typeof progress.weekly_challenges,
    isUndefined: progress.weekly_challenges === undefined,
    isNull: progress.weekly_challenges === null,
    displayValue: progress.weekly_challenges || 0
  });

  return (
    <div className="w-full bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Milestone Trophies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(progress?.milestone_progress || {}).map(([milestone, completed]) => (
          <div key={milestone} className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {completed ? (
                <div className="w-12 h-12 rounded-full bg-kidoova-green flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <TrophyIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">{milestone}</h3>
              <p className="text-sm text-gray-500">
                {completed ? 'Completed!' : 'In Progress'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 