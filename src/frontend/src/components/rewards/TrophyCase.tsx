import React, { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { Reward, PILLAR_NAMES } from '../../types';

interface TrophyCaseProps {
  rewards: Reward[];
}

export const TrophyCase: React.FC<TrophyCaseProps> = ({ rewards }) => {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

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
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReward(reward)}
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
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReward(reward)}
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
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedReward(reward)}
              >
                <div className="text-4xl mb-2">{reward.icon}</div>
                <h4 className="font-medium">{reward.title}</h4>
                <p className="text-sm text-gray-600">
                  {reward.pillar_id ? PILLAR_NAMES[reward.pillar_id as keyof typeof PILLAR_NAMES] : ''} - Level {reward.level}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reward Details Modal */}
      <Dialog
        open={!!selectedReward}
        onClose={() => setSelectedReward(null)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />

          <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6">
            {selectedReward && (
              <>
                <Dialog.Title className="text-xl font-semibold mb-4">
                  {selectedReward.title}
                </Dialog.Title>

                <div className="space-y-4">
                  <div className="text-6xl text-center mb-4">
                    {selectedReward.icon}
                  </div>

                  <p className="text-gray-600">{selectedReward.description}</p>

                  {selectedReward.pillar_id && (
                    <p className="text-sm text-gray-500">
                      Pillar: {PILLAR_NAMES[selectedReward.pillar_id as keyof typeof PILLAR_NAMES]}
                    </p>
                  )}

                  {selectedReward.unlockable_content && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">Unlocked Content:</h4>
                      <p className="text-sm">{selectedReward.unlockable_content}</p>
                    </div>
                  )}

                  <button
                    className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    onClick={() => setSelectedReward(null)}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}; 