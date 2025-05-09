import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChallengeCard from '../components/challenges/ChallengeCard';
import { Child, Challenge, PILLAR_NAMES } from '../types';
import { useChildContext } from '../contexts/ChildContext';
import CustomButton from '../components/CustomButton';

interface WorkoutGroup {
  pillar_id: number;
  difficulty_level: number;
  titles: string[];
}

interface WorkoutFilters {
  pillarId: number | null;
  difficulty: number | null;
  title: string | null;
}

export default function AllWorkoutsPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const [children, setChildren] = useState<Child[]>([]);
  const [allWorkouts, setAllWorkouts] = useState<Challenge[]>([]);
  const [displayedWorkouts, setDisplayedWorkouts] = useState<Challenge[]>([]);
  const [workoutGroups, setWorkoutGroups] = useState<WorkoutGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<WorkoutFilters>({
    pillarId: null,
    difficulty: null,
    title: null
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

  // Fetch workouts and group them by pillar and difficulty
  useEffect(() => {
    const fetchWorkouts = async () => {
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
          throw new Error('Failed to fetch workouts');
        }

        const data = await response.json();
        setAllWorkouts(data);

        // Group workouts by pillar and difficulty
        const groups = data.reduce((acc: WorkoutGroup[], workout: Challenge) => {
          const existingGroup = acc.find(
            group => group.pillar_id === workout.pillar_id && group.difficulty_level === workout.difficulty_level
          );

          if (existingGroup) {
            if (!existingGroup.titles.includes(workout.title)) {
              existingGroup.titles.push(workout.title);
            }
          } else {
            acc.push({
              pillar_id: workout.pillar_id,
              difficulty_level: workout.difficulty_level,
              titles: [workout.title]
            });
          }

          return acc;
        }, []);

        setWorkoutGroups(groups);
      } catch (err) {
        console.error('Error fetching workouts:', err);
        setError('Failed to load workouts');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [selectedChild]);

  // Filter workouts based on selected filters and select random ones
  useEffect(() => {
    if (allWorkouts.length === 0) return;

    const filtered = allWorkouts.filter(workout => {
      if (filters.pillarId && workout.pillar_id !== filters.pillarId) return false;
      if (filters.difficulty && workout.difficulty_level !== filters.difficulty) return false;
      if (filters.title && workout.title !== filters.title) return false;
      return true;
    });

    // Shuffle array and take first 9
    const shuffled = [...filtered].sort(() => 0.5 - Math.random());
    setDisplayedWorkouts(shuffled.slice(0, 9));
  }, [allWorkouts, filters]);

  // Get unique difficulties from workout groups
  const difficulties = Array.from(new Set(workoutGroups.map(group => group.difficulty_level))).sort();

  // Get unique pillar IDs from workout groups
  const pillarIds = Array.from(new Set(workoutGroups.map(group => group.pillar_id)));

  // Get titles for selected pillar and difficulty
  const availableTitles = workoutGroups
    .find(group => 
      group.pillar_id === filters.pillarId && 
      group.difficulty_level === filters.difficulty
    )?.titles || [];

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      pillarId: null,
      difficulty: null,
      title: null
    });
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
          <p className="text-lg font-medium">Error loading workouts</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-heading text-gray-900">
            {selectedChild ? `${selectedChild.name}'s Workouts` : 'All Workouts'}
          </h1>
        </div>

        {selectedChild ? (
          <>
            {/* Filter Options */}
            <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

                {/* Workout Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Workout Type
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

            {/* Workouts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedWorkouts.map((workout) => (
                <ChallengeCard
                  key={workout.id}
                  challenge={workout}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please select a child to view their workouts</p>
            <CustomButton onClick={() => navigate('/manage-children')}>
              Manage Children
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
} 