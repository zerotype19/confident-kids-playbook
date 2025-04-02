import React, { useState } from 'react';
import { Challenge } from '../../types';
import * as OutlineIcons from '@heroicons/react/24/outline';
import * as SolidIcons from '@heroicons/react/24/solid';

const { CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } = OutlineIcons;
const { CheckCircleIcon: CheckCircleSolidIcon } = SolidIcons;

interface ChallengeCardProps {
  challenge: Challenge;
  childId: string;
}

export default function ChallengeCard({ challenge, childId }: ChallengeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartChallenge = async () => {
    if (isCompleting) return;
    
    setIsCompleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/challenges/${challenge.id}/complete`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ child_id: childId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      // Show completion animation or notification here
      window.dispatchEvent(new CustomEvent('challengeCompleted', {
        detail: {
          challengeId: challenge.id,
          title: challenge.title,
        }
      }));

    } catch (err) {
      console.error('Error completing challenge:', err);
      setError('Failed to complete challenge. Please try again.');
    } finally {
      setIsCompleting(false);
    }
  };

  const getDifficultyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {challenge.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(challenge.difficulty_level)} text-white`}>
                Level {challenge.difficulty_level}
              </span>
              {Boolean(challenge.is_completed) ? (
                <span className="inline-flex items-center text-green-600 text-sm">
                  <CheckCircleSolidIcon className="w-4 h-4 mr-1" />
                  Completed
                </span>
              ) : null}
            </div>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-4 text-gray-400 hover:text-gray-500"
          >
            {isExpanded ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                Boolean(challenge.is_completed) ? 'bg-green-500' : 'bg-yellow-500'
              }`}
              style={{ width: Boolean(challenge.is_completed) ? '100%' : '0%' }}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-4">
          <button
            onClick={handleStartChallenge}
            disabled={isCompleting || Boolean(challenge.is_completed)}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              Boolean(challenge.is_completed)
                ? 'bg-green-100 text-green-700 cursor-default'
                : isCompleting
                ? 'bg-gray-100 text-gray-500 cursor-wait'
                : 'bg-kidoova-accent text-white hover:bg-kidoova-accent/90'
            }`}
          >
            {Boolean(challenge.is_completed) ? (
              <span className="flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Completed
              </span>
            ) : isCompleting ? (
              'Completing...'
            ) : (
              'Start Challenge'
            )}
          </button>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4">
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900">Goal</h4>
            <p className="mt-1 text-sm text-gray-600">{challenge.goal}</p>
          </div>

          {Array.isArray(challenge.steps) && challenge.steps.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900">Steps to Try</h4>
              <ul className="mt-1 space-y-2">
                {challenge.steps.map((step, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {challenge.tip && (
            <div>
              <h4 className="text-sm font-medium text-gray-900">Helpful Tip</h4>
              <p className="mt-1 text-sm text-gray-600">{challenge.tip}</p>
            </div>
          )}

          {challenge.example_dialogue && (
            <div>
              <h4 className="text-sm font-medium text-gray-900">Example Dialogue</h4>
              <p className="mt-1 text-sm text-gray-600">{challenge.example_dialogue}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 