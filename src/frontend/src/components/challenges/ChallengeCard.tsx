import React, { useState } from 'react';
import { Challenge } from '../../types';

interface ChallengeCardProps {
  challenge: Challenge;
  childId: string;
}

export default function ChallengeCard({ challenge, childId }: ChallengeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const isCompleted = challenge.is_completed === 1;

  const handleMarkComplete = async () => {
    if (isCompleted) return;

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
          challenge_id: challenge.id,
          child_id: childId,
          reflection
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      // Update the challenge in the parent component
      challenge.is_completed = 1;
      setReflection('');
    } catch (err) {
      console.error('Error marking challenge complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark challenge as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`bg-white rounded-2xl shadow-kidoova p-6 space-y-6 border ${isCompleted ? 'border-kidoova-accent' : 'border-kidoova-yellow/20'}`}>
      {/* Title Section - Clickable to expand */}
      <div 
        className="text-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h2 className="text-2xl font-bold text-kidoova-green mb-2 hover:text-kidoova-accent transition-colors">
          {challenge.title}
        </h2>
        {isExpanded && (
          <>
            <p className="text-lg text-text-base">
              {challenge.description}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {challenge.pillar_id === 1 ? 'Problem Solving' :
                 challenge.pillar_id === 2 ? 'Growth Mindset' :
                 challenge.pillar_id === 3 ? 'Social Skills' :
                 challenge.pillar_id === 4 ? 'Self-Awareness' :
                 'Courage'}
              </span>
              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                {challenge.difficulty_level === 1 ? 'Easy' :
                 challenge.difficulty_level === 2 ? 'Medium' :
                 'Hard'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <>
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
              {Array.isArray(challenge.steps) ? (
                challenge.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-kidoova-accent text-white rounded-full flex items-center justify-center mr-2 mt-1">
                      {index + 1}
                    </span>
                    <span className="text-text-base">{step}</span>
                  </li>
                ))
              ) : (
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-kidoova-accent text-white rounded-full flex items-center justify-center mr-2 mt-1">
                    1
                  </span>
                  <span className="text-text-base">{challenge.steps}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Tip Section */}
          {challenge.tip && (
            <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
              <h3 className="text-lg font-semibold text-kidoova-green mb-2">
                Helpful Tip
              </h3>
              <p className="text-text-base">
                {challenge.tip}
              </p>
            </div>
          )}

          {/* Example Dialogue */}
          {challenge.example_dialogue && (
            <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
              <h3 className="text-lg font-semibold text-kidoova-green mb-2">
                Try Saying This
              </h3>
              <p className="text-text-base italic">
                "{challenge.example_dialogue}"
              </p>
            </div>
          )}

          {/* Complete Button */}
          {!isCompleted && (
            <div className="space-y-3">
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="Add a reflection note..."
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full h-24"
              />
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
            </div>
          )}
        </>
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