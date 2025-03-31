import React from 'react';

interface ChallengeFiltersProps {
  selectedPillar: number | null;
  onPillarChange: (pillar: number | null) => void;
  selectedDifficulty: number | null;
  onDifficultyChange: (difficulty: number | null) => void;
}

const PILLARS = [
  { id: 1, name: 'Problem Solving' },
  { id: 2, name: 'Growth Mindset' },
  { id: 3, name: 'Social Skills' },
  { id: 4, name: 'Self-Awareness' },
  { id: 5, name: 'Courage' }
];

const DIFFICULTIES = [
  { id: 1, name: 'Easy', description: 'Great for beginners' },
  { id: 2, name: 'Medium', description: 'Balanced challenge' },
  { id: 3, name: 'Hard', description: 'Advanced skills' }
];

export default function ChallengeFilters({
  selectedPillar,
  onPillarChange,
  selectedDifficulty,
  onDifficultyChange
}: ChallengeFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Pillar
          </label>
          <div className="space-y-2">
            <button
              onClick={() => onPillarChange(null)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                selectedPillar === null
                  ? 'bg-kidoova-accent text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Pillars
            </button>
            {PILLARS.map((pillar) => (
              <button
                key={pillar.id}
                onClick={() => onPillarChange(pillar.id)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                  selectedPillar === pillar.id
                    ? 'bg-kidoova-accent text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {pillar.name}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Difficulty
          </label>
          <div className="space-y-2">
            <button
              onClick={() => onDifficultyChange(null)}
              className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                selectedDifficulty === null
                  ? 'bg-kidoova-accent text-white'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Difficulties
            </button>
            {DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty.id}
                onClick={() => onDifficultyChange(difficulty.id)}
                className={`w-full text-left px-4 py-2 rounded-lg text-sm ${
                  selectedDifficulty === difficulty.id
                    ? 'bg-kidoova-accent text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{difficulty.name}</div>
                <div className="text-xs text-gray-500">{difficulty.description}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 