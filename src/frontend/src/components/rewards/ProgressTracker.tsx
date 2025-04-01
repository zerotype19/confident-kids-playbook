import React from 'react';
import { ProgressSummary } from '../../types';
import { PILLAR_NAMES } from '../../types';

interface ProgressTrackerProps {
  progress: ProgressSummary | null;
  childId: string;
}

export default function ProgressTracker({ progress, childId }: ProgressTrackerProps) {
  if (!progress) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
      <h2 className="text-xl font-heading">Progress Tracker</h2>

      {/* Streak Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-kidoova-yellow/10 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Current Streak</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl">🔥</div>
            <div>
              <div className="text-2xl font-bold text-kidoova-accent">
                {progress.current_streak} days
              </div>
              <p className="text-sm text-gray-600">Keep the momentum going!</p>
            </div>
          </div>
        </div>

        <div className="bg-kidoova-yellow/10 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Longest Streak</h3>
          <div className="flex items-center gap-4">
            <div className="text-3xl">🏆</div>
            <div>
              <div className="text-2xl font-bold text-kidoova-accent">
                {progress.longest_streak} days
              </div>
              <p className="text-sm text-gray-600">Your best streak so far</p>
            </div>
          </div>
        </div>
      </div>

      {/* Milestone Progress */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Milestone Progress</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-kidoova-accent transition-all duration-300"
                  style={{ width: `${(progress.milestones_completed / 20) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-1">
                <span>Milestone Progress</span>
                <span>{progress.milestones_completed} of 20</span>
              </div>
            </div>
            <div className="text-xl font-bold text-kidoova-accent">
              {Math.round((progress.milestones_completed / 20) * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Pillar Progress */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Pillar Progress</h3>
        <div className="space-y-4">
          {Object.entries(progress.pillar_progress).map(([pillarId, data]) => (
            <div key={pillarId}>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium">
                  {PILLAR_NAMES[parseInt(pillarId) as keyof typeof PILLAR_NAMES]}
                </span>
                <span className="text-gray-600">
                  {data.completed} of {data.total} challenges
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-kidoova-accent transition-all duration-300"
                  style={{ width: `${data.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Next Reward Progress */}
      {progress.next_reward && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Next Reward</h3>
          <div className="bg-kidoova-yellow/10 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{progress.next_reward.icon}</div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{progress.next_reward.title}</h4>
                <p className="text-sm text-gray-600">{progress.next_reward.description}</p>
                {progress.next_reward.type === 'pillar' && progress.next_reward.pillar_id && (
                  <p className="text-xs text-gray-500 mt-1">
                    {PILLAR_NAMES[progress.next_reward.pillar_id as keyof typeof PILLAR_NAMES]}
                  </p>
                )}
              </div>
              <div className="text-xl font-bold text-kidoova-accent">
                {Math.round(progress.next_reward.progress)}%
              </div>
            </div>
            <div className="mt-2">
              <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-kidoova-accent transition-all duration-300"
                  style={{ width: `${progress.next_reward.progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 