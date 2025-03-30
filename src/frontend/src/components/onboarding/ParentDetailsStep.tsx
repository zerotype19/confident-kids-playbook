import React, { useState } from 'react';
import { useOnboarding } from './OnboardingState';

interface ParentDetailsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function ParentDetailsStep({ onNext, onBack }: ParentDetailsStepProps) {
  const { userData, setUserData } = useOnboarding();
  const [name, setName] = useState(userData.name);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserData({ ...userData, name });
    onNext();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Your Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back
          </button>
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Next
          </button>
        </div>
      </div>
    </form>
  );
} 