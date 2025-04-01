import React, { useState } from 'react';
import { Reward } from '../../types';

interface TrophyCaseProps {
  rewards: Reward[];
}

export default function TrophyCase({ rewards }: TrophyCaseProps) {
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  const groupedRewards = rewards.reduce((acc, reward) => {
    if (!acc[reward.type]) {
      acc[reward.type] = [];
    }
    acc[reward.type].push(reward);
    return acc;
  }, {} as Record<string, Reward[]>);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-heading mb-6">Trophy Case</h2>

      <div className="space-y-8">
        {/* Milestone Trophies */}
        {groupedRewards['milestone'] && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Milestone Trophies</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {groupedRewards['milestone'].map((reward) => (
                <div
                  key={reward.id}
                  className="bg-kidoova-yellow/10 rounded-lg p-4 cursor-pointer hover:bg-kidoova-yellow/20 transition-colors"
                  onClick={() => setSelectedReward(reward)}
                >
                  <div className="text-3xl mb-2">{reward.icon}</div>
                  <h4 className="font-medium text-gray-900">{reward.title}</h4>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streak Trophies */}
        {groupedRewards['streak'] && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Streak Trophies</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {groupedRewards['streak'].map((reward) => (
                <div
                  key={reward.id}
                  className="bg-kidoova-yellow/10 rounded-lg p-4 cursor-pointer hover:bg-kidoova-yellow/20 transition-colors"
                  onClick={() => setSelectedReward(reward)}
                >
                  <div className="text-3xl mb-2">{reward.icon}</div>
                  <h4 className="font-medium text-gray-900">{reward.title}</h4>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pillar Trophies */}
        {groupedRewards['pillar'] && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pillar Trophies</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {groupedRewards['pillar'].map((reward) => (
                <div
                  key={reward.id}
                  className="bg-kidoova-yellow/10 rounded-lg p-4 cursor-pointer hover:bg-kidoova-yellow/20 transition-colors"
                  onClick={() => setSelectedReward(reward)}
                >
                  <div className="text-3xl mb-2">{reward.icon}</div>
                  <h4 className="font-medium text-gray-900">{reward.title}</h4>
                  <p className="text-sm text-gray-600">{reward.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Reward Details Modal */}
      {selectedReward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-heading">{selectedReward.title}</h3>
              <button
                onClick={() => setSelectedReward(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="text-4xl mb-4">{selectedReward.icon}</div>
            <p className="text-gray-600 mb-4">{selectedReward.description}</p>
            <div className="text-sm text-gray-500">
              <p>Type: {selectedReward.type}</p>
              <p>Criteria: {selectedReward.criteria_value}</p>
              {selectedReward.pillar_id && <p>Pillar ID: {selectedReward.pillar_id}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 