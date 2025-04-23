import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PostChallengeReflectionModal from '../challenges/PostChallengeReflectionModal';
import { useChildContext } from '../../contexts/ChildContext';
import ParentGuideDrawer from './ParentGuideDrawer';

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

interface TodayChallengeCardProps {
  challenge: Challenge | null;
  childId: string;
  onComplete?: () => void;
}

export default function TodayChallengeCard({ challenge, childId, onComplete }: TodayChallengeCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(challenge?.is_completed || false);
  const [showReflection, setShowReflection] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();
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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 space-y-6">
        {!isCompleted ? (
          <>
            {/* Title Section */}
            <div className="relative">
              <span
                onClick={() => setShowGuide(true)}
                className="absolute top-0 right-0 text-xs text-gray-400 hover:text-kidoova-accent transition-colors cursor-pointer"
              >
                Click for Parent's Guide
              </span>
              <div className="text-center">
                <h2 className="text-2xl font-heading text-gray-900 mb-2">
                  {selectedChild ? `${selectedChild.name}'s Daily Challenge` : 'Daily Challenge'}
                </h2>
                <div className="group relative inline-block">
                  <h2 className="text-3xl font-bold text-kidoova-green mb-2 cursor-help">
                    {challenge.title}
                  </h2>
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64">
                    {challenge.description}
                  </div>
                </div>
                <div className="mt-2">
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
                </div>
              </div>
            </div>

            {/* Goal Section */}
            <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
              <h3 className="text-lg font-semibold text-kidoova-green mb-2">
                Your Goal
              </h3>
              <p className="text-text-base">
                {challenge.goal}
              </p>
            </div>

            {/* Steps Section */}
            <div className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
              <h3 className="text-lg font-semibold text-kidoova-green mb-3">
                Steps to Try
              </h3>
              <ul className="space-y-2">
                {challenge.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-kidoova-accent text-white rounded-full flex items-center justify-center mr-2 mt-1">
                      {index + 1}
                    </span>
                    <span className="text-text-base">{step}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tip and Example Icons */}
            <div className="flex justify-center gap-6 mt-4">
              {/* Helpful Tip Icon */}
              <div className="group relative">
                <div className="w-10 h-10 rounded-full bg-kidoova-background flex items-center justify-center cursor-help">
                  <svg className="w-6 h-6 text-kidoova-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64">
                  {challenge.tip}
                </div>
              </div>

              {/* Try Saying This Icon */}
              <div className="group relative">
                <div className="w-10 h-10 rounded-full bg-kidoova-background flex items-center justify-center cursor-help">
                  <svg className="w-6 h-6 text-kidoova-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-64">
                  "{challenge.example_dialogue}"
                </div>
              </div>
            </div>

            {/* Mark Complete Button */}
            <div className="flex justify-center">
              <button
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className={`
                  px-6 py-3 rounded-lg font-semibold text-white
                  ${isCompleting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-kidoova-accent hover:bg-kidoova-green transition-colors duration-200'
                  }
                `}
              >
                {isCompleting ? 'Marking Complete...' : 'Mark Challenge Complete'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2 text-kidoova-accent">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-semibold">Daily Challenge Completed</span>
            </div>
            <button
              onClick={() => navigate('/all-challenges')}
              className="px-6 py-3 rounded-lg font-semibold text-white bg-kidoova-accent hover:bg-kidoova-green transition-colors duration-200"
            >
              Explore More Challenges
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-600 text-center">
            {error}
          </div>
        )}
      </div>

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

      {/* Parent Guide Drawer */}
      <ParentGuideDrawer isOpen={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
} 