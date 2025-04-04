import React from 'react';
import ChildProgressTracker from '../ChildProgressTracker';
import ChildRewards from '../ChildRewards';

interface ProgressSummaryProps {
  childId: string;
}

export default function ProgressSummary({ childId }: ProgressSummaryProps) {
  if (!childId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <ChildProgressTracker childId={childId} />
      </div>
      <ChildRewards childId={childId} />
    </div>
  );
} 