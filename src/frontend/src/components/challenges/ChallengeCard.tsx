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

  const handleMarkComplete = async () => {
    if (challenge.is_completed) return;

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

      // Update the challenge in the parent component
      challenge.is_completed = true;
    } catch (err) {
      console.error('Error marking challenge complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark challenge as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${
      challenge.is_completed ? 'opacity-75' : ''
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-kidoova-green">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
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
          </div>
          {challenge.is_completed && (
            <span className="text-green-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4">
          {challenge.description}
        </p>

        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-kidoova-accent hover:text-kidoova-green flex items-center gap-1"
        >
          {isExpanded ? 'Show Less' : 'Show More'}
          <svg
            className={`w-4 h-4 transform transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="mt-4 space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Goal</h4>
              <p className="text-sm text-gray-600">{challenge.goal}</p>
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-2">Steps</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                {Array.isArray(challenge.steps) ? (
                  challenge.steps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))
                ) : (
                  <li>{challenge.steps}</li>
                )}
              </ul>
            </div>

            {challenge.example_dialogue && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Example Dialogue</h4>
                <p className="text-sm text-gray-600 italic">
                  "{challenge.example_dialogue}"
                </p>
              </div>
            )}

            {challenge.tip && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Tip</h4>
                <p className="text-sm text-gray-600">{challenge.tip}</p>
              </div>
            )}

            {/* Complete Button */}
            {!challenge.is_completed && (
              <button
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-white
                  ${isCompleting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-kidoova-accent hover:bg-kidoova-green'
                  }`}
              >
                {isCompleting ? 'Marking Complete...' : 'Mark Challenge Complete'}
              </button>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  );
} 