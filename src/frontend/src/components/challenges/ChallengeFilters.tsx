import React, { useState } from 'react';
import { PILLAR_NAMES, PillarId } from '../../types';
import Icon from '../common/Icon';

interface ChallengeFiltersProps {
  selectedPillars: PillarId[];
  selectedDifficulties: string[];
  onPillarChange: (pillarId: PillarId) => void;
  onDifficultyChange: (difficulty: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
}

const ChallengeFilters: React.FC<ChallengeFiltersProps> = ({
  selectedPillars,
  selectedDifficulties,
  onPillarChange,
  onDifficultyChange,
  searchTerm,
  onSearchChange,
  onClearFilters
}) => {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const difficulties = ['easy', 'medium', 'hard'];

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon name="magnifying-glass" className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search challenges..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Filters Section */}
      <div>
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className="w-full flex items-center justify-between text-sm text-gray-600 hover:text-gray-900"
        >
          <span className="flex items-center">
            <Icon name="funnel" className="w-4 h-4 mr-2" />
            Filters
          </span>
          <Icon name={isFiltersExpanded ? 'chevron-up' : 'chevron-down'} className="w-4 h-4" />
        </button>

        {isFiltersExpanded && (
          <div className="mt-4 space-y-4">
            {/* Pillars Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Pillars</h4>
              <div className="space-y-2">
                {Object.entries(PILLAR_NAMES).map(([id, name]) => (
                  <label key={id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPillars.includes(Number(id))}
                      onChange={() => onPillarChange(Number(id))}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Difficulty Filter */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Difficulty</h4>
              <div className="space-y-2">
                {difficulties.map((difficulty) => (
                  <label key={difficulty} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedDifficulties.includes(difficulty)}
                      onChange={() => onDifficultyChange(difficulty)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700 capitalize">{difficulty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedPillars.length > 0 || selectedDifficulties.length > 0) && (
              <button
                onClick={onClearFilters}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Icon name="x-mark" className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChallengeFilters; 