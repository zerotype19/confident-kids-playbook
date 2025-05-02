import React, { useState } from 'react';
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
  const { token } = useAuth();

  const cards = [
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

      if (onComplete) {
        onComplete();
      }
      onClose();
    } catch (error) {
      console.error('Error completing challenge:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    const currentCard = cards[currentStep];

    if (currentCard.type === 'reflection') {
      return (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center text-kidoova-green">How confident did you feel?</h2>
          
          <div className="flex justify-center space-x-4">
            {emojiFaces.map((emoji, index) => (
              <button
                key={index}
                onClick={() => setFeeling(index + 1)}
                className={`text-4xl transition-transform duration-200 ${
                  feeling === index + 1 ? 'scale-125' : 'hover:scale-110'
                }`}
              >
                {emoji}
              </button>
            ))}
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

          <div className="flex justify-end space-x-4">
            <button
              onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Back
            </button>
            <button
              onClick={handleReflectionSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-kidoova-green text-white rounded-lg hover:bg-kidoova-accent disabled:opacity-50"
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

        <div className="text-lg text-gray-800 text-center">
          {currentCard.content}
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