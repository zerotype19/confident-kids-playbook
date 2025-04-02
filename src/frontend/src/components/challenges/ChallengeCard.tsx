import React, { useState } from 'react';
import { Challenge, PILLAR_NAMES } from '../../types';

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
    <div 
      className={`
        bg-white shadow-md rounded-lg p-4 flex flex-col space-y-4 
        hover:shadow-xl transform hover:scale-105 transition duration-200
        ${isCompleted ? 'border-2 border-kidoova-accent' : 'border border-gray-200'}
      `}
    >
      {/* Header */}
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-kidoova-green">{challenge.title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {PILLAR_NAMES[challenge.pillar_id as keyof typeof PILLAR_NAMES]}
          </span>
          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
            {challenge.difficulty_level === 1 ? 'Easy' :
             challenge.difficulty_level === 2 ? 'Medium' :
             'Hard'}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isCompleted ? 'bg-kidoova-accent' : 'bg-kidoova-yellow'
          }`}
          style={{ width: isCompleted ? '100%' : '0%' }}
        />
      </div>

      {/* Action Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`
          w-full px-4 py-2 rounded-lg font-medium text-white
          ${isCompleted 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-kidoova-accent hover:bg-kidoova-green transition-colors'
          }
        `}
        disabled={isCompleted}
      >
        {isCompleted ? 'Completed' : isExpanded ? 'Show Less' : 'Start Challenge'}
      </button>

      {/* Expanded Content */}
      {isExpanded && !isCompleted && (
        <div className="space-y-4 pt-4 border-t border-gray-100">
          {/* Goal Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Your Goal</h4>
            <p className="text-sm text-gray-600">{challenge.goal}</p>
          </div>

          {/* Steps Section */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Steps to Try</h4>
            <ul className="space-y-2">
              {(() => {
                let stepsArray: string[];
                if (typeof challenge.steps === 'string') {
                  try {
                    stepsArray = JSON.parse(challenge.steps);
                  } catch (e) {
                    stepsArray = [challenge.steps];
                  }
                } else {
                  stepsArray = challenge.steps;
                }
                return stepsArray.map((step, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-600">
                    <span className="flex-shrink-0 w-5 h-5 bg-kidoova-accent text-white rounded-full flex items-center justify-center mr-2 mt-1 text-xs">
                      {index + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ));
              })()}
            </ul>
          </div>

          {/* Tip Section */}
          {challenge.tip && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Helpful Tip</h4>
              <p className="text-sm text-gray-600">{challenge.tip}</p>
            </div>
          )}

          {/* Example Dialogue */}
          {challenge.example_dialogue && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Try Saying This</h4>
              <p className="text-sm text-gray-600 italic">"{challenge.example_dialogue}"</p>
            </div>
          )}

          {/* Reflection Input */}
          <div>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Add a reflection note..."
              className="w-full h-24 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-kidoova-accent focus:border-transparent"
            />
          </div>

          {/* Complete Button */}
          <button
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className={`
              w-full px-4 py-2 rounded-lg font-medium text-white
              ${isCompleting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-kidoova-accent hover:bg-kidoova-green transition-colors'
              }
            `}
          >
            {isCompleting ? 'Marking Complete...' : 'Mark Challenge Complete'}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-sm text-center">
          {error}
        </div>
      )}
    </div>
  );
} 