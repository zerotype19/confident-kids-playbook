import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { ProgressSummaryCard } from '../components/ProgressSummaryCard';
import { ProgressSummary } from '../types';

export const ProgressDashboard: React.FC = () => {
  const { child_id } = useParams<{ child_id: string }>();
  const { selectedChild } = useChildContext();
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/progress/summary?child_id=${child_id}`);
        if (!response.ok) throw new Error('Failed to fetch progress summary');
        const data = await response.json();
        setProgress(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (child_id) {
      fetchProgress();
    }
  }, [child_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading progress...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">No progress data found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {selectedChild?.name}'s Progress
          </h1>
          <p className="mt-2 text-gray-600">
            Track your child's growth across all training zones of confidence
          </p>
        </div>

        <ProgressSummaryCard progress={progress} />
      </div>
    </div>
  );
}; 