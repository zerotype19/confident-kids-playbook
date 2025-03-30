import React from 'react';
import { useOnboarding } from './OnboardingState';

interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  const { userData, familyData, children } = useOnboarding();

  return (
    <div className="text-center">
      <h3 className="text-lg font-medium text-gray-900">Setup Complete!</h3>
      <p className="mt-2 text-sm text-gray-500">
        Your family profile has been created successfully.
      </p>

      <div className="mt-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h4 className="text-sm font-medium text-gray-900">Family Details</h4>
          <dl className="mt-2 text-sm text-gray-500">
            <div className="mt-1">
              <dt className="inline">Family Name:</dt>
              <dd className="inline ml-2">{familyData.name}</dd>
            </div>
            <div className="mt-1">
              <dt className="inline">Parent:</dt>
              <dd className="inline ml-2">{userData.name}</dd>
            </div>
            <div className="mt-1">
              <dt className="inline">Children:</dt>
              <dd className="inline ml-2">{children.length}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-8">
        <button
          onClick={onComplete}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
} 