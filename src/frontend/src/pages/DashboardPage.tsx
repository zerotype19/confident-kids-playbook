import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ChildSelector from '../components/dashboard/ChildSelector';
import NavigationPanel from '../components/dashboard/NavigationPanel';
import NotesSection from '../components/dashboard/NotesSection';
import ProgressSummary from '../components/dashboard/ProgressSummary';
import TodayChallengeCard from '../components/dashboard/TodayChallengeCard';
import { Child } from '../types';
import { PageWrapper } from '../components/PageWrapper';
import CustomButton from '../components/CustomButton';

export default function DashboardPage() {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [children, setChildren] = useState<Child[]>([]);
  const [challenge, setChallenge] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <Layout>
      <PageWrapper>
        <div className="max-w-5xl mx-auto p-4 md:p-6 flex flex-col gap-6">
          <h1 className="text-2xl md:text-3xl font-bold text-kidoova-green mb-6 text-center md:text-left">
            Welcome back{selectedChild ? `, ${selectedChild.name}` : ''}!
          </h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <ChildSelector
                children={children}
                selectedChild={selectedChild}
                onSelectChild={setSelectedChild}
              />
              <NavigationPanel />
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {isLoading ? (
                <div className="bg-white rounded-2xl shadow-kidoova p-4 md:p-6 text-center">
                  <p className="text-gray-600">Loading today's challenge...</p>
                </div>
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-kidoova p-4 md:p-6 text-center">
                  <p className="text-red-600">{error}</p>
                </div>
              ) : challenge && selectedChild ? (
                <TodayChallengeCard 
                  challenge={challenge}
                  childId={selectedChild.id}
                  onComplete={handleChallengeComplete}
                />
              ) : null}

              {selectedChild?.id && (
                <>
                  <NotesSection childId={selectedChild.id} />
                  <ProgressSummary childId={selectedChild.id} />
                </>
              )}
            </div>
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
} 