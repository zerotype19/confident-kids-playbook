import React, { useEffect, useState } from 'react';
import { useFeatureFlags } from '../../hooks/useFeatureFlags';

interface Challenge {
  id: string;
  title: string;
  description: string;
  age_range: string;
  is_completed: boolean;
}

interface DailyChallengeCardProps {
  childId: string;
}

export default function DailyChallengeCard({ childId }: DailyChallengeCardProps): JSX.Element {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFeatureEnabled } = useFeatureFlags();
  const isPremium = isFeatureEnabled('premium.dashboard_insights');

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/challenges/today?child_id=${childId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch challenge');
        }

        const data = await response.json();
        setChallenge(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch challenge');
      } finally {
        setLoading(false);
      }
    };

    fetchChallenge();
  }, [childId]);

  const handleComplete = async () => {
    if (!challenge || !isPremium) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/challenges/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challenge_id: challenge.id,
          child_id: childId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to complete challenge');
      }

      setChallenge(prev => prev ? { ...prev, is_completed: true } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete challenge');
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-600">Loading challenge...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!challenge) {
    return <div className="text-sm text-gray-600">No challenge available for today</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Daily Challenge</h2>
      
      <div className="space-y-3">
        <div className="font-medium">{challenge.title}</div>
        <div className="text-sm text-gray-600">{challenge.description}</div>
        <div className="text-sm text-gray-500">Age range: {challenge.age_range}</div>
      </div>

      {isPremium && !challenge.is_completed && (
        <div className="space-y-3">
          <button
            onClick={handleComplete}
            className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm w-full"
          >
            Mark Complete
          </button>
        </div>
      )}

      {challenge.is_completed && (
        <div className="text-sm text-green-600">Challenge completed for today</div>
      )}
    </div>
  );
} 