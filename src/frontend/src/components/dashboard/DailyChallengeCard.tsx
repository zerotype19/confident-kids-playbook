import React, { useState } from 'react';
import UniversalChallengeModal from '../challenges/UniversalChallengeModal';
import { useAuth } from '../../contexts/AuthContext';
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
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
}

export default function DailyChallengeCard() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { token } = useAuth();
  const { selectedChild } = useChildContext();

  const fetchDailyChallenge = async () => {
    if (!selectedChild?.id) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/challenges/today?child_id=${selectedChild.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch daily challenge');
      }

      const data = await response.json();
      setChallenge(data);
    } catch (error) {
      console.error('Error fetching daily challenge:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDailyChallenge();
  }, [selectedChild?.id]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 w-3/4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded mb-4"></div>
          <div className="h-10 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Workout Available</h3>
          <p className="text-gray-600">Check back later for today's workout.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Workout</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-kidoova-green">{challenge.title}</h3>
            <p className="text-gray-600 mt-1">{challenge.description}</p>
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
        childId={selectedChild?.id || ''}
        onComplete={() => {
          setIsModalOpen(false);
          fetchDailyChallenge(); // Refresh the challenge status
        }}
      />
    </>
  );
} 