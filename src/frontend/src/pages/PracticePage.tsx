import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { PracticeModule, PracticeStep } from '../types';

export const PracticePage: React.FC = () => {
  const { child_id } = useParams<{ child_id: string }>();
  const { selectedChild } = useChildContext();
  const { isFeatureEnabled } = useFeatureFlags();
  const [currentModule, setCurrentModule] = useState<PracticeModule | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [reflection, setReflection] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModule = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/practice/module?child_id=${child_id}`);
        if (!response.ok) throw new Error('Failed to fetch practice module');
        const data = await response.json();
        setCurrentModule(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch practice module');
      } finally {
        setLoading(false);
      }
    };

    if (child_id && isFeatureEnabled('premium.practice_modules')) {
      fetchModule();
    }
  }, [child_id, isFeatureEnabled]);

  const handleAnswer = async (stepId: string, isCorrect: boolean) => {
    if (!currentModule || !child_id) return;

    try {
      const response = await fetch('/api/practice/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id,
          module_id: currentModule.id,
          step_id: stepId,
          is_correct: isCorrect
        })
      });

      if (!response.ok) throw new Error('Failed to submit answer');

      const updatedModule = await response.json();
      setCurrentModule(updatedModule);
      setCurrentStepIndex(prev => prev + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
    }
  };

  const handleReflection = async () => {
    if (!currentModule || !child_id) return;

    try {
      const response = await fetch('/api/practice/reflection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id,
          module_id: currentModule.id,
          reflection
        })
      });

      if (!response.ok) throw new Error('Failed to submit reflection');

      const updatedModule = await response.json();
      setCurrentModule(updatedModule);
      setCurrentStepIndex(prev => prev + 1);
      setReflection('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit reflection');
    }
  };

  if (!isFeatureEnabled('premium.practice_modules')) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Practice Modules
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              This feature is available for premium members only.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading practice module...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">No practice module available</div>
      </div>
    );
  }

  const currentStep = currentModule.steps[currentStepIndex];

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {selectedChild?.name}'s Practice
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600">
            Complete the practice module to build confidence
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <div className="mb-4 sm:mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-500">
                Step {currentStepIndex + 1} of {currentModule.steps.length}
              </span>
              <span className="text-sm sm:text-base text-gray-500">
                {Math.round((currentStepIndex / currentModule.steps.length) * 100)}% Complete
              </span>
            </div>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${(currentStepIndex / currentModule.steps.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="text-base sm:text-lg text-gray-900">
              {currentStep.content}
            </div>

            {currentStep.type === 'question' && currentStep.options && (
              <div className="space-y-2 sm:space-y-3">
                {currentStep.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(currentStep.id, option.isCorrect)}
                    className="w-full text-left p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {currentStep.type === 'reflection' && (
              <div className="space-y-2 sm:space-y-3">
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                />
                <button
                  onClick={handleReflection}
                  disabled={!reflection.trim()}
                  className={`
                    w-full py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-white font-medium
                    ${reflection.trim()
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  Submit Reflection
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 