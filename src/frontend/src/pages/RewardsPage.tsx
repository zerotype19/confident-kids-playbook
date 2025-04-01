import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Reward, ProgressSummary } from '../types';
import RewardsOverview from '../components/rewards/RewardsOverview';
import TrophyCase from '../components/rewards/TrophyCase';
import ProgressTracker from '../components/rewards/ProgressTracker';

export default function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRewardsAndProgress() {
      try {
        const response = await fetch(`/api/rewards?childId=${user?.uid}`);
        if (!response.ok) {
          throw new Error('Failed to fetch rewards and progress');
        }
        const data = await response.json();
        setRewards(data.rewards);
        setProgress(data.progress);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (user?.uid) {
      fetchRewardsAndProgress();
    }
  }, [user?.uid]);

  if (loading) {
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
          <p className="text-lg font-medium">Error loading rewards</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <h1 className="text-3xl font-heading text-gray-900">Your Rewards</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <RewardsOverview progress={progress} />
          <ProgressTracker progress={progress} childId={user?.uid || ''} />
        </div>
        <div>
          <TrophyCase rewards={rewards} />
        </div>
      </div>
    </div>
  );
} 