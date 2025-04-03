import React from 'react';
import { Reward, PILLAR_NAMES } from '../../types';

interface TrophyCaseProps {
  rewards: Reward[];
}

export const TrophyCase: React.FC<TrophyCaseProps> = ({ rewards }) => {
  if (!rewards || rewards.length === 0) {
    return (
      <div className="text-center p-8">
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
    <div className="space-y-8">
      {/* Milestone Trophies */}
      {milestoneRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Milestone Trophies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {milestoneRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="text-4xl mb-2">{reward.icon}</div>
                <h4 className="font-medium">{reward.title}</h4>
                <p className="text-sm text-gray-600">{reward.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Streak Trophies */}
      {streakRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Streak Trophies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {streakRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="text-4xl mb-2">{reward.icon}</div>
                <h4 className="font-medium">{reward.title}</h4>
                <p className="text-sm text-gray-600">{reward.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pillar Trophies */}
      {pillarRewards.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Pillar Trophies</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {pillarRewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white p-4 rounded-lg shadow-sm"
              >
                <div className="text-4xl mb-2">{reward.icon}</div>
                <h4 className="font-medium">{reward.title}</h4>
                <p className="text-sm text-gray-600">
                  {reward.pillar_id ? PILLAR_NAMES[reward.pillar_id as keyof typeof PILLAR_NAMES] : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 