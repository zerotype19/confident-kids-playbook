import React, { useState, useEffect } from 'react';
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
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
  challenge_type: {
    name: string;
    description: string;
  };
  difficulty_level: number;
}

interface TodayChallengeCardsProps {
  challenge: Challenge | null;
  childId: string;
  onComplete?: () => void;
}

const CARD_ICONS = [
  '💡', // intro
  '🎯', // what you practice
  '🚀', // start prompt
  '📚', // guide prompt
  '✨', // success signals
  '💡', // why it matters
  '✅', // completion
];

export default function TodayChallengeCards({ challenge, childId, onComplete }: TodayChallengeCardsProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const { selectedChild } = useChildContext();
  const navigate = useNavigate();

  useEffect(() => {
    const checkDailyCompletion = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/challenge-log?child_id=${childId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const today = new Date().toISOString().split('T')[0];
          const hasCompletedToday = data.some((log: any) => 
            log.completed_at && new Date(log.completed_at).toISOString().split('T')[0] === today
          );
          setIsCompleted(hasCompletedToday);
        }
      } catch (err) {
        console.error('Error checking daily completion:', err);
      }
    };

    checkDailyCompletion();
  }, [childId]);

  useEffect(() => {
    if (challenge?.is_completed) {
      setIsCompleted(true);
    }
  }, [challenge]);

  const pillarHex: Record<number, string> = {
    1: '#F7B801', // Independence & Problem-Solving
    2: '#38A169', // Growth Mindset & Resilience
    3: '#4299E1', // Social Confidence & Communication
    4: '#805AD5', // Purpose & Strength Discovery
    5: '#E53E3E'  // Managing Fear & Anxiety
  };

  const handleReflectionSubmit = async ({ feeling, reflection }: { feeling: number; reflection: string }) => {
    try {
      setIsCompleting(true);
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Workout Available</h3>
          <p className="text-gray-600">Check back later for today's workout.</p>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="bg-white rounded-2xl shadow-kidoova p-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2 text-kidoova-accent">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-3xl font-heading font-bold">Daily Workout Completed!</span>
          </div>
          <button
            onClick={() => navigate('/all-challenges')}
            className="px-6 py-3 rounded-lg font-semibold text-white bg-kidoova-accent hover:bg-kidoova-green transition-colors duration-200 mt-4"
          >
            See More Workouts
          </button>
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
      type: 'start',
      icon: CARD_ICONS[2],
      content: challenge.start_prompt,
    },
    {
      type: 'guide',
      icon: CARD_ICONS[3],
      content: challenge.guide_prompt,
    },
    {
      type: 'success',
      icon: CARD_ICONS[4],
      content: challenge.success_signals,
    },
    {
      type: 'why',
      icon: CARD_ICONS[5],
      content: challenge.why_it_matters,
    },
    {
      type: 'completion',
      icon: CARD_ICONS[6],
    }
  ];

  return (
    <div className="relative flex flex-col items-center">
      <div
        className="relative w-full flex items-end justify-center"
        style={{ height: `${360 + 15 * (cards.length - currentCard - 1)}px` }}
      >
        {cards.slice(currentCard).map((card, idx) => {
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
                height: '300px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
              }}
            >
              <div className="flex-1 flex flex-col items-center justify-center px-6 w-full">
                {/* Daily Challenge Title - Show on all cards */}
                <div className="w-full text-center mt-4 mb-4">
                  <h2 className={`${currentCard > 0 ? 'text-sm text-gray-400' : 'text-2xl font-heading text-gray-900'}`}>
                    {selectedChild ? `${selectedChild.name}'s Daily Workout` : 'Daily Workout'}
                  </h2>
                </div>

                {/* First Card: Intro */}
                {card.type === 'intro' && selectedChild && (
                  <>
                    <div className="flex items-center justify-center space-x-4 mb-2">
                      <span 
                        className="text-xs font-medium px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: pillarHex[challenge.pillar_id],
                          color: 'white'
                        }}
                      >
                        {challenge.pillar_id === 1 ? 'Independence & Problem-Solving' :
                         challenge.pillar_id === 2 ? 'Growth Mindset & Resilience' :
                         challenge.pillar_id === 3 ? 'Social Confidence & Communication' :
                         challenge.pillar_id === 4 ? 'Purpose & Strength Discovery' :
                         'Managing Fear & Anxiety'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        challenge.difficulty_level === 1 
                          ? 'bg-green-100 text-green-800'
                          : challenge.difficulty_level === 2
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {challenge.difficulty_level === 1 ? 'Easy' : challenge.difficulty_level === 2 ? 'Medium' : 'Hard'}
                      </span>
                    </div>
                    <div className="flex flex-col items-center space-y-2 pt-2">
                      <h2 className="text-3xl font-bold text-kidoova-green text-center">"{challenge.title}"</h2>
                      <p className="text-lg text-gray-800 text-center">{challenge.what_you_practice}</p>
                    </div>
                    <div className="flex-1 flex items-end justify-center pb-4">
                      <button
                        onClick={() => setCurrentCard(prev => Math.min(cards.length - 1, prev + 1))}
                        disabled={currentCard === cards.length - 1}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          currentCard === cards.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-kidoova-accent text-white hover:bg-kidoova-green'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {/* Other Cards */}
                {card.type !== 'intro' && card.type !== 'completion' && (
                  <>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-4xl">{card.icon}</div>
                      <p className="text-lg text-gray-800 text-center">{card.content}</p>
                    </div>
                    <div className="flex-1 flex items-end justify-center pb-4">
                      <button
                        onClick={() => setCurrentCard(prev => Math.min(cards.length - 1, prev + 1))}
                        disabled={currentCard === cards.length - 1}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          currentCard === cards.length - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-kidoova-accent text-white hover:bg-kidoova-green'
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </>
                )}

                {/* Completion Card */}
                {card.type === 'completion' && (
                  <>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-4xl">{card.icon}</div>
                      <p className="text-lg text-gray-800 text-center">Ready to complete today's workout?</p>
                    </div>
                    <div className="flex-1 flex items-end justify-center pb-4">
                      <button
                        onClick={handleMarkComplete}
                        disabled={isCompleting}
                        className={`px-4 py-2 rounded-lg font-semibold ${
                          isCompleting
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-kidoova-accent text-white hover:bg-kidoova-green'
                        }`}
                      >
                        {isCompleting ? 'Completing...' : 'Mark Complete'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showReflection && (
        <PostChallengeReflectionModal
          onClose={() => setShowReflection(false)}
          onSubmit={handleReflectionSubmit}
          isSubmitting={isCompleting}
        />
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 