import React, { useState, useEffect } from 'react';
import ChildSelector from '../components/dashboard/ChildSelector';
import NotesSection from '../components/dashboard/NotesSection';
import ProgressSummary from '../components/dashboard/ProgressSummary';
import TodayChallengeCard from '../components/dashboard/TodayChallengeCard';
import { Child } from '../types';
import PageWrapper from '../components/PageWrapper';
import CustomButton from '../components/CustomButton';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
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
        setChildren(data);
        
        // Auto-select first child if only one exists
        if (data.length === 1) {
          setSelectedChild(data[0]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children');
      }
    };

    fetchChildren();
  }, []);

  useEffect(() => {
    const fetchChallenge = async () => {
      if (!selectedChild) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/challenge?childId=${selectedChild.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch challenge');
        }

        const data = await response.json();
        setChallenge(data.challenge);
      } catch (err) {
        console.error('Error fetching challenge:', err);
        setError('Failed to load today\'s challenge');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenge();
  }, [selectedChild]);

  const handleChallengeComplete = () => {
    // Optionally refresh the challenge or update UI
    console.log('Challenge completed!');
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-heading">Dashboard</h1>
          <ChildSelector
            children={children}
            selectedChild={selectedChild}
            onSelectChild={setSelectedChild}
          />
        </div>

        {selectedChild ? (
          <>
            <ProgressSummary childId={selectedChild.id} />
            <TodayChallengeCard childId={selectedChild.id} challenge={challenge} />
            <NotesSection childId={selectedChild.id} />
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
    </PageWrapper>
  );
} 