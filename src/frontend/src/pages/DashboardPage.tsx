import React, { useState } from 'react';
import Layout from '../components/Layout';
import ChildSelector from '../components/dashboard/ChildSelector';
import DailyChallengeCard from '../components/dashboard/DailyChallengeCard';
import NavigationPanel from '../components/dashboard/NavigationPanel';
import NotesSection from '../components/dashboard/NotesSection';
import ProgressSummary from '../components/dashboard/ProgressSummary';
import TodaysChallenge from '../components/dashboard/TodaysChallenge';
import { Child } from '../types';
import { PageWrapper } from '../components/PageWrapper';

export default function DashboardPage() {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  return (
    <Layout>
      <PageWrapper>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-heading mb-6">Dashboard</h1>
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
                <TodaysChallenge childId={selectedChild.id} />
                <DailyChallengeCard childId={selectedChild.id} />
                <NotesSection childId={selectedChild.id} />
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
                <p className="text-gray-600">Please select a child to view their dashboard.</p>
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