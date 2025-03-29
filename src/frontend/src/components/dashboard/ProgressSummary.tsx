import React from 'react';

interface ProgressSummaryProps {
  childId?: string;
}

export default function ProgressSummary({ childId }: ProgressSummaryProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress Summary</h2>
      <div className="text-gray-600 text-sm">
        Coming soon! This section will show your child's progress and achievements.
      </div>
    </div>
  );
} 