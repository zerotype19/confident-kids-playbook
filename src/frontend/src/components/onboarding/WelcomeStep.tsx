import React from 'react';

interface WelcomeStepProps {
  onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="text-center">
        <img 
          src="/logo.png" 
          alt="Kidoova Logo" 
          className="h-16 mx-auto mb-6"
        />
        <h3 className="text-lg font-medium text-gray-900">Welcome to Kidoova</h3>
        <p className="mt-2 text-sm text-gray-500">
          Let's get your family set up
        </p>
      </div>
      <div className="mt-8">
        <button
          onClick={onNext}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Get Started
        </button>
      </div>
    </div>
  );
} 