import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { Pillar, Challenge } from '../types';
import ChallengeCard from '../components/challenges/ChallengeCard';

export default function PillarDetailPage() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const { selectedChild } = useChildContext();
  const [pillar, setPillar] = useState<Pillar | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPillarData = async () => {
      if (!pillarId || !selectedChild) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch pillar details
        const pillarResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars/${pillarId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!pillarResponse.ok) {
          throw new Error('Failed to fetch pillar details');
        }

        const pillarData = await pillarResponse.json();
        console.log('Pillar data:', pillarData);
        setPillar(pillarData);

        // Fetch pillar progress
        const progressResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars/${pillarId}/progress?child_id=${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!progressResponse.ok) {
          throw new Error('Failed to fetch pillar progress');
        }

        const { progress } = await progressResponse.json();
        console.log('Progress data:', progress);
        setProgress(progress);

        // Fetch pillar challenges
        const challengesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars/${pillarId}/challenges?child_id=${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!challengesResponse.ok) {
          throw new Error('Failed to fetch pillar challenges');
        }

        const challengesData = await challengesResponse.json();
        console.log('Challenges data type:', typeof challengesData);
        console.log('Is challenges data an array?', Array.isArray(challengesData));
        console.log('Challenges data:', challengesData);
        
        // Ensure challenges is an array before setting state
        if (!Array.isArray(challengesData)) {
          console.error('Challenges data is not an array:', challengesData);
          throw new Error('Invalid challenges data format');
        }
        
        setChallenges(challengesData);
      } catch (err) {
        console.error('Error fetching pillar data:', err);
        setError('Failed to load pillar data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPillarData();
  }, [pillarId, selectedChild]);

  if (!selectedChild) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please select a child to view pillar details</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading pillar details...</div>;
  }

  if (error || !pillar) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Pillar not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <span className="text-4xl">{pillar.icon}</span>
          <div>
            <h1 className="text-2xl font-heading text-gray-900">{pillar.name}</h1>
            <p className="text-gray-600 mt-2">{pillar.description}</p>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ 
                width: `${progress}%`,
                backgroundColor: pillar.color
              }}
            />
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-heading text-gray-900 mb-4">Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              childId={selectedChild.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 