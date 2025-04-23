import React from 'react';
import { ProgressSummary } from '../../types';

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
    <div className="bg-white rounded-xl shadow-xl p-6 space-y-6">
      <h2 className="text-xl font-heading">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Challenges Completed */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Challenges Completed</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <div className="text-2xl font-bold text-kidoova-accent">
                {progress.milestones_completed}
              </div>
              <p className="text-sm text-gray-600">Total challenges completed</p>
            </div>
          </div>
        </div>

        {/* Weekly Challenges */}
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-2">This Week's Progress</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl">📅</div>
            <div>
              <div className="text-2xl font-bold text-kidoova-accent">
                {typeof progress.weekly_challenges === 'number' ? progress.weekly_challenges : 0}
              </div>
              <p className="text-sm text-gray-600">Challenges completed this week</p>
            </div>
          </div>
        </div>

        {/* Next Reward */}
        {progress.next_reward && (
          <div className="bg-kidoova-yellow/10 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Next Reward</h3>
            <div className="flex items-center gap-4">
              <div className="text-3xl">{progress.next_reward.icon}</div>
              <div>
                <div className="text-lg font-bold text-kidoova-accent">
                  {progress.next_reward.title}
                </div>
                <p className="text-sm text-gray-600">
                  {Math.round(progress.next_reward.progress)}% complete
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 