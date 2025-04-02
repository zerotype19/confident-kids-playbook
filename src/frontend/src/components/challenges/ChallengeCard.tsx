import React, { useState } from 'react';
import { Challenge } from '../../types';
import Icon from '../common/Icon';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (challengeId: string) => Promise<void>;
}

export default function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse steps from JSON string if needed
  const steps = typeof challenge.steps === 'string' 
    ? JSON.parse(challenge.steps) 
    : challenge.steps;

  const handleComplete = async () => {
    setIsCompleting(true);
    setError(null);
    try {
      // Pass the challenge ID directly as a string
      await onComplete(challenge.id);
    } catch (err) {
      setError('Failed to mark challenge as complete');
      console.error('Error completing challenge:', err);
      setIsCompleting(false); // Reset the completing state on error
    }
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm overflow-hidden transition-all duration-500 ${
        isCompleting ? 'opacity-0 transform -translate-y-full' : ''
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">{challenge.title}</h3>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                challenge.difficulty_level === 1 
                  ? 'bg-green-100 text-green-800'
                  : challenge.difficulty_level === 2
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {challenge.difficulty_level === 1 ? 'Easy' : challenge.difficulty_level === 2 ? 'Medium' : 'Hard'}
              </span>
              <span className="text-sm text-gray-500">
                {challenge.is_completed ? 'Completed' : 'In Progress'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 text-gray-400 hover:text-gray-500"
          >
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-2 bg-gray-50">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full bg-kidoova-accent transition-all duration-500 ${
              challenge.is_completed ? 'w-full' : 'w-0'
            }`}
          />
        </div>
      </div>

      {/* Content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}`}>
        <div className="p-4 space-y-4">
          {/* Description */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Description</h4>
            <p className="text-sm text-gray-600">{challenge.description}</p>
          </div>

          {/* Steps */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">Steps to Try</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              {Array.isArray(steps) && steps.map((step: string, index: number) => (
                <li key={index} className="ml-2">{step}</li>
              ))}
            </ol>
          </div>

          {/* Helpful Tips */}
          {challenge.tip && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Helpful Tips</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li className="ml-2">{challenge.tip}</li>
              </ul>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          {/* Action Button */}
          {!challenge.is_completed && (
            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className={`w-full px-4 py-2 rounded-lg text-sm font-medium text-white 
                ${isCompleting 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-kidoova-accent hover:bg-kidoova-accent-dark'
                } transition-colors duration-200`}
            >
              <Icon name="check-circle" className="w-4 h-4 mr-2 inline" />
              {isCompleting ? 'Marking as Complete...' : 'Mark as Complete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 