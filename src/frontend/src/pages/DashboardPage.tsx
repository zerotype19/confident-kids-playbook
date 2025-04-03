import React, { useState, useEffect } from 'react';
import ChildSelector from '../components/dashboard/ChildSelector';
import TodayChallengeCard from '../components/dashboard/TodayChallengeCard';
import RewardsOverview from '../components/rewards/RewardsOverview';
import ProgressTracker from '../components/rewards/ProgressTracker';
import { Child, ProgressSummary } from '../types';
import CustomButton from '../components/CustomButton';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';

export default function DashboardPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const [children, setChildren] = useState<Child[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedChild) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch today's challenge
        const challengeResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/challenge?childId=${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!challengeResponse.ok) {
          throw new Error('Failed to fetch challenge');
        }

        const challengeData = await challengeResponse.json();
        setChallenge(challengeData.challenge);

        // Fetch rewards and progress
        const rewardsResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/rewards/${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!rewardsResponse.ok) {
          throw new Error('Failed to fetch rewards and progress');
        }

        const rewardsData = await rewardsResponse.json();
        
        // Ensure pillar_progress is an object
        const pillarProgress = rewardsData.progress.pillar_progress || {};
        
        setProgress({
          milestones_completed: rewardsData.progress.total_challenges,
          current_streak: rewardsData.progress.current_streak,
          longest_streak: rewardsData.progress.longest_streak,
          weekly_challenges: rewardsData.progress.weekly_challenges,
          pillar_progress: pillarProgress,
          milestone_progress: rewardsData.progress.milestone_progress
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedChild]);

  const handleChallengeComplete = () => {
    // Refresh the data after challenge completion
    if (selectedChild) {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          // Fetch updated rewards and progress
          const rewardsResponse = await fetch(
            `${import.meta.env.VITE_API_URL}/api/rewards/${selectedChild.id}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (rewardsResponse.ok) {
            const rewardsData = await rewardsResponse.json();
            const pillarProgress = rewardsData.progress.pillar_progress || {};
            
            setProgress({
              milestones_completed: rewardsData.progress.total_challenges,
              current_streak: rewardsData.progress.current_streak,
              longest_streak: rewardsData.progress.longest_streak,
              weekly_challenges: rewardsData.progress.weekly_challenges,
              pillar_progress: pillarProgress,
              milestone_progress: rewardsData.progress.milestone_progress
            });
          }
        } catch (err) {
          console.error('Error refreshing data:', err);
        }
      };

      fetchData();
    }
  };

  if (isLoading) {
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
          <p className="text-lg font-medium">Error loading dashboard</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-heading text-gray-900">Dashboard</h1>
        <ChildSelector children={children} />
      </div>

      {selectedChild ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <RewardsOverview progress={progress} />
            <ProgressTracker progress={progress} childId={selectedChild.id} />
          </div>
          <div className="space-y-8">
            <TodayChallengeCard 
              childId={selectedChild.id} 
              challenge={challenge}
              onComplete={handleChallengeComplete}
            />
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Please select a child to view their dashboard</p>
          <CustomButton onClick={() => navigate('/manage-children')}>
            Manage Children
          </CustomButton>
        </div>
      )}
    </div>
  );
} 