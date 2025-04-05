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

export default function AllChallengesPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const [children, setChildren] = useState<Child[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengeGroups, setChallengeGroups] = useState<ChallengeGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ChallengeFilters>({
    pillarId: null,
    difficulty: null,
    title: null,
    showCompleted: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  const challengesPerPage = 12;
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
        setChallenges(data);

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

  // Filter challenges based on selected filters
  const filteredChallenges = challenges.filter(challenge => {
    if (filters.pillarId && challenge.pillar_id !== filters.pillarId) return false;
    if (filters.difficulty && challenge.difficulty_level !== filters.difficulty) return false;
    if (filters.title && challenge.title !== filters.title) return false;
    if (!filters.showCompleted && challenge.is_completed) return false;
    return true;
  });

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
    setCurrentPage(1);
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

      console.log('Attempting to complete challenge:', {
        challengeId,
        childId: selectedChild.id
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/challenge-log`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            challenge_id: challengeId,
            child_id: selectedChild.id
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Challenge completion failed:', data);
        // If the challenge is already completed, update the UI to reflect this
        if (data.error === 'Challenge already completed') {
          setChallenges(prevChallenges => 
            prevChallenges.map(challenge => 
              challenge.id === challengeId 
                ? { ...challenge, is_completed: 1 }
                : challenge
            )
          );
          return;
        }
        throw new Error(data.error || 'Failed to mark challenge as complete');
      }

      console.log('Challenge completed successfully:', data);

      // Refetch challenges to get updated data
      const challengesResponse = await fetch(
        `${import.meta.env.VITE_API_URL}/api/challenges/all?child_id=${selectedChild.id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!challengesResponse.ok) {
        throw new Error('Failed to fetch updated challenges');
      }

      const updatedChallenges = await challengesResponse.json();
      setChallenges(updatedChallenges);

      // Update challenge groups with the new data
      const groups = updatedChallenges.reduce((acc: ChallengeGroup[], challenge: Challenge) => {
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
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Pillar Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pillar
                  </label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                    value={filters.pillarId || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      pillarId: e.target.value ? Number(e.target.value) : null,
                      title: null // Reset title when pillar changes
                    }))}
                  >
                    <option value="">All Pillars</option>
                    {pillarIds.map((id) => (
                      <option key={id} value={id}>
                        {PILLAR_NAMES[id]}
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
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                    value={filters.difficulty || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      difficulty: e.target.value ? Number(e.target.value) : null,
                      title: null // Reset title when difficulty changes
                    }))}
                  >
                    <option value="">All Difficulties</option>
                    {difficulties.map((level) => (
                      <option key={level} value={level}>
                        Level {level}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Title Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Challenge Type
                  </label>
                  <select
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-kidoova-accent focus:ring-kidoova-accent"
                    value={filters.title || ''}
                    onChange={(e) => setFilters(prev => ({
                      ...prev,
                      title: e.target.value || null
                    }))}
                  >
                    <option value="">All Types</option>
                    {availableTitles.map((title) => (
                      <option key={title} value={title}>
                        {title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Show Completed Filter */}
                <div className="flex items-end">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-kidoova-accent focus:ring-kidoova-accent"
                      checked={filters.showCompleted}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        showCompleted: e.target.checked
                      }))}
                    />
                    <span className="text-sm text-gray-700">Show Completed</span>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  childId={selectedChild.id}
                />
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