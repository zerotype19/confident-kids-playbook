import React, { useState } from 'react';
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

const CARD_COLORS = [
  'bg-red-400',
  'bg-green-500',
  'bg-white',
  'bg-gray-400',
  'bg-yellow-300',
  'bg-purple-200',
];

const CARD_ICONS = [
  '💡', // tip
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
  const [swipeAnim, setSwipeAnim] = useState(false);
  const { selectedChild } = useChildContext();

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
      type: 'tip',
      content: challenge.tip,
      label: '0',
      bgColor: CARD_COLORS[0],
      icon: CARD_ICONS[0],
    },
    {
      type: 'step',
      content: challenge.steps[0],
      label: '1',
      bgColor: CARD_COLORS[1],
      icon: CARD_ICONS[1],
    },
    {
      type: 'step',
      content: challenge.steps[1],
      label: '2',
      bgColor: CARD_COLORS[2],
      icon: CARD_ICONS[2],
    },
    {
      type: 'step',
      content: challenge.steps[2],
      label: '3',
      bgColor: CARD_COLORS[3],
      icon: CARD_ICONS[3],
    },
    {
      type: 'dialogue',
      content: challenge.example_dialogue,
      label: '4',
      bgColor: CARD_COLORS[4],
      icon: CARD_ICONS[4],
    },
    {
      type: 'completion',
      content: '',
      label: '5',
      bgColor: CARD_COLORS[5],
      icon: CARD_ICONS[5],
    }
  ];

  return (
    <div className="relative flex flex-col items-center min-h-[500px] py-8">
      <div className="relative w-full max-w-md h-[400px] flex items-end justify-center">
        {cards.slice(currentCard).map((card, idx) => {
          const isTop = idx === 0;
          const z = cards.length - idx;
          const offset = idx * 24;
          const scale = 1 - idx * 0.05;
          return (
            <div
              key={card.label}
              className={`absolute left-0 right-0 mx-auto rounded-2xl shadow-xl flex flex-col items-center transition-all duration-300 ${card.bgColor} ${isTop && swipeAnim ? 'translate-y-[-120%] opacity-0' : ''}`}
              style={{
                top: offset,
                zIndex: z,
                transform: `scale(${scale})` + (isTop && swipeAnim ? ' translateY(-120%)' : ''),
                opacity: isTop && swipeAnim ? 0 : 1,
                pointerEvents: isTop ? 'auto' : 'none',
                height: '320px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
              }}
            >
              <div className="w-full flex flex-col items-center pt-2">
                <span className="text-3xl mb-1">{card.icon}</span>
                <span className="text-black font-bold text-lg">{card.label}</span>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center px-6">
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
                        card.type === 'step' ? `Step` :
                        'Try Saying This'}
                    </h2>
                    <p className="text-gray-700 text-lg">{card.content}</p>
                  </>
                )}
                {/* Next Button */}
                {isTop && idx !== cards.length - 1 && card.type !== 'completion' && (
                  <button
                    className="mt-8 px-6 py-2 rounded-lg bg-kidoova-accent text-white font-semibold shadow hover:bg-kidoova-green transition-colors duration-200"
                    onClick={() => setCurrentCard(currentCard + 1)}
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          );
        })}
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