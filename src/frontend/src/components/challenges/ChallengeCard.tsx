import React, { useState } from 'react';
import { Challenge } from '../../types';
import Icon from '../common/Icon';

interface ChallengeCardProps {
  challenge: Challenge;
  onComplete: (challengeId: number) => Promise<void>;
}

const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge, onComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      setError(null);
      await onComplete(challenge.id);
    } catch (err) {
      setError('Failed to mark challenge as complete. Please try again.');
      console.error('Error completing challenge:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            challenge.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            challenge.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full ${
                  Boolean(challenge.is_completed) ? 'bg-green-500' : 'bg-blue-500'
                }`}
                style={{ width: Boolean(challenge.is_completed) ? '100%' : '0%' }}
              />
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {Boolean(challenge.is_completed) ? 'Completed' : 'Not Started'}
            </p>
          </div>
          <button
            onClick={handleComplete}
            disabled={isCompleting || Boolean(challenge.is_completed)}
            className={`ml-4 px-4 py-2 rounded-md text-sm font-medium ${
              Boolean(challenge.is_completed)
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isCompleting ? 'Completing...' : Boolean(challenge.is_completed) ? 'Completed' : 'Start Challenge'}
          </button>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900"
        >
          <span>View Details</span>
          <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
        </button>

        {isExpanded && (
          <div className="mt-4 space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Goal</h4>
              <p className="mt-1 text-sm text-gray-600">{challenge.goal}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Steps to Try</h4>
              <ol className="mt-1 list-decimal list-inside text-sm text-gray-600">
                {challenge.steps_to_try.map((step, index) => (
                  <li key={index} className="mb-1">{step}</li>
                ))}
              </ol>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Helpful Tips</h4>
              <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                {challenge.helpful_tips.map((tip, index) => (
                  <li key={index} className="mb-1">{tip}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Example Dialogues</h4>
              <ul className="mt-1 list-disc list-inside text-sm text-gray-600">
                {challenge.example_dialogues.map((dialogue, index) => (
                  <li key={index} className="mb-1">{dialogue}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-900">Reflection</h4>
              <textarea
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                rows={3}
                placeholder="What did you learn from this challenge?"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm flex items-center">
            <Icon name="x-circle" className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard; 