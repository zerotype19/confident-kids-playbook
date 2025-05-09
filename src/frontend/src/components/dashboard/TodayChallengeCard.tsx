import React, { useState } from 'react';
import UniversalChallengeModal from '../challenges/UniversalChallengeModal';
import { useChildContext } from '../../contexts/ChildContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string[];
  tip: string;
  example_dialogue: string;
  pillar_id: number;
  difficulty_level: number;
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
}

interface TodayChallengeCardProps {
  challenge: Challenge | null;
  childId: string;
  onComplete?: () => void;
}

export default function TodayChallengeCard({ challenge, childId, onComplete }: TodayChallengeCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { selectedChild } = useChildContext();

  const pillarHex: Record<number, string> = {
    1: '#F7B801', // Independence & Problem-Solving
    2: '#38A169', // Growth Mindset & Resilience
    3: '#4299E1', // Social Confidence & Communication
    4: '#805AD5', // Purpose & Strength Discovery
    5: '#E53E3E'  // Managing Fear & Anxiety
  };

  if (!challenge) {
    return (
      <div className="bg-white rounded-2xl shadow-kidoova p-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Workout Available</h3>
          <p className="text-gray-600">Check back later for today's workout.</p>
        </div>
      </div>
    );
  }

  if (challenge && (challenge as any).completedToday) {
    return (
      <div className="bg-white rounded-2xl shadow-kidoova p-4 flex flex-col items-center justify-center min-h-[180px]">
        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl text-kidoova-green">✅</span>
            <span className="text-2xl font-heading font-bold text-kidoova-green">Daily Workout Completed!</span>
          </div>
          <button
            onClick={() => window.location.href = '/all-challenges'}
            className="px-5 py-2 rounded-lg font-semibold text-white bg-kidoova-green hover:bg-kidoova-accent transition-colors duration-200"
          >
            See More Workouts
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-kidoova p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h2 className="text-2xl font-heading text-gray-900 mb-2">
              {selectedChild ? `${selectedChild.name}'s Daily Workout` : 'Daily Workout'}
            </h2>
            <h3 className="text-3xl font-bold text-kidoova-green mb-4">{challenge.title}</h3>
            <div className="flex justify-center gap-2 mb-4">
              <span 
                className="text-xs font-medium px-2 py-1 rounded-full"
                style={{
                  backgroundColor: pillarHex[challenge.pillar_id],
                  color: 'white'
                }}
              >
                {challenge.pillar_id === 1 ? 'Independence & Problem-Solving' :
                 challenge.pillar_id === 2 ? 'Growth Mindset & Resilience' :
                 challenge.pillar_id === 3 ? 'Social Confidence & Communication' :
                 challenge.pillar_id === 4 ? 'Purpose & Strength Discovery' :
                 'Managing Fear & Anxiety'}
              </span>
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
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-kidoova-green text-white px-4 py-2 rounded-lg hover:bg-kidoova-accent transition-colors"
          >
            Start Workout
          </button>
        </div>
      </div>

      <UniversalChallengeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        challenge={challenge}
        childId={childId}
        onComplete={() => {
          setIsModalOpen(false);
          if (onComplete) onComplete();
        }}
      />
    </>
  );
} 