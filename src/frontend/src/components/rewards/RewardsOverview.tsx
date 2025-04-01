import React from 'react';
import { ProgressSummary } from '../../types';

interface RewardsOverviewProps {
  progress: ProgressSummary | null;
}

export default function RewardsOverview({ progress }: RewardsOverviewProps) {
  if (!progress) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-heading mb-6">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Challenges Completed */}
        <div className="bg-kidoova-yellow/10 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Challenges Completed</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl">🎯</div>
            <div>
              <div className="text-2xl font-bold text-kidoova-accent">
                {progress.milestones_completed}
              </div>
              <p className="text-sm text-gray-600">Total challenges</p>
            </div>
          </div>
        </div>

        {/* Current Streak */}
        <div className="bg-kidoova-yellow/10 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current Streak</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl">🔥</div>
            <div>
              <div className="text-2xl font-bold text-kidoova-accent">
                {progress.current_streak} days
              </div>
              <p className="text-sm text-gray-600">Keep it up!</p>
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