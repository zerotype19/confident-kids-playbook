import React, { useState } from 'react';

interface ChallengeFiltersProps {
  selectedPillar: number | null;
  onPillarChange: (pillar: number | null) => void;
  selectedDifficulty: number | null;
  onDifficultyChange: (difficulty: number | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
}

const PILLARS = [
  { id: 1, name: 'Independence & Problem-Solving' },
  { id: 2, name: 'Growth Mindset & Resilience' },
  { id: 3, name: 'Social Confidence & Communication' },
  { id: 4, name: 'Purpose & Strength Discovery' },
  { id: 5, name: 'Managing Fear & Anxiety' }
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
  onDifficultyChange,
  searchTerm,
  onSearchChange,
  onClearFilters
}: ChallengeFiltersProps) {
  const [isPillarExpanded, setIsPillarExpanded] = useState(false);
  const [isDifficultyExpanded, setIsDifficultyExpanded] = useState(false);

  const hasActiveFilters = selectedPillar !== null || selectedDifficulty !== null || searchTerm !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search challenges by title or description..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidoova-accent focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Filters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pillar Filter */}
        <div>
          <button
            onClick={() => setIsPillarExpanded(!isPillarExpanded)}
            className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>Filter by Pillar</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${isPillarExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isPillarExpanded && (
            <div className="mt-2 space-y-2">
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
          )}
        </div>

        {/* Difficulty Filter */}
        <div>
          <button
            onClick={() => setIsDifficultyExpanded(!isDifficultyExpanded)}
            className="w-full flex justify-between items-center px-4 py-2 bg-gray-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <span>Filter by Difficulty</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${isDifficultyExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isDifficultyExpanded && (
            <div className="mt-2 space-y-2">
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
          )}
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClearFilters}
            className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
} 