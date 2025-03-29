import React from 'react';
import CustomButton from '../CustomButton';

interface TodaysChallengeCardProps {
  title: string;
  description: string;
  goal: string;
  steps: string[];
  exampleDialogue: string;
  tip: string;
  pillar: string;
  onMarkComplete: () => void;
}

const TodaysChallengeCard: React.FC<TodaysChallengeCardProps> = ({
  title,
  description,
  goal,
  steps,
  exampleDialogue,
  tip,
  pillar,
  onMarkComplete,
}) => {
  return (
    <div className="bg-white shadow-kidoova rounded-2xl p-6 w-full">
      <h2 className="text-2xl font-bold text-kidoova-green mb-2">{title}</h2>
      <p className="text-gray-700 mb-4">{description}</p>

      <div className="mb-4">
        <h3 className="font-semibold text-kidoova-green text-sm">Goal:</h3>
        <p className="text-sm text-gray-600">{goal}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-kidoova-green text-sm">Steps:</h3>
        <ul className="list-disc pl-6 text-sm text-gray-600">
          {steps.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-kidoova-green text-sm">Example Dialogue:</h3>
        <blockquote className="italic text-gray-500">"{exampleDialogue}"</blockquote>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-kidoova-green text-sm">Tip:</h3>
        <p className="text-sm text-gray-600">{tip}</p>
      </div>

      <div className="mb-6">
        <span className="text-xs text-white bg-kidoova-green px-3 py-1 rounded-full">Pillar: {pillar}</span>
      </div>

      <CustomButton onClick={onMarkComplete}>Mark Challenge Complete</CustomButton>
    </div>
  );
};

export default TodaysChallengeCard; 