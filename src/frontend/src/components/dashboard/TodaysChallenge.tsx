import React, { useEffect, useState } from 'react';
import { Challenge } from '../../types';

interface TodaysChallengeProps {
  childId: string;
}

export default function TodaysChallenge({ childId }: TodaysChallengeProps) {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/challenge?child_id=${childId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch challenge');
        }

        const data = await response.json();
        setChallenge(data.challenge);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch challenge');
      } finally {
        setLoading(false);
      }
    };

    if (childId) {
      fetchChallenge();
    }
  }, [childId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="text-gray-600 text-sm">No challenge available for today.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Today's Challenge</h2>
      <div>
        <h3 className="text-base font-bold text-blue-600">{challenge.title}</h3>
        <p className="text-sm text-gray-700 mt-1">{challenge.description}</p>
      </div>
      
      <div>
        <span className="font-medium text-gray-800">Goal:</span>
        <p className="text-sm text-gray-700 mt-1">{challenge.goal}</p>
      </div>

      <div>
        <span className="font-medium text-gray-800">Steps:</span>
        <ul className="list-disc list-inside text-sm text-gray-700 mt-1 space-y-1">
          {Array.isArray(challenge.steps) ? (
            challenge.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))
          ) : (
            <li>{challenge.steps}</li>
          )}
        </ul>
      </div>

      {challenge.example_dialogue && (
        <div>
          <span className="font-medium text-gray-800">Example:</span>
          <p className="italic text-sm text-gray-600 mt-1">"{challenge.example_dialogue}"</p>
        </div>
      )}

      {challenge.tip && (
        <div>
          <span className="font-medium text-gray-800">Tip:</span>
          <p className="text-sm text-gray-600 mt-1">{challenge.tip}</p>
        </div>
      )}
    </div>
  );
} 