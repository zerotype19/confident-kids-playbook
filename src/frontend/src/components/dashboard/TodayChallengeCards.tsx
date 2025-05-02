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
      type: 'practice',
      icon: CARD_ICONS[1],
      content: challenge.what_you_practice,
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
                  height: '300px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
                }}
              >
                <div className="flex-1 flex flex-col items-center justify-center px-6 w-full">
                  {/* Daily Challenge Title - Show on all cards */}
                  <div className="w-full text-center mb-2">
                    <h2 className="text-2xl font-heading text-gray-900">
                      {selectedChild ? `${selectedChild.name}'s Daily Challenge` : 'Daily Challenge'}
                    </h2>
                  </div>

                  {/* First Card: Intro */}
                  {card.type === 'intro' && selectedChild && (
                    <>
                      <div className="flex items-center justify-center space-x-4 mb-2">
                        <span 
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: challenge.pillar_id === 1 ? '#F7B801' :
                                           challenge.pillar_id === 2 ? '#38A169' :
                                           challenge.pillar_id === 3 ? '#4299E1' :
                                           challenge.pillar_id === 4 ? '#805AD5' :
                                           '#E53E3E',
                            color: 'white'
                          }}
                        >
                          {challenge.pillar_id === 1 ? 'Independence & Problem-Solving' :
                           challenge.pillar_id === 2 ? 'Growth Mindset & Resilience' :
                           challenge.pillar_id === 3 ? 'Social Confidence & Communication' :
                           challenge.pillar_id === 4 ? 'Purpose & Strength Discovery' :
                           'Managing Fear & Anxiety'}
                        </span>
                        <span 
                          className="text-xs font-medium px-2 py-1 rounded-full"
                          style={{
                            backgroundColor: challenge.difficulty_level === 1 ? '#C6F6D5' :
                                           challenge.difficulty_level === 2 ? '#9AE6B4' :
                                           '#68D391',
                            color: challenge.difficulty_level === 1 ? '#22543D' :
                                   challenge.difficulty_level === 2 ? '#1A4731' :
                                   '#1B4B2F'
                          }}
                        >
                          Level {challenge.difficulty_level}
                        </span>
                      </div>
                      <div className="flex flex-col items-center space-y-2 pt-6">
                        <h2 className="text-3xl font-bold text-kidoova-green text-center">{challenge.title}</h2>
                        <p className="text-lg text-gray-800 text-center">{challenge.what_you_practice}</p>
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
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

                  {/* Practice Card */}
                  {card.type === 'practice' && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-3xl mr-2">{card.icon}</span>
                        <h3 className="text-xl font-bold text-kidoova-green">What You'll Practice</h3>
                      </div>
                      <div className="text-lg text-gray-800 text-center">{card.content}</div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        <button
                          onClick={() => setCurrentCard(prev => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentCard(prev => Math.min(cards.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {/* Start Prompt Card */}
                  {card.type === 'start' && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-3xl mr-2">{card.icon}</span>
                        <h3 className="text-xl font-bold text-kidoova-green">Getting Started</h3>
                      </div>
                      <div className="text-lg text-gray-800 text-center">{card.content}</div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        <button
                          onClick={() => setCurrentCard(prev => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentCard(prev => Math.min(cards.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {/* Guide Prompt Card */}
                  {card.type === 'guide' && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-3xl mr-2">{card.icon}</span>
                        <h3 className="text-xl font-bold text-kidoova-green">Guide</h3>
                      </div>
                      <div className="text-lg text-gray-800 text-center">{card.content}</div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        <button
                          onClick={() => setCurrentCard(prev => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentCard(prev => Math.min(cards.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {/* Success Signals Card */}
                  {card.type === 'success' && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-3xl mr-2">{card.icon}</span>
                        <h3 className="text-xl font-bold text-kidoova-green">Success Signals</h3>
                      </div>
                      <div className="text-lg text-gray-800 text-center">{card.content}</div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        <button
                          onClick={() => setCurrentCard(prev => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentCard(prev => Math.min(cards.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {/* Why It Matters Card */}
                  {card.type === 'why' && (
                    <>
                      <div className="flex items-center justify-center mb-4">
                        <span className="text-3xl mr-2">{card.icon}</span>
                        <h3 className="text-xl font-bold text-kidoova-green">Why It Matters</h3>
                      </div>
                      <div className="text-lg text-gray-800 text-center">{card.content}</div>
                      <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                        <button
                          onClick={() => setCurrentCard(prev => Math.max(0, prev - 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentCard(prev => Math.min(cards.length - 1, prev + 1))}
                          className="px-4 py-2 rounded-lg font-semibold bg-kidoova-accent text-white hover:bg-kidoova-green"
                        >
                          Next
                        </button>
                      </div>
                    </>
                  )}

                  {/* Completion Card */}
                  {card.type === 'completion' && (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="text-xl font-bold text-kidoova-green">Ready to complete this challenge?</div>
                      <button
                        onClick={handleMarkComplete}
                        className="px-6 py-3 rounded-lg font-semibold text-white bg-kidoova-accent hover:bg-kidoova-green transition-colors duration-200"
                      >
                        Mark Complete
                      </button>
                    </div>
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