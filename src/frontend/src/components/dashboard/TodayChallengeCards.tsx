import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
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

export default function TodayChallengeCards({ challenge, childId, onComplete }: TodayChallengeCardsProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(challenge?.is_completed || false);
  const [showReflection, setShowReflection] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const { selectedChild } = useChildContext();

  const handleReflectionSubmit = async ({ feeling, reflection }: { feeling: number; reflection: string }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First, save the reflection
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

      // Then mark the challenge as complete
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

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (currentCard < cards.length - 1) {
        setCurrentCard(prev => prev + 1);
      }
    },
    onSwipedRight: () => {
      if (currentCard > 0) {
        setCurrentCard(prev => prev - 1);
      }
    },
    trackMouse: true
  });

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
      type: 'tip',
      content: challenge.tip,
      icon: '💡',
      bgColor: 'bg-yellow-100'
    },
    {
      type: 'step',
      content: challenge.steps[0],
      icon: '👟',
      bgColor: 'bg-blue-100'
    },
    {
      type: 'step',
      content: challenge.steps[1],
      icon: '👟',
      bgColor: 'bg-blue-100'
    },
    {
      type: 'step',
      content: challenge.steps[2],
      icon: '👟',
      bgColor: 'bg-blue-100'
    },
    {
      type: 'dialogue',
      content: challenge.example_dialogue,
      icon: '💬',
      bgColor: 'bg-green-100'
    },
    {
      type: 'completion',
      content: '',
      icon: '✅',
      bgColor: 'bg-purple-100'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="relative">
        <div 
          {...swipeHandlers}
          className="relative h-[80vh] overflow-hidden"
        >
          <div 
            className="flex transition-transform duration-300 ease-in-out"
            style={{ transform: `translateX(-${currentCard * 100}%)` }}
          >
            {cards.map((card, index) => (
              <div
                key={index}
                className="w-full flex-shrink-0 h-full flex flex-col items-center justify-center p-6"
              >
                <div className={`w-full h-full ${card.bgColor} rounded-2xl shadow-xl flex flex-col items-center justify-center`}>
                  <div className="text-6xl mb-6">{card.icon}</div>
                  <div className="text-center max-w-md">
                    {card.type === 'completion' ? (
                      <div className="space-y-6">
                        <h2 className="text-2xl font-bold text-gray-900">Great Job!</h2>
                        <p className="text-gray-700">You've completed all the steps for today's challenge.</p>
                        <button
                          onClick={handleMarkComplete}
                          disabled={isCompleting}
                          className={`px-6 py-3 rounded-lg font-semibold text-white
                            ${isCompleting 
                              ? 'bg-gray-400 cursor-not-allowed' 
                              : 'bg-kidoova-accent hover:bg-kidoova-green transition-colors duration-200'
                            }`}
                        >
                          {isCompleting ? 'Marking Complete...' : 'Mark Challenge Complete'}
                        </button>
                      </div>
                    ) : (
                      <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                          {card.type === 'tip' ? 'Helpful Tip' :
                           card.type === 'step' ? `Step ${index}` :
                           'Try Saying This'}
                        </h2>
                        <p className="text-gray-700 text-lg">{card.content}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Swipe Indicator */}
        {currentCard < cards.length - 1 && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 animate-bounce">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        )}

        {/* Back Arrow */}
        {currentCard > 0 && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 animate-bounce">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Card Navigation Dots */}
      <div className="flex justify-center space-x-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentCard(index)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${
              currentCard === index ? 'bg-kidoova-accent' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 text-center">
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