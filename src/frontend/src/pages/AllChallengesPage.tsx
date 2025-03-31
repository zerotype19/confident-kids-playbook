import React, { useState, useEffect } from 'react';
import { useChildContext } from '../contexts/ChildContext';
import Layout from '../components/Layout';
import { PageWrapper } from '../components/PageWrapper';
import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeFilters from '../components/challenges/ChallengeFilters';
import { Challenge } from '../types';

export default function AllChallengesPage() {
  const { selectedChild } = useChildContext();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      if (!selectedChild) return;

      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/challenges/all?childId=${selectedChild.id}`,
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
        setChallenges(data.challenges);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load challenges');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [selectedChild]);

  const filteredChallenges = challenges.filter(challenge => {
    if (selectedPillar && challenge.pillar_id !== selectedPillar) return false;
    if (selectedDifficulty && challenge.difficulty_level !== selectedDifficulty) return false;
    return true;
  });

  if (!selectedChild) {
    return (
      <Layout>
        <PageWrapper>
          <div className="text-center text-gray-600">
            Please select a child to view their challenges
          </div>
        </PageWrapper>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageWrapper>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-kidoova-green">
              All Challenges for {selectedChild.name}
            </h1>
            <p className="mt-2 text-gray-600">
              Explore and complete challenges to help your child grow
            </p>
          </div>

          <ChallengeFilters
            selectedPillar={selectedPillar}
            onPillarChange={setSelectedPillar}
            selectedDifficulty={selectedDifficulty}
            onDifficultyChange={setSelectedDifficulty}
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{error}</p>
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No challenges found matching your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  childId={selectedChild.id}
                />
              ))}
            </div>
          )}
        </div>
      </PageWrapper>
    </Layout>
  );
} 