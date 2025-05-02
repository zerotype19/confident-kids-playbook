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
    <div className="w-full bg-white rounded-xl shadow-xl p-6 space-y-6">
      <h2 className="text-xl font-heading">Overview</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Challenges Completed */}
        <div className="bg-kidoova-yellow/10 rounded-lg p-4">
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
        <div className="bg-kidoova-yellow/10 rounded-lg p-4">
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

      {/* Trophy Case */}
      <div className="w-full mt-8">
        <h3 className="text-xl font-heading mb-4">Trophy Case</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Milestone Trophies */}
          <div className="bg-kidoova-yellow/10 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Milestone Trophies</h4>
            <div className="space-y-2">
              {Object.entries(progress.milestone_progress || {}).map(([milestone, completed]) => (
                <div key={milestone} className="flex items-center gap-2">
                  <span className={completed ? "text-green-500" : "text-gray-400"}>
                    {completed ? "✓" : "○"}
                  </span>
                  <span className="text-sm">{milestone}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Streak Trophies */}
          <div className="bg-kidoova-yellow/10 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Streak Trophies</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={progress.current_streak > 0 ? "text-green-500" : "text-gray-400"}>
                  {progress.current_streak > 0 ? "✓" : "○"}
                </span>
                <span className="text-sm">Current Streak: {progress.current_streak} days</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={progress.longest_streak > 0 ? "text-green-500" : "text-gray-400"}>
                  {progress.longest_streak > 0 ? "✓" : "○"}
                </span>
                <span className="text-sm">Longest Streak: {progress.longest_streak} days</span>
              </div>
            </div>
          </div>

          {/* Pillar Trophies */}
          <div className="bg-kidoova-yellow/10 rounded-lg p-4">
            <h4 className="text-lg font-medium text-gray-900 mb-2">Pillar Trophies</h4>
            <div className="space-y-2">
              {Object.entries(progress.pillar_progress || {}).map(([pillar, completed]) => (
                <div key={pillar} className="flex items-center gap-2">
                  <span className={completed ? "text-green-500" : "text-gray-400"}>
                    {completed ? "✓" : "○"}
                  </span>
                  <span className="text-sm">{pillar}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 