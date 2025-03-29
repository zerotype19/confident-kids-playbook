import React from 'react';

interface Challenge {
  title: string;
  description: string;
  goal: string;
  steps: string[];
  tip: string;
  example_dialogue: string;
}

interface TodayChallengeCardProps {
  challenge: Challenge;
}

export default function TodayChallengeCard({ challenge }: TodayChallengeCardProps) {
  return (
    <div className="bg-yellow-100 rounded-2xl shadow-kidoova p-6 space-y-6">
      {/* Title Section */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-kidoova-green mb-2">
          {challenge.title}
        </h2>
        <p className="text-lg text-green-900">
          {challenge.description}
        </p>
      </div>

      {/* Goal Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-kidoova-green mb-2">
          Your Goal
        </h3>
        <p className="text-green-900">
          {challenge.goal}
        </p>
      </div>

      {/* Steps Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-kidoova-green mb-3">
          Steps to Try
        </h3>
        <ul className="space-y-2">
          {challenge.steps.map((step, index) => (
            <li key={index} className="flex items-start">
              <span className="flex-shrink-0 w-6 h-6 bg-kidoova-green text-white rounded-full flex items-center justify-center mr-2 mt-1">
                {index + 1}
              </span>
              <span className="text-green-900">{step}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Tip Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-kidoova-green mb-2">
          Helpful Tip
        </h3>
        <p className="text-green-900">
          {challenge.tip}
        </p>
      </div>

      {/* Example Dialogue */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <h3 className="text-lg font-semibold text-kidoova-green mb-2">
          Try Saying This
        </h3>
        <p className="text-green-900 italic">
          "{challenge.example_dialogue}"
        </p>
      </div>
    </div>
  );
} 