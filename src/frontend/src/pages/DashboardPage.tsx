import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ChildSelector from '../components/dashboard/ChildSelector';
import NavigationPanel from '../components/dashboard/NavigationPanel';
import NotesSection from '../components/dashboard/NotesSection';
import ProgressSummary from '../components/dashboard/ProgressSummary';
import TodaysChallengeCard from '../components/dashboard/TodaysChallengeCard';
import { Child } from '../types';
import { PageWrapper } from '../components/PageWrapper';
import CustomButton from '../components/CustomButton';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string[];
  example_dialogue: string;
  tip: string;
  pillar: string;
}

export default function DashboardPage() {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChallenge() {
      if (!selectedChild) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/challenge?child_id=${selectedChild.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch challenge');
        }
        const data = await response.json();
        setChallenge(data.challenge);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch challenge');
      } finally {
        setIsLoading(false);
      }
    }

    fetchChallenge();
  }, [selectedChild]);

  const handleMarkComplete = async () => {
    // TODO: Implement challenge completion
    console.log('Marking challenge complete');
  };

  return (
    <Layout>
      <PageWrapper>
        <h1 className="text-3xl font-bold text-kidoova-green mb-6">Welcome back!</h1>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column - Child Selection and Navigation */}
          <div className="lg:col-span-3 space-y-6">
            <ChildSelector
              selectedChild={selectedChild}
              onChildSelect={setSelectedChild}
            />
            <NavigationPanel />
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-6 space-y-6">
            {selectedChild ? (
              <>
                {isLoading ? (
                  <div className="bg-white rounded-2xl shadow-kidoova p-6 text-center">
                    <p className="text-gray-600">Loading today's challenge...</p>
                  </div>
                ) : error ? (
                  <div className="bg-white rounded-2xl shadow-kidoova p-6 text-center">
                    <p className="text-red-600">{error}</p>
                  </div>
                ) : challenge ? (
                  <TodaysChallengeCard
                    title={challenge.title}
                    description={challenge.description}
                    goal={challenge.goal}
                    steps={challenge.steps}
                    exampleDialogue={challenge.example_dialogue}
                    tip={challenge.tip}
                    pillar={challenge.pillar}
                    onMarkComplete={handleMarkComplete}
                  />
                ) : null}
                <NotesSection childId={selectedChild.id} />
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-kidoova p-6 text-center">
                <p className="text-gray-600">Please select a child to view their dashboard.</p>
                <CustomButton 
                  variant="secondary" 
                  onClick={() => console.log('Add child clicked')}
                  className="mt-4"
                >
                  Add Child
                </CustomButton>
              </div>
            )}
          </div>

          {/* Right Column - Progress Summary */}
          <div className="lg:col-span-3">
            {selectedChild && <ProgressSummary childId={selectedChild.id} />}
          </div>
        </div>
      </PageWrapper>
    </Layout>
  );
} 