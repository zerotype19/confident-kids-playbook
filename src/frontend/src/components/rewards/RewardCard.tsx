import React from 'react';
import { Reward } from '../../types';

interface RewardCardProps {
  reward: Reward;
  onRedeem: (rewardId: string) => void;
}

const RewardCard: React.FC<RewardCardProps> = ({ reward, onRedeem }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-300">
      <div className="flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{reward.title}</h3>
          <p className="text-gray-600 mb-4">{reward.description}</p>
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span className="mr-2">Points required:</span>
            <span className="font-medium">{reward.points_required}</span>
          </div>
        </div>
        <button
          onClick={() => onRedeem(reward.id)}
          className="mt-4 w-full bg-kidoova-accent text-white py-2 px-4 rounded-md hover:bg-kidoova-accent-dark transition-colors duration-300"
        >
          Redeem Reward
        </button>
      </div>
    </div>
  );
};

export default RewardCard; 