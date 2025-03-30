import React from 'react';
import ChildProgressTracker from '../../components/ChildProgressTracker';

interface ProgressSummaryProps {
  childId?: string;
}

export default function ProgressSummary({ childId }: ProgressSummaryProps) {
  if (!childId) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <ChildProgressTracker childId={childId} />
    </div>
  );
} 