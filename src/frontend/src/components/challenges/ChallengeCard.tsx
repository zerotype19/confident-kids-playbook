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
      await onComplete(challenge.id);
    } catch (err) {
      setError('Failed to mark challenge as complete');
      console.error('Error completing challenge:', err);
      setIsCompleting(false);
    }
  };

  return (
    <div className={`bg-kidoova-background rounded-xl shadow-yellowSoft overflow-hidden border border-gray-200 transition-all duration-300 ${
      isCompleting ? 'opacity-50' : 'opacity-100'
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-start gap-4 bg-kidoova-background hover:bg-kidoova-background/90 transition-colors border-0 focus:outline-none focus:ring-0 appearance-none cursor-pointer"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-gray-900">{challenge.title}</h2>
            <div className="flex items-center gap-3">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                challenge.difficulty_level === 1 
                  ? 'bg-green-100 text-green-800'
                  : challenge.difficulty_level === 2
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {challenge.difficulty_level === 1 ? 'Easy' : challenge.difficulty_level === 2 ? 'Medium' : 'Hard'}
              </span>
              <span className="text-gray-500 text-xl font-medium">
                {isExpanded ? '−' : '+'}
              </span>
            </div>
          </div>
          <p className="text-gray-600 mt-1">{challenge.description}</p>
          {challenge.is_completed && (
            <div className="mt-2 flex items-center text-kidoova-accent">
              <Icon name="check-circle" className="w-4 h-4 mr-1" />
              <span className="text-sm">Completed</span>
            </div>
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Goal */}
          <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
            <h3 className="text-lg font-semibold text-kidoova-green mb-2">Your Goal</h3>
            <p className="text-text-base">{challenge.goal}</p>
          </div>

          {/* Steps */}
          <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
            <h3 className="text-lg font-semibold text-kidoova-green mb-2">Steps to Try</h3>
            <ol className="space-y-2">
              {Array.isArray(steps) && steps.map((step: string, index: number) => (
                <li key={index} className="flex items-start">
                  <span className="flex-shrink-0 w-6 h-6 bg-kidoova-accent text-white rounded-full flex items-center justify-center mr-2 mt-1">
                    {index + 1}
                  </span>
                  <span className="text-text-base">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Helpful Tips */}
          {challenge.tip && (
            <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
              <h3 className="text-lg font-semibold text-kidoova-green mb-2">Helpful Tip</h3>
              <p className="text-text-base">{challenge.tip}</p>
            </div>
          )}

          {/* Example Dialogue */}
          {challenge.example_dialogue && (
            <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
              <h3 className="text-lg font-semibold text-kidoova-green mb-2">Try Saying This</h3>
              <p className="text-text-base italic">"{challenge.example_dialogue}"</p>
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
      )}
    </div>
  );
} 