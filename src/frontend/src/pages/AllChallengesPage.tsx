import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChallengeCard from '../components/challenges/ChallengeCard';
import { Child, Challenge, PILLAR_NAMES } from '../types';
import { useChildContext } from '../contexts/ChildContext';
import Icon from '../components/common/Icon';
import CustomButton from '../components/CustomButton';

interface ChallengeGroup {
  pillar_id: number;
  difficulty_level: number;
  titles: string[];
}

interface ChallengeFilters {
  pillarId: number | null;
  difficulty: number | null;
  title: string | null;
  showCompleted: boolean;
}

interface DisplayedChallenge extends Challenge {
  isExpanded?: boolean;
}

export default function AllChallengesPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const [children, setChildren] = useState<Child[]>([]);
  const [allChallenges, setAllChallenges] = useState<Challenge[]>([]);
  const [displayedChallenges, setDisplayedChallenges] = useState<DisplayedChallenge[]>([]);
  const [challengeGroups, setChallengeGroups] = useState<ChallengeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ChallengeFilters>({
    pillarId: null,
    difficulty: null,
    title: null,
    showCompleted: false
  });
  const navigate = useNavigate();

  // Get pillar from URL query parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pillarId = urlParams.get('pillar');
    if (pillarId) {
      setFilters(prev => ({
        ...prev,
        pillarId: Number(pillarId)
      }));
    }
  }, []);

  // Fetch children on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/children`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch children');
        }

        const data = await response.json();
        if (!data.success) {
          throw new Error('API response indicated failure');
        }
        if (!Array.isArray(data.children)) {
          throw new Error('Invalid response format: children is not an array');
        }
        setChildren(data.children);
        
        // Auto-select first child if only one exists
        if (data.children.length === 1 && !selectedChild) {
          setSelectedChild(data.children[0]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children');
      }
    };

    fetchChildren();
  }, [setSelectedChild, selectedChild]);

  // Fetch challenges and group them by pillar and difficulty
  useEffect(() => {
    const fetchChallenges = async () => {
      if (!selectedChild) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/challenges/all?child_id=${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch challenges');
        }

        const data = await response.json();
        setAllChallenges(data);

        // Group challenges by pillar and difficulty
        const groups = data.reduce((acc: ChallengeGroup[], challenge: Challenge) => {
          const existingGroup = acc.find(
            group => group.pillar_id === challenge.pillar_id && group.difficulty_level === challenge.difficulty_level
          );

          if (existingGroup) {
            if (!existingGroup.titles.includes(challenge.title)) {
              existingGroup.titles.push(challenge.title);
            }
          } else {
            acc.push({
              pillar_id: challenge.pillar_id,
              difficulty_level: challenge.difficulty_level,
              titles: [challenge.title]
            });
          }

          return acc;
        }, []);

        setChallengeGroups(groups);
      } catch (err) {
        console.error('Error fetching challenges:', err);
        setError('Failed to load challenges');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [selectedChild]);

  // Filter challenges based on selected filters and select random ones
  useEffect(() => {
    if (allChallenges.length === 0) return;

    const filtered = allChallenges.filter(challenge => {
      if (filters.pillarId && challenge.pillar_id !== filters.pillarId) return false;
      if (filters.difficulty && challenge.difficulty_level !== filters.difficulty) return false;
      if (filters.title && challenge.title !== filters.title) return false;
      if (!filters.showCompleted && challenge.is_completed) return false;
      return true;
    });

    // Shuffle array and take first 9
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setDisplayedChallenges(shuffled.slice(0, 9));
  }, [allChallenges, filters]);

  // Get unique difficulties from challenge groups
  const difficulties = Array.from(new Set(challengeGroups.map(group => group.difficulty_level))).sort();

  // Get unique pillar IDs from challenge groups
  const pillarIds = Array.from(new Set(challengeGroups.map(group => group.pillar_id)));

  // Get titles for selected pillar and difficulty
  const availableTitles = challengeGroups
    .find(group => 
      group.pillar_id === filters.pillarId && 
      group.difficulty_level === filters.difficulty
    )?.titles || [];

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      pillarId: null,
      difficulty: null,
      title: null,
      showCompleted: false
    });
  };

  // Handle challenge completion
  const handleChallengeComplete = async (challengeId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!selectedChild?.id) {
        throw new Error('No child selected');
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/challenge-log`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            child_id: selectedChild.id,
            challenge_id: challengeId
          })
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to complete challenge');
      }

      // Refresh challenges after successful completion
      const fetchChallenges = async () => {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/challenges/all?child_id=${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch challenges');
        }

        const data = await response.json();
        setAllChallenges(data);

        // Group challenges by pillar and difficulty
        const groups = data.reduce((acc: ChallengeGroup[], challenge: Challenge) => {
          const existingGroup = acc.find(
            group => group.pillar_id === challenge.pillar_id && group.difficulty_level === challenge.difficulty_level
          );

          if (existingGroup) {
            if (!existingGroup.titles.includes(challenge.title)) {
              existingGroup.titles.push(challenge.title);
            }
          } else {
            acc.push({
              pillar_id: challenge.pillar_id,
              difficulty_level: challenge.difficulty_level,
              titles: [challenge.title]
            });
          }

          return acc;
        }, []);

        setChallengeGroups(groups);
      };

      await fetchChallenges();
    } catch (err) {
      console.error('Error completing challenge:', err);
      throw err;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kidoova-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Error loading challenges</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-heading text-gray-900">All Challenges</h1>
        </div>

        {selectedChild ? (
          <>
            {/* Filter Options */}
            <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Pillar Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pillar
                  </label>
                  <select
                    value={filters.pillarId || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      pillarId: e.target.value ? Number(e.target.value) : null,
                      title: null // Reset title when pillar changes
                    }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                  >
                    <option value="">All Pillars</option>
                    {pillarIds.map((id) => (
                      <option key={id} value={id}>
                        {PILLAR_NAMES[id as keyof typeof PILLAR_NAMES]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Difficulty
                  </label>
                  <select
                    value={filters.difficulty || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      difficulty: e.target.value ? Number(e.target.value) : null,
                      title: null // Reset title when difficulty changes
                    }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                  >
                    <option value="">All Difficulties</option>
                    {difficulties.map((level) => (
                      <option key={level} value={level}>
                        {level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Challenge Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Challenge Type
                  </label>
                  <select
                    value={filters.title || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      title: e.target.value || null
                    }))}
                    className="w-full rounded-lg border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                    disabled={!filters.pillarId || !filters.difficulty}
                  >
                    <option value="">All Types</option>
                    {availableTitles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show Completed Toggle */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showCompleted"
                    checked={filters.showCompleted}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      showCompleted: e.target.checked
                    }))}
                    className="h-4 w-4 text-kidoova-accent focus:ring-kidoova-accent border-gray-300 rounded"
                  />
                  <label htmlFor="showCompleted" className="ml-2 block text-sm text-gray-700">
                    Show Completed
                  </label>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Challenges Grid */}
            <div className="space-y-4">
              {displayedChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  className="bg-white rounded-xl shadow-xl overflow-hidden"
                >
                  {/* Challenge Header */}
                  <div 
                    className="p-6 flex items-center justify-between cursor-pointer"
                    onClick={() => {
                      setDisplayedChallenges(prev => prev.map(c => 
                        c.id === challenge.id ? { ...c, isExpanded: !c.isExpanded } : c
                      ));
                    }}
                  >
                    <div className="flex items-center gap-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        challenge.difficulty_level === 1 
                          ? 'bg-green-100 text-green-800'
                          : challenge.difficulty_level === 2
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {challenge.difficulty_level === 1 ? 'Easy' : challenge.difficulty_level === 2 ? 'Medium' : 'Hard'}
                      </span>
                      <h2 className="text-xl font-heading text-kidoova-green">{challenge.title}</h2>
                    </div>
                    <Icon 
                      name={challenge.isExpanded ? "chevron-up" : "chevron-down"} 
                      className="w-5 h-5 text-gray-400"
                    />
                  </div>

                  {/* Expanded Content */}
                  {challenge.isExpanded && (
                    <div className="px-6 pb-6 space-y-6">
                      {/* Description */}
                      {challenge.description && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                          <p className="text-gray-600 leading-relaxed">{challenge.description}</p>
                        </div>
                      )}

                      {/* Goal */}
                      {challenge.goal && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Goal</h3>
                          <p className="text-gray-600 leading-relaxed">{challenge.goal}</p>
                        </div>
                      )}

                      {/* Steps */}
                      {challenge.steps && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Steps</h3>
                          {(() => {
                            try {
                              // Parse steps if it's a string
                              const stepsArray = typeof challenge.steps === 'string' 
                                ? JSON.parse(challenge.steps)
                                : challenge.steps;

                              // Ensure we have an array
                              const steps = Array.isArray(stepsArray) ? stepsArray : [stepsArray];

                              return (
                                <div className="space-y-3">
                                  {steps.map((step, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-kidoova-green flex items-center justify-center">
                                        <span className="text-white font-medium">{index + 1}</span>
                                      </div>
                                      <p className="text-gray-600 leading-relaxed">{step}</p>
                                    </div>
                                  ))}
                                </div>
                              );
                            } catch (error) {
                              // Fallback if JSON parsing fails
                              return (
                                <div className="bg-white rounded-md p-4 border border-gray-200">
                                  <pre className="text-gray-600 whitespace-pre-wrap font-sans">
                                    {typeof challenge.steps === 'string' 
                                      ? challenge.steps.split('\n').map((line, i) => (
                                          <div key={i} className="mb-1">{line}</div>
                                        ))
                                      : JSON.stringify(challenge.steps, null, 2)
                                    }
                                  </pre>
                                </div>
                              );
                            }
                          })()}
                        </div>
                      )}

                      {/* Example Dialogue */}
                      {challenge.example_dialogue && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Example Dialogue</h3>
                          <div className="bg-white rounded-md p-4 border border-gray-200">
                            <pre className="text-gray-600 whitespace-pre-wrap font-sans">
                              {challenge.example_dialogue.split('\n').map((line, i) => (
                                <div key={i} className="mb-1">{line}</div>
                              ))}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Tip */}
                      {challenge.tip && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Tip</h3>
                          <p className="text-gray-600 leading-relaxed">{challenge.tip}</p>
                        </div>
                      )}

                      {/* Complete Button */}
                      {!challenge.is_completed && (
                        <div className="pt-4 border-t border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChallengeComplete(challenge.id);
                            }}
                            className="w-full px-4 py-3 rounded-lg text-sm font-medium text-white bg-kidoova-accent hover:bg-kidoova-accent-dark transition-colors duration-200"
                          >
                            Mark Complete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please select a child to view their challenges</p>
            <CustomButton onClick={() => navigate('/manage-children')}>
              Manage Children
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
} 