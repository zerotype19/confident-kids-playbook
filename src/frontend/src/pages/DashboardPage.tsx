import React, { useState, useEffect } from 'react';
import TodayChallengeCards from '../components/dashboard/TodayChallengeCards';
import RewardsOverview from '../components/rewards/RewardsOverview';
import ProgressTracker from '../components/rewards/ProgressTracker';
import { Child, ProgressSummary } from '../types';
import CustomButton from '../components/CustomButton';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { useAuth } from '../contexts/AuthContext';
import WeeklyTheme from '../components/WeeklyTheme';
import ConfidenceTrendChart from '../components/ConfidenceTrendChart';
import { ConfidenceData } from '../utils/confidenceTrend';
import TraitScoreboard from '../components/dashboard/TraitScoreboard';

export default function DashboardPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const { isAuthenticated, token } = useAuth();
  const [children, setChildren] = useState<Child[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [trendData, setTrendData] = useState<ConfidenceData[]>([]);
  const [trendSummary, setTrendSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  console.log('DashboardPage render:', { isAuthenticated, token, selectedChild, isLoading, error });

  useEffect(() => {
    if (!isAuthenticated) {
      console.log('Not authenticated, redirecting to home');
      navigate('/');
      return;
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        console.log('Fetching children...');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/children`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Children response status:', response.status);

        if (!response.ok) {
          throw new Error(`Failed to fetch children: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Children data:', data);

        if (!data.success) {
          throw new Error('API response indicated failure');
        }
        if (!Array.isArray(data.children)) {
          throw new Error('Invalid response format: children is not an array');
        }
        setChildren(data.children);
        
        // Auto-select first child if only one exists
        if (data.children.length === 1 && !selectedChild) {
          console.log('Auto-selecting first child:', data.children[0]);
          setSelectedChild(data.children[0]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError(err instanceof Error ? err.message : 'Failed to load children');
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, [setSelectedChild, selectedChild, token]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedChild) {
        console.log('No selected child, skipping data fetch');
        setIsLoading(false);
        return;
      }

      console.log('Fetching dashboard data for child:', selectedChild.id);
      setIsLoading(true);
      setError(null);

      try {
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

        console.log('Challenge response status:', challengeResponse.status);

        if (!challengeResponse.ok) {
          throw new Error(`Failed to fetch challenge: ${challengeResponse.status} ${challengeResponse.statusText}`);
        }

        const challengeData = await challengeResponse.json();
        console.log('Challenge data:', challengeData);
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

        console.log('Rewards response status:', rewardsResponse.status);

        if (!rewardsResponse.ok) {
          throw new Error(`Failed to fetch rewards: ${rewardsResponse.status} ${rewardsResponse.statusText}`);
        }

        const rewardsData = await rewardsResponse.json();
        console.log('Rewards data:', rewardsData);
        
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
        console.error('Error fetching dashboard data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        console.log('Setting isLoading to false');
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedChild, token]);

  useEffect(() => {
    const fetchConfidenceTrend = async () => {
      if (!selectedChild?.id || !token) return;

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/confidence-trend?childId=${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch confidence trend');
        }

        const { data, summary } = await response.json();
        setTrendData(data);
        setTrendSummary(summary);
      } catch (error) {
        console.error('Error fetching confidence trend:', error);
      }
    };

    fetchConfidenceTrend();
  }, [selectedChild?.id, token]);

  const handleChallengeComplete = () => {
    // Refresh the data after challenge completion
    if (selectedChild) {
      const fetchData = async () => {
        try {
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

  console.log('DashboardPage render state:', { isLoading, error, selectedChild, children });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kidoova-accent mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Error loading dashboard</p>
          <p className="text-sm mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-heading text-gray-900">
            {selectedChild ? `${selectedChild.name}'s Dashboard` : 'Dashboard'}
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TraitScoreboard />
          {selectedChild ? (
            <>
              <WeeklyTheme />
              <TodayChallengeCards 
                childId={selectedChild.id} 
                challenge={challenge}
                onComplete={handleChallengeComplete}
              />
              {trendData.length > 0 && (
                <ConfidenceTrendChart data={trendData} summary={trendSummary} />
              )}
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-8">
                  <RewardsOverview progress={progress} />
                  <ProgressTracker progress={progress} childId={selectedChild.id} />
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Please select a child to view their dashboard</p>
              <CustomButton onClick={() => navigate('/manage-children')}>
                Manage Children
              </CustomButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 