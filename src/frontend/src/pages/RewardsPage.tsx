import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChildContext } from '../contexts/ChildContext';
import { Reward, ProgressSummary } from '../types';
import RewardsOverview from '../components/rewards/RewardsOverview';
import { TrophyCase } from '../components/rewards/TrophyCase';
import ProgressTracker from '../components/rewards/ProgressTracker';
import ConfidenceStar from '../components/rewards/ConfidenceStar';
import CustomButton from '../components/CustomButton';
import { useNavigate } from 'react-router-dom';
import RPGTraitPanel from '../components/dashboard/RPGTraitPanel';

export default function RewardsPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const [children, setChildren] = useState<any[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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
        
        // Ensure pillar_progress is an object
        const pillarProgress = data.progress.pillar_progress || {};
        
        setProgress({
          milestones_completed: data.progress.total_challenges,
          current_streak: data.progress.current_streak,
          longest_streak: data.progress.longest_streak,
          weekly_challenges: data.progress.weekly_challenges,
          pillar_progress: pillarProgress,
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
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-heading text-gray-900">
            {selectedChild ? `${selectedChild.name}'s Rewards` : 'Rewards'}
          </h1>
        </div>

        {selectedChild ? (
          <>
            <RPGTraitPanel progress={progress} rewards={rewards} />
            <ConfidenceStar 
              progress={progress}
              childId={selectedChild.id}
              childName={selectedChild.name}
            />

            <RewardsOverview 
              progress={progress}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TrophyCase 
                rewards={rewards}
              />
              <div className="space-y-6">
                <ProgressTracker 
                  progress={progress}
                  childId={selectedChild.id}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please select a child to view their rewards</p>
            <CustomButton onClick={() => navigate('/manage-children')}>
              Manage Children
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
} 