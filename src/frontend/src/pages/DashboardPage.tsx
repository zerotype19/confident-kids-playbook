import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Child, Challenge, ProgressSummary, FeatureFlags } from '../../../types';
import { useChildContext } from '../contexts/ChildContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { ProgressSummaryCard } from '../components/ProgressSummaryCard';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { selectedChild, setSelectedChild } = useChildContext();
  const flags = useFeatureFlags();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!selectedChild) {
        setError('No child selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        // Fetch daily challenge
        const challengeResponse = await fetch(`/api/challenges/today?child_id=${selectedChild.id}`);
        if (!challengeResponse.ok) throw new Error('Failed to fetch daily challenge');
        const challengeData = await challengeResponse.json();
        setChallenge(challengeData);

        // Fetch progress summary
        const progressResponse = await fetch(`/api/progress/summary?child_id=${selectedChild.id}`);
        if (!progressResponse.ok) throw new Error('Failed to fetch progress summary');
        const progressData = await progressResponse.json();
        setProgress(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [selectedChild]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!selectedChild || !challenge || !progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">No data available</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Child Header */}
      <div className="flex items-center mb-6">
        <img 
          src={selectedChild.avatar_url || 'https://placeholder.com/150'} 
          alt={selectedChild.name}
          className="w-12 h-12 rounded-full mr-3"
        />
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {selectedChild.name}!
        </h1>
      </div>

      {/* Daily Challenge Card */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center mb-4">
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            {challenge.pillar}
          </span>
        </div>
        <h2 className="text-xl font-semibold mb-2">{challenge.title}</h2>
        <p className="text-gray-600 mb-4">{challenge.description}</p>
        <div className="flex justify-between items-center">
          {!challenge.is_completed ? (
            <button
              onClick={() => navigate(`/challenge/${challenge.id}`)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
            >
              Start Challenge
            </button>
          ) : (
            <div className="text-green-600 font-medium">
              ✅ Challenge Completed
            </div>
          )}
          <button
            onClick={() => navigate('/challenges')}
            className="text-indigo-600 hover:text-indigo-700"
          >
            View All Challenges
          </button>
        </div>
      </div>

      {/* Progress Summary */}
      <ProgressSummaryCard progress={progress} showBadges={false} />
    </div>
  );
}; 