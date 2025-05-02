import React, { useState } from 'react';
import { Challenge } from '../../types';
import UniversalChallengeModal from './UniversalChallengeModal';
import { useChildContext } from '../../contexts/ChildContext';

interface ChallengeCardProps {
  challenge: Challenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedChild } = useChildContext();

  return (
    <>
      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200 transition-all duration-300">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-kidoova-green">{challenge.title}</h2>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              challenge.difficulty_level === 1 
                ? 'bg-green-100 text-green-800'
                : challenge.difficulty_level === 2
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {challenge.difficulty_level === 1 ? 'Easy' : challenge.difficulty_level === 2 ? 'Medium' : 'Hard'}
            </span>
          </div>
          
          <p className="text-gray-600">{challenge.what_you_practice}</p>

          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-kidoova-green text-white px-4 py-2 rounded-lg hover:bg-kidoova-accent transition-colors"
          >
            Start Challenge
          </button>
        </div>
      </div>

      <UniversalChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        challenge={challenge}
        childId={selectedChild?.id || ''}
        onComplete={() => setIsModalOpen(false)}
      />
    </>
  );
} 