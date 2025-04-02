import React, { useState } from 'react';
import { PILLAR_NAMES, PillarId } from '../../types';
import * as HeroIcons from '@heroicons/react/24/outline';

const { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } = HeroIcons;

interface ChallengeFiltersProps {
  selectedPillar: number | null;
  onPillarChange: (pillarId: number | null) => void;
  selectedDifficulty: number | null;
  onDifficultyChange: (level: number | null) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  showCompleted: boolean;
  onCompletedChange: (show: boolean) => void;
  onClearFilters: () => void;
}

export default function ChallengeFilters({
  selectedPillar,
  onPillarChange,
  selectedDifficulty,
  onDifficultyChange,
  searchTerm,
  onSearchChange,
  showCompleted,
  onCompletedChange,
  onClearFilters,
}: ChallengeFiltersProps) {
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

  const hasActiveFilters = selectedPillar !== null || selectedDifficulty !== null || !showCompleted;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search challenges..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-kidoova-accent focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
          className={`flex items-center px-4 py-2 rounded-lg border ${
            hasActiveFilters
              ? 'border-kidoova-accent bg-kidoova-accent/10 text-kidoova-accent'
              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
          }`}
        >
          <FunnelIcon className="w-5 h-5 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-kidoova-accent text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {(selectedPillar !== null ? 1 : 0) +
                (selectedDifficulty !== null ? 1 : 0) +
                (!showCompleted ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {isFiltersExpanded && (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm space-y-6">
          {/* Pillar Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Filter by Pillar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {Object.entries(PILLAR_NAMES).map(([id, name]) => (
                <button
                  key={id}
                  onClick={() => onPillarChange(selectedPillar === Number(id) ? null : Number(id))}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedPillar === Number(id)
                      ? 'bg-kidoova-accent text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Filter by Difficulty</h3>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3].map((level) => (
                <button
                  key={level}
                  onClick={() => onDifficultyChange(selectedDifficulty === level ? null : level)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${
                    selectedDifficulty === level
                      ? 'bg-kidoova-accent text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>
          </div>

          {/* Completion Status Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Completion Status</h3>
            <button
              onClick={() => onCompletedChange(!showCompleted)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                !showCompleted
                  ? 'bg-kidoova-accent text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showCompleted ? 'Show All Challenges' : 'Show Incomplete Only'}
            </button>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  onClearFilters();
                  setIsFiltersExpanded(false);
                }}
                className="text-sm text-kidoova-accent hover:text-kidoova-accent/80"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 