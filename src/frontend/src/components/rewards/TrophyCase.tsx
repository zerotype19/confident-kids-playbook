import React from 'react';
import { Reward, PILLAR_NAMES } from '../../types';

interface TrophyCaseProps {
  rewards: Reward[];
}

export const TrophyCase: React.FC<TrophyCaseProps> = ({ rewards }) => {
  if (!rewards || rewards.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-8 bg-white rounded-lg shadow-sm">
        <p className="text-gray-500">Complete challenges to earn rewards!</p>
      </div>
    );
  }

  const milestoneRewards = rewards
    .filter(r => r.type === 'milestone')
    .sort((a, b) => a.criteria_value - b.criteria_value);

  const streakRewards = rewards
    .filter(r => r.type === 'streak')
    .sort((a, b) => a.criteria_value - b.criteria_value);

  const pillarRewards = rewards
    .filter(r => r.type === 'pillar')
    .sort((a, b) => (a.pillar_id || 0) - (b.pillar_id || 0));

  return (
    <div className="h-full bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
      <div className="space-y-8">
        {/* Milestone Trophies */}
        {milestoneRewards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Milestone Trophies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {milestoneRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="text-5xl mb-3">{reward.icon}</div>
                  <h4 className="font-medium text-lg mb-2">{reward.title}</h4>
                  <p className="text-gray-600">{reward.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak Trophies */}
        {streakRewards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Streak Trophies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {streakRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="text-5xl mb-3">{reward.icon}</div>
                  <h4 className="font-medium text-lg mb-2">{reward.title}</h4>
                  <p className="text-gray-600">{reward.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pillar Trophies */}
        {pillarRewards.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Pillar Trophies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {pillarRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow flex flex-col items-center text-center"
                >
                  <div className="text-5xl mb-3">{reward.icon}</div>
                  <h4 className="font-medium text-lg mb-2">{reward.title}</h4>
                  <p className="text-gray-600">
                    {reward.pillar_id ? PILLAR_NAMES[reward.pillar_id as keyof typeof PILLAR_NAMES] : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 