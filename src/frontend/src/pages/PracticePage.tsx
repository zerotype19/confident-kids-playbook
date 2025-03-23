import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { PracticeModule, PILLAR_NAMES, PillarId } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FeatureGate } from '../components/FeatureGate';

export const PracticePage: React.FC = () => {
  const { child_id } = useParams<{ child_id: string }>();
  const { selectedChild } = useChildContext();
  const { isFeatureEnabled } = useFeatureFlags();
  const [modules, setModules] = useState<PracticeModule[]>([]);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [reflectionText, setReflectionText] = useState('');

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch(`/api/practice/view?child_id=${child_id}`);
        if (!response.ok) throw new Error('Failed to fetch practice modules');
        const data = await response.json();
        setModules(data.modules);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (child_id) {
      fetchModules();
    }
  }, [child_id]);

  const handleOptionSelect = async (optionIndex: number) => {
    if (!child_id || !modules[currentModuleIndex]) return;

    setSelectedOption(optionIndex);
    const currentStep = modules[currentModuleIndex].steps[currentStepIndex];
    const isCorrect = currentStep.options?.[optionIndex].isCorrect;

    // Update progress
    try {
      await fetch('/api/practice/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id,
          module_id: modules[currentModuleIndex].id,
          step_id: currentStep.id
        })
      });

      // Move to next step after a delay
      setTimeout(() => {
        if (currentStepIndex < modules[currentModuleIndex].steps.length - 1) {
          setCurrentStepIndex(currentStepIndex + 1);
          setSelectedOption(null);
        } else if (currentModuleIndex < modules.length - 1) {
          setCurrentModuleIndex(currentModuleIndex + 1);
          setCurrentStepIndex(0);
          setSelectedOption(null);
        }
      }, 1500);
    } catch (err) {
      setError('Failed to update progress. Please try again.');
    }
  };

  const handleReflectionSubmit = async () => {
    if (!child_id || !modules[currentModuleIndex]) return;

    try {
      await fetch('/api/practice/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id,
          module_id: modules[currentModuleIndex].id,
          step_id: modules[currentModuleIndex].steps[currentStepIndex].id
        })
      });

      // Move to next step
      if (currentStepIndex < modules[currentModuleIndex].steps.length - 1) {
        setCurrentStepIndex(currentStepIndex + 1);
        setReflectionText('');
      } else if (currentModuleIndex < modules.length - 1) {
        setCurrentModuleIndex(currentModuleIndex + 1);
        setCurrentStepIndex(0);
        setReflectionText('');
      }
    } catch (err) {
      setError('Failed to update progress. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading practice modules...</div>
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

  if (!isFeatureEnabled('practice_enabled')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Practice Modules
          </h2>
          <p className="text-gray-600 mb-4">
            Upgrade to premium to access interactive practice modules
          </p>
          <button
            onClick={() => window.location.href = '/settings'}
            className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
          >
            Upgrade Now
          </button>
        </div>
      </div>
    );
  }

  if (modules.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Practice Modules Available
          </h2>
          <p className="text-gray-600">
            Check back later for new practice modules
          </p>
        </div>
      </div>
    );
  }

  const currentModule = modules[currentModuleIndex];
  const currentStep = currentModule.steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / currentModule.steps.length) * 100;

  return (
    <FeatureGate feature="practice_enabled">
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-4xl mx-auto px-2 sm:px-4">
          <div className="mb-4 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {selectedChild?.name}'s Practice Modules
            </h1>
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              Interactive learning modules for {PILLAR_NAMES[currentModule.pillar_id as PillarId]}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-4 sm:mb-8">
            <div className="flex justify-between mb-1 sm:mb-2">
              <span className="text-xs sm:text-sm text-gray-600">
                Module {currentModuleIndex + 1} of {modules.length}
              </span>
              <span className="text-xs sm:text-sm text-gray-600">
                Step {currentStepIndex + 1} of {currentModule.steps.length}
              </span>
            </div>
            <div className="h-1.5 sm:h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Module Content */}
          <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">{currentStep.title}</h2>
            <div className="prose prose-sm sm:prose max-w-none mb-4 sm:mb-6">
              {currentStep.content}
            </div>

            {currentStep.type === 'interactive' && currentStep.options && (
              <div className="space-y-2 sm:space-y-3">
                {currentStep.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={selectedOption !== null}
                    className={`
                      w-full p-3 sm:p-4 text-left rounded-lg border text-sm sm:text-base
                      ${selectedOption === null
                        ? 'hover:bg-gray-50'
                        : selectedOption === index
                          ? option.isCorrect
                            ? 'bg-green-50 border-green-500'
                            : 'bg-red-50 border-red-500'
                          : 'bg-gray-50'
                      }
                    `}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            )}

            {currentStep.type === 'reflection' && (
              <div className="space-y-3 sm:space-y-4">
                <textarea
                  value={reflectionText}
                  onChange={(e) => setReflectionText(e.target.value)}
                  placeholder="Share your thoughts..."
                  className="w-full p-2 sm:p-3 text-sm sm:text-base border rounded-lg"
                  rows={4}
                />
                <button
                  onClick={handleReflectionSubmit}
                  disabled={!reflectionText.trim()}
                  className={`
                    px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base rounded-md
                    ${reflectionText.trim()
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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
    </FeatureGate>
  );
}; 