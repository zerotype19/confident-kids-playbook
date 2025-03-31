import React, { useState } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string[];
  tip: string;
  example_dialogue: string;
}

interface TodayChallengeCardProps {
  challenge: Challenge | null;
  childId: string;
  onComplete?: () => void;
}

export default function TodayChallengeCard({ challenge, childId, onComplete }: TodayChallengeCardProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!challenge) {
    return (
      <div className="bg-white rounded-2xl shadow-kidoova p-6">
        <div className="text-center py-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Challenge Available</h3>
          <p className="text-gray-600">Check back later for today's challenge.</p>
        </div>
      </div>
    );
  }

  const handleMarkComplete = async () => {
    setIsCompleting(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/challenges/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          child_id: childId,
          challenge_id: challenge.id,
          reflection: "Completed the challenge"
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to mark challenge as complete');
      }

      setIsCompleted(true);
      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      console.error('Error marking challenge complete:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark challenge as complete');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Today's Challenge</h2>
        {!isCompleted && (
          <button
            onClick={handleMarkComplete}
            disabled={isCompleting}
            className={`px-4 py-2 rounded-lg text-white font-medium ${
              isCompleting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-kidoova-green hover:bg-kidoova-green-dark'
            }`}
          >
            {isCompleting ? 'Marking Complete...' : 'Mark Complete'}
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600">{challenge.description}</p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Goal</h3>
          <p className="text-gray-600">{challenge.goal}</p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Steps</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-600">
            {challenge.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tip</h3>
          <p className="text-gray-600">{challenge.tip}</p>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Example Dialogue</h3>
          <p className="text-gray-600">{challenge.example_dialogue}</p>
        </div>
      </div>
    </div>
  );
} 