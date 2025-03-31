import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import PageWrapper from '../components/PageWrapper';
import ChallengeCard from '../components/challenges/ChallengeCard';
import ChallengeFilters from '../components/challenges/ChallengeFilters';
import ChildSelector from '../components/dashboard/ChildSelector';
import { Child } from '../types';

export default function AllChallengesPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPillar, setSelectedPillar] = useState<number | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | null>(null);

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
        setChildren(data);
        
        // Auto-select first child if only one exists
        if (data.length === 1) {
          setSelectedChild(data[0]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children');
      }
    };

    fetchChildren();
  }, []);

  // Fetch challenges when selected child changes
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
      } catch (err) {
        console.error('Error fetching challenges:', err);
        setError('Failed to load challenges');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [selectedChild]);

  const filteredChallenges = challenges.filter(challenge => {
    if (selectedPillar && challenge.pillar_id !== selectedPillar) return false;
    if (selectedDifficulty && challenge.difficulty_level !== selectedDifficulty) return false;
    return true;
  });

  return (
    <Layout>
      <PageWrapper>
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-kidoova p-6">
            <h1 className="text-2xl font-bold text-kidoova-green mb-6">All Challenges</h1>
            
            <ChildSelector
              children={children}
              selectedChild={selectedChild}
              onSelectChild={setSelectedChild}
            />

            {selectedChild && (
              <div className="mt-6">
                <ChallengeFilters
                  selectedPillar={selectedPillar}
                  onPillarChange={setSelectedPillar}
                  selectedDifficulty={selectedDifficulty}
                  onDifficultyChange={setSelectedDifficulty}
                />

                {isLoading ? (
                  <div className="text-center py-8">Loading challenges...</div>
                ) : error ? (
                  <div className="text-red-500 text-center py-8">{error}</div>
                ) : filteredChallenges.length === 0 ? (
                  <div className="text-center py-8">No challenges found matching your filters.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
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
            )}
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
} 