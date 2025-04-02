import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChildContext } from '../contexts/ChildContext';
import { Reward, ProgressSummary } from '../types';
import RewardsOverview from '../components/rewards/RewardsOverview';
import TrophyCase from '../components/rewards/TrophyCase';
import ProgressTracker from '../components/rewards/ProgressTracker';
import ChildSelector from '../components/dashboard/ChildSelector';

export default function RewardsPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const [children, setChildren] = useState<any[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        if (data.length === 1 && !selectedChild) {
          setSelectedChild(data[0]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children');
      }
    };

    fetchChildren();
  }, [setSelectedChild, selectedChild]);

  // Fetch rewards and progress when selected child changes
  useEffect(() => {
    const fetchRewardsAndProgress = async () => {
      if (!selectedChild) return;

      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/rewards/${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch rewards and progress');
        }

        const data = await response.json();
        setRewards(data.rewards || []);
        setProgress({
          milestones_completed: data.progress.total_challenges,
          current_streak: data.progress.current_streak,
          longest_streak: data.progress.longest_streak,
          pillar_progress: data.progress.pillar_progress.reduce((acc: any, pillar: any) => {
            acc[pillar.pillar_id] = {
              completed: pillar.completed || 0,
              total: pillar.total || 0,
              percentage: pillar.total > 0 ? (pillar.completed / pillar.total) * 100 : 0
            };
            return acc;
          }, {}),
          milestone_progress: data.progress.milestone_progress
        });
      } catch (err) {
        console.error('Error fetching rewards:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchRewardsAndProgress();
  }, [selectedChild]);

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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-heading text-gray-900">Your Rewards</h1>
        <ChildSelector children={children} />
      </div>

      {selectedChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <RewardsOverview progress={progress} />
            <ProgressTracker progress={progress} childId={selectedChild.id} />
          </div>
          <div>
            <TrophyCase rewards={rewards} />
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please select a child to view their rewards</p>
        </div>
      )}
    </div>
  );
} 