import React from 'react';
import { useOnboarding } from './OnboardingState';

export default function WelcomeScreen(): JSX.Element {
  const { setCurrentStep } = useOnboarding();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Welcome to Confidant!
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Let's set up your family so we can personalize your experience.
        </p>
        <button
          onClick={() => setCurrentStep(2)}
          className="w-full py-3 px-6 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Get Started →
        </button>
      </div>
    </div>
  );
} 