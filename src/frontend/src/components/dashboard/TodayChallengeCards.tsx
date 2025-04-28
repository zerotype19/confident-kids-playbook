import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostChallengeReflectionModal from '../challenges/PostChallengeReflectionModal';
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
  is_completed: boolean;
}

interface TodayChallengeCardsProps {
  challenge: Challenge | null;
  childId: string;
  onComplete?: () => void;
}

const CARD_ICONS = [
  '💡', // intro
  '👟', // step 1
  '👟', // step 2
  '👟', // step 3
  '💬', // dialogue
  '✅', // completion
];

export default function TodayChallengeCards({ challenge, childId, onComplete }: TodayChallengeCardsProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(challenge?.is_completed || false);
  const [showReflection, setShowReflection] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const { selectedChild } = useChildContext();
  const navigate = useNavigate();

  const handleReflectionSubmit = async ({ feeling, reflection }: { feeling: number; reflection: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      const reflectionResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/reflection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          child_id: childId,
          challenge_id: challenge?.id,
          feeling,
          reflection
        })
      });
      if (!reflectionResponse.ok) {
        throw new Error('Failed to save reflection');
      }
      const challengeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/challenge-log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          child_id: childId,
          challenge_id: challenge?.id
        })
      });
      if (!challengeResponse.ok) {
        throw new Error('Failed to mark challenge as complete');
      }
      setIsCompleted(true);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error completing challenge:', err);
      setError(err instanceof Error ? err.message : 'Failed to complete challenge');
    } finally {
      setIsCompleting(false);
      setShowReflection(false);
    }
  };

  const handleMarkComplete = () => {
    setShowReflection(true);
  };

  if (!challenge) {
    return (
      <div className="bg-white rounded-2xl shadow-kidoova p-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Challenge Available</h3>
          <p className="text-gray-600">Check back later for today's challenge.</p>
        </div>
      </div>
    );
  }

  const cards = [
    {
      type: 'intro',
      icon: CARD_ICONS[0],
    },
    {
      type: 'step',
      icon: CARD_ICONS[1],
      stepNum: 1,
      content: challenge.steps[0],
    },
    {
      type: 'step',
      icon: CARD_ICONS[2],
      stepNum: 2,
      content: challenge.steps[1],
    },
    {
      type: 'step',
      icon: CARD_ICONS[3],
      stepNum: 3,
      content: challenge.steps[2],
    },
    {
      type: 'dialogue',
      icon: CARD_ICONS[4],
      content: challenge.example_dialogue,
    },
    {
      type: 'completion',
      icon: CARD_ICONS[5],
    }
  ];

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative w-full flex items-end justify-center"
        style={{ height: `${360 + 24 * (cards.length - currentCard - 1)}px` }}
      >
        {isCompleted ? (
          <div className="absolute left-0 right-0 mx-auto rounded-2xl shadow-xl flex flex-col items-center bg-white justify-center h-[360px] w-full">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 text-kidoova-accent">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-2xl font-bold">Daily Challenge Completed!</span>
              </div>
              <button
                onClick={() => navigate('/all-challenges')}
                className="px-6 py-3 rounded-lg font-semibold text-white bg-kidoova-accent hover:bg-kidoova-green transition-colors duration-200 mt-4"
              >
                View all Challenges
              </button>
            </div>
          </div>
        ) : (
          cards.slice(currentCard).map((card, idx) => {
            const isTop = idx === 0;
            const z = cards.length - idx;
            const offset = idx * 24;
            const scale = 1 - idx * 0.05;
            return (
              <div
                key={idx}
                className={`absolute left-0 right-0 mx-auto rounded-2xl shadow-xl flex flex-col items-center transition-all duration-300 bg-white ${isTop ? '' : 'pointer-events-none'}`}
                style={{
                  top: offset,
                  zIndex: z,
                  transform: `scale(${scale})`,
                  opacity: 1,
                  width: '100%',
                  height: '360px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center px-6 w-full">
                  {/* First Card: Intro */}
                  {card.type === 'intro' && selectedChild && (
                    <>
                      <div className="text-lg font-semibold text-gray-700 mb-2 text-center">{selectedChild.name}'s Daily Challenge</div>
                      <div className="flex items-center justify-center mb-2">
                        <span className="text-3xl mr-2">{card.icon}</span>
                        <span className="text-3xl font-bold text-kidoova-green text-center">{challenge.title}</span>
                      </div>
                      <div className="text-lg text-gray-800 text-center">{challenge.description}</div>
                    </>
                  )}
                  {/* Step Cards */}
                  {card.type === 'step' && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-2xl mr-2">{card.icon}</span>
                        <span className="text-2xl font-bold text-kidoova-green text-center">Step {card.stepNum}</span>
                      </div>
                      <div className="text-lg text-gray-800 text-center">{card.content}</div>
                    </>
                  )}
                  {/* Dialogue Card */}
                  {card.type === 'dialogue' && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-2xl mr-2">{card.icon}</span>
                        <span className="text-2xl font-bold text-kidoova-green text-center">Try Saying This</span>
                      </div>
                      <div className="text-lg text-gray-800 text-center">{card.content}</div>
                    </>
                  )}
                  {/* Completion Card */}
                  {card.type === 'completion' && (
                    <div className="space-y-6 w-full flex flex-col items-center">
                      <div className="flex items-center justify-center">
                        <span className="text-2xl mr-2">{card.icon}</span>
                        <span className="text-2xl font-bold text-kidoova-green text-center">Great Job!</span>
                      </div>
                      <p className="text-lg text-gray-700 text-center">You've completed all the steps for today's challenge.</p>
                      <button
                        onClick={handleMarkComplete}
                        disabled={isCompleting}
                        className={`px-6 py-3 rounded-lg font-semibold text-white w-full max-w-xs
                          ${isCompleting 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-kidoova-accent hover:bg-kidoova-green transition-colors duration-200'
                          }`}
                      >
                        {isCompleting ? 'Marking Complete...' : 'Mark Challenge Complete'}
                      </button>
                    </div>
                  )}
                  {/* Next Button */}
                  {isTop && idx !== cards.length - 1 && card.type !== 'completion' && (
                    <button
                      className="mt-8 px-6 py-2 rounded-lg bg-kidoova-accent text-white font-semibold shadow hover:bg-kidoova-green transition-colors duration-200 w-full max-w-xs"
                      onClick={() => setCurrentCard(currentCard + 1)}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-center mt-4">
          {error}
        </div>
      )}
      {/* Reflection Modal */}
      {showReflection && (
        <PostChallengeReflectionModal
          onClose={() => {
            setShowReflection(false);
            setIsCompleting(false);
          }}
          onSubmit={handleReflectionSubmit}
          isSubmitting={isCompleting}
        />
      )}
    </div>
  );
} 