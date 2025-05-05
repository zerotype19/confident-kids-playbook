import React, { useState, useEffect } from 'react';
import Modal from '../Modal';
import { useAuth } from '../../contexts/AuthContext';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string[];
  tip: string;
  example_dialogue: string;
  pillar_id: number;
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
  traits?: { trait_id: number; trait_name: string; weight: number }[];
}

interface UniversalChallengeModalProps {
  isOpen: boolean;
  onClose: () => void;
  challenge: Challenge;
  childId: string;
  onComplete?: () => void;
}

const emojiFaces = ['😖', '😐', '🙂', '😄', '🤩'];
const confidenceLabels = [
  'Not Confident',
  'A Little Unsure',
  'Feeling Okay',
  'Pretty Confident',
  'Super Confident',
];

const CARD_ICONS = [
  '🎯', // what you practice
  '🚀', // start prompt
  '📚', // guide prompt
  '✨', // success signals
  '💡', // why it matters
  '✅', // completion
];

interface Card {
  type: string;
  icon: string;
  title: string;
  content?: string | string[];
}

export default function UniversalChallengeModal({ 
  isOpen, 
  onClose, 
  challenge, 
  childId,
  onComplete 
}: UniversalChallengeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [feeling, setFeeling] = useState(3); // Default to middle value
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showXPSummary, setShowXPSummary] = useState(false);
  const [xpGains, setXPGains] = useState<{ trait_name: string; gain: number; new_total: number }[]>([]);
  const [totalXPGain, setTotalXPGain] = useState(0);
  const [traits, setTraits] = useState<{ trait_id: number; trait_name: string; weight: number }[]>(challenge.traits || []);
  const { token } = useAuth();

  // Fetch traits if not present
  useEffect(() => {
    if (!challenge.traits && challenge.id && token) {
      fetch(`${import.meta.env.VITE_API_URL}/api/challenge-traits/${challenge.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
        .then(res => res.json())
        .then(data => {
          setTraits(data);
        })
        .catch(err => {
          console.error('Failed to fetch challenge traits', err);
        });
    } else if (challenge.traits) {
      setTraits(challenge.traits);
    }
  }, [challenge.id, challenge.traits, token]);

  const cards: Card[] = [
    {
      type: 'practice',
      icon: CARD_ICONS[0],
      title: 'What You\'ll Practice',
      content: challenge.what_you_practice
    },
    {
      type: 'start',
      icon: CARD_ICONS[1],
      title: 'Getting Started',
      content: challenge.start_prompt
    },
    {
      type: 'guide',
      icon: CARD_ICONS[2],
      title: 'Guide Prompt',
      content: challenge.guide_prompt
    },
    {
      type: 'success',
      icon: CARD_ICONS[3],
      title: 'Success Signals',
      content: challenge.success_signals
    },
    {
      type: 'why',
      icon: CARD_ICONS[4],
      title: 'Why It Matters',
      content: challenge.why_it_matters
    },
    {
      type: 'reflection',
      icon: CARD_ICONS[5],
      title: 'How Did It Go?'
    }
  ];

  const handleReflectionSubmit = async () => {
    setIsSubmitting(true);
    try {
      // First, save the reflection
      const reflectionResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/reflection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          child_id: childId,
          challenge_id: challenge.id,
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
          challenge_id: challenge.id
        })
      });

      if (!challengeResponse.ok) {
        throw new Error('Failed to mark challenge as complete');
      }

      // Calculate XP gains
      const multiplier = 0.6 + 0.1 * feeling;
      const base = 10;
      const gains = traits.map(trait => ({
        trait_name: trait.trait_name,
        gain: Math.round(base * multiplier * trait.weight),
        new_total: 0 // Will be updated after fetching current scores
      }));

      // Fetch current trait scores to calculate new totals
      const scoresResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/trait-scores/${childId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (scoresResponse.ok) {
        const scoresData = await scoresResponse.json();
        const currentScores = scoresData.data;
        
        // Update new totals
        gains.forEach(gain => {
          const currentTrait = currentScores.find((t: any) => t.trait_name === gain.trait_name);
          gain.new_total = (currentTrait?.score || 0) + gain.gain;
        });
      }

      setXPGains(gains);
      setTotalXPGain(gains.reduce((sum, gain) => sum + gain.gain, 0));
      setShowXPSummary(true);
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderXPSummary = () => (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-center text-kidoova-green">XP Gained! 🎉</h2>
      <div className="space-y-2">
        {xpGains.map((gain, index) => (
          <div key={index} className="flex justify-between items-center text-sm">
            <span>{gain.trait_name}</span>
            <span className="text-green-600">
              +{gain.gain} XP ({gain.new_total} total)
            </span>
          </div>
        ))}
        <div className="border-t pt-2 mt-2 flex justify-between items-center font-semibold">
          <span>Total XP Gained</span>
          <span className="text-green-600">+{totalXPGain} XP</span>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={() => {
            if (onComplete) {
              onComplete();
            }
            onClose();
          }}
          className="px-4 py-2 bg-kidoova-green text-white rounded-lg hover:bg-kidoova-accent"
        >
          Close
        </button>
      </div>
    </div>
  );

  const renderStep = () => {
    if (showXPSummary) {
      return renderXPSummary();
    }

    const currentCard = cards[currentStep];

    if (currentCard.type === 'reflection') {
      return (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-center text-kidoova-green">How confident did you feel?</h2>
          
          <div className="flex justify-center space-x-1">
            {emojiFaces.map((emoji, index) => {
              // Green gradient classes from light to dark
              const greenBg = [
                'bg-green-50',  // 😖 - lightest
                'bg-green-100', // 😐
                'bg-green-200', // 🙂
                'bg-green-300', // 😄
                'bg-green-400'  // 🤩 - darkest
              ];
              const greenBorder = [
                'border-green-100',  // 😖
                'border-green-200',  // 😐
                'border-green-300',  // 🙂
                'border-green-400',  // 😄
                'border-green-500'   // 🤩
              ];
              return (
                <button
                  key={index}
                  onClick={() => setFeeling(index + 1)}
                  className={`text-2xl transition-all duration-200 rounded-full w-12 h-12 flex items-center justify-center border-2 focus:outline-none 
                    ${feeling === index + 1 ? `${greenBg[index]} ${greenBorder[index]} scale-110 shadow-md` : 'border-gray-300 bg-white hover:bg-green-50'}
                  `}
                  aria-label={confidenceLabels[index]}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
          
          <div className="text-center text-sm text-gray-600">
            {confidenceLabels[feeling - 1]}
          </div>

          <div className="space-y-2">
            <label htmlFor="reflection" className="block text-sm font-medium text-gray-700">
              Reflection (optional)
            </label>
            <textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-kidoova-green focus:border-transparent"
              rows={4}
              placeholder="How did the challenge go? What did you learn?"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={handleReflectionSubmit}
              disabled={isSubmitting}
              className="px-3 py-1.5 bg-kidoova-green text-white rounded-lg hover:bg-kidoova-accent disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Complete Challenge'}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-3xl">{currentCard.icon}</span>
          <h2 className="text-2xl font-bold text-kidoova-green">{currentCard.title}</h2>
        </div>

        <div className="text-lg text-gray-800">
          {currentCard.type === 'success' ? (
            <div className="text-center">
              <div className="space-y-2">
                {(() => {
                  const content = currentCard.content;
                  let signals: string[];
                  
                  if (typeof content === 'string') {
                    try {
                      // Try to parse as JSON if it's a string representation of an array
                      signals = JSON.parse(content);
                    } catch {
                      // If not JSON, try to parse as a Python-style list string
                      signals = content
                        .replace(/^\[|\]$/g, '') // Remove square brackets
                        .split(',') // Split by comma
                        .map(signal => signal.trim().replace(/^'|'$/g, '')); // Remove quotes and trim
                    }
                  } else if (Array.isArray(content)) {
                    signals = content;
                  } else {
                    signals = [];
                  }
                  
                  return signals.map((signal, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-green-500">✓</span>
                      <span className="text-left">{signal}</span>
                    </div>
                  ));
                })()}
              </div>
            </div>
          ) : (
            <div className="text-center">
              {typeof currentCard.content === 'string' ? currentCard.content : 
               Array.isArray(currentCard.content) ? currentCard.content.join('\n') : ''}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Back
          </button>
          <button
            onClick={() => setCurrentStep(prev => Math.min(cards.length - 1, prev + 1))}
            className="px-4 py-2 bg-kidoova-green text-white rounded-lg hover:bg-kidoova-accent"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={challenge.title}
    >
      <div className="p-6">
        {renderStep()}
      </div>
    </Modal>
  );
} 