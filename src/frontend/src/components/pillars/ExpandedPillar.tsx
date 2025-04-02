import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pillar, Challenge } from '../../types';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

interface ExpandedPillarProps {
  pillar: Pillar;
  childId: string;
}

export default function ExpandedPillar({ pillar, childId }: ExpandedPillarProps) {
  const navigate = useNavigate();
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch challenges
        const challengesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars/${pillar.id}/challenges?child_id=${childId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!challengesResponse.ok) {
          throw new Error('Failed to fetch challenges');
        }

        const challengesData = await challengesResponse.json();
        setChallenges(challengesData);

        // Fetch progress
        const progressResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars/${pillar.id}/progress?child_id=${childId}`,
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
        setProgress(progress);
      } catch (err) {
        console.error('Error fetching pillar data:', err);
        setError('Failed to load pillar data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pillar.id, childId]);

  const handleViewAll = () => {
    navigate(`/all-challenges?pillar=${pillar.id}`);
  };

  // Get unique challenge types
  const uniqueChallenges = challenges.reduce((acc: Challenge[], challenge) => {
    if (!acc.find(c => c.title === challenge.title)) {
      acc.push(challenge);
    }
    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-start gap-4 hover:bg-gray-50 transition-colors"
      >
        <span className="text-4xl">{pillar.icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-gray-900">{pillar.name}</h2>
            {isExpanded ? (
              <ChevronUpIcon className="w-6 h-6 text-gray-500" />
            ) : (
              <ChevronDownIcon className="w-6 h-6 text-gray-500" />
            )}
          </div>
          <p className="text-gray-600 mt-1">{pillar.description}</p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
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
      </button>

      {isExpanded && (
        <div className="border-t p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Challenge Types</h3>
          <div className="space-y-4">
            {uniqueChallenges.map((challenge) => (
              <div key={challenge.id} className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                <p className="text-gray-600 mt-1">{challenge.description}</p>
                <p className="text-sm text-gray-500 mt-2">Goal: {challenge.goal}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleViewAll}
            className="mt-6 w-full bg-kidoova-accent text-white py-2 px-4 rounded-lg hover:bg-kidoova-accent/90 transition-colors"
          >
            View All Challenges
          </button>
        </div>
      )}
    </div>
  );
} 