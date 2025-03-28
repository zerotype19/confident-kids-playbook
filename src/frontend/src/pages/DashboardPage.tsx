import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import ChildSelector from '../components/dashboard/ChildSelector';
import DailyChallengeCard from '../components/dashboard/DailyChallengeCard';
import NotesSection from '../components/dashboard/NotesSection';
import ProgressSummary from '../components/dashboard/ProgressSummary';
import NavigationPanel from '../components/dashboard/NavigationPanel';

export default function DashboardPage(): JSX.Element {
  const { token } = useAuth();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  if (!token) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        
        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <ChildSelector 
            selectedChildId={selectedChildId} 
            onSelectChild={setSelectedChildId} 
          />
        </div>

        {selectedChildId && (
          <>
            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
              <DailyChallengeCard childId={selectedChildId} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
              <NotesSection childId={selectedChildId} />
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
              <ProgressSummary />
            </div>
          </>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-4 space-y-4">
          <NavigationPanel />
        </div>
      </div>
    </Layout>
  );
} 