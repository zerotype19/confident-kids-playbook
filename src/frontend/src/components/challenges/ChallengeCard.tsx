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

  const getDifficultyString = (level: number): string => {
    switch (level) {
      case 1: return 'easy';
      case 2: return 'medium';
      case 3: return 'hard';
      default: return 'medium';
    }
  };

  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      setError(null);
      await onComplete(Number(challenge.id));
    } catch (err) {
      setError('Failed to mark challenge as complete. Please try again.');
      console.error('Error completing challenge:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  const difficulty = getDifficultyString(challenge.difficulty_level);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{challenge.title}</h3>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            difficulty === 'easy' ? 'bg-green-100 text-green-800' :
            difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </span>
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-600 mb-4">{challenge.description}</p>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Goal:</span>
            <span className="text-sm font-medium text-gray-900">{challenge.goal}</span>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-400 hover:text-gray-500"
          >
            <Icon name={isExpanded ? 'chevron-up' : 'chevron-down'} />
          </button>
        </div>
        {isExpanded && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Steps to Try:</h4>
              <ul className="list-disc list-inside space-y-2">
                {Array.isArray(challenge.steps) ? (
                  challenge.steps.map((step: string, index: number) => (
                    <li key={index} className="text-sm text-gray-600">{step}</li>
                  ))
                ) : (
                  <li className="text-sm text-gray-600">{challenge.steps}</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Helpful Tip:</h4>
              <p className="text-sm text-gray-600">{challenge.tip}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Example Dialogue:</h4>
              <p className="text-sm text-gray-600">{challenge.example_dialogue}</p>
            </div>
          </div>
        )}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex-1 mr-4">
            <div className="h-2 bg-gray-200 rounded-full">
              <div
                className={`h-2 rounded-full ${
                  Boolean(challenge.is_completed) ? 'bg-green-500' : 'bg-gray-300'
                }`}
                style={{ width: Boolean(challenge.is_completed) ? '100%' : '0%' }}
              />
            </div>
          </div>
          <button
            onClick={handleComplete}
            disabled={isCompleting || Boolean(challenge.is_completed)}
            className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              Boolean(challenge.is_completed)
                ? 'bg-green-500 cursor-not-allowed'
                : isCompleting
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isCompleting ? (
              'Completing...'
            ) : Boolean(challenge.is_completed) ? (
              <>
                <Icon name="check-circle" className="mr-1.5" />
                Completed
              </>
            ) : (
              'Mark as Complete'
            )}
          </button>
        </div>
        {error && (
          <div className="mt-2 flex items-center text-red-600">
            <Icon name="x-circle" className="mr-1.5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeCard; 