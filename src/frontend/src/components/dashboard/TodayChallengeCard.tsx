import React, { useState } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string[];
  tip: string;
  example_dialogue: string;
}

interface TodayChallengeCardProps {
  challenge: Challenge;
  childId: string;
  onComplete?: () => void;
}

export default function TodayChallengeCard({ challenge, childId, onComplete }: TodayChallengeCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/challenge-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          child_id: childId,
          challenge_id: challenge.id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mark challenge as complete');
      }

      setIsCompleted(true);
      onComplete?.();
    } catch (err) {
      console.error('Error marking challenge complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark challenge as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-kidoova p-6 space-y-6 border ${isCompleted ? 'border-kidoova-accent' : 'border-kidoova-yellow/20'}`}>
      {/* Title Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-kidoova-green mb-2">
          {challenge.title}
        </h2>
        <p className="text-lg text-text-base">
          {challenge.description}
        </p>
      </div>

      {/* Goal Section */}
      <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
        <h3 className="text-lg font-semibold text-kidoova-green mb-2">
          Your Goal
        </h3>
        <p className="text-text-base">
          {challenge.goal}
        </p>
      </div>

      {/* Steps Section */}
      <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
        <h3 className="text-lg font-semibold text-kidoova-green mb-3">
          Steps to Try
        </h3>
        <ul className="space-y-2">
          {challenge.steps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-kidoova-accent text-white rounded-full flex items-center justify-center mr-2 mt-1">
                {index + 1}
              </span>
              <span className="text-text-base">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tip Section */}
      <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
        <h3 className="text-lg font-semibold text-kidoova-green mb-2">
          Helpful Tip
        </h3>
        <p className="text-text-base">
          {challenge.tip}
        </p>
      </div>

      {/* Example Dialogue */}
      <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
        <h3 className="text-lg font-semibold text-kidoova-green mb-2">
          Try Saying This
        </h3>
        <p className="text-text-base italic">
          "{challenge.example_dialogue}"
        </p>
      </div>

      {/* Mark Complete Button */}
      {!isCompleted && (
        <div className="flex justify-center">
          <button
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className={`
              px-6 py-3 rounded-lg font-semibold text-white
              ${isCompleting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-kidoova-accent hover:bg-kidoova-green transition-colors duration-200'
              }
            `}
          >
            {isCompleting ? 'Marking Complete...' : 'Mark Challenge Complete'}
          </button>
        </div>
      )}

      {/* Success Message */}
      {isCompleted && (
        <div className="flex justify-center items-center space-x-2 text-kidoova-accent">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span className="font-semibold">Challenge Completed!</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-center">
          {error}
        </div>
      )}
    </div>
  );
} 