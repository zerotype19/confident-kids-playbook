import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { Challenge, FeatureFlags } from '../types';

export const ChallengeViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedChild } = useChildContext();
  const flags = useFeatureFlags();
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [moodRating, setMoodRating] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const response = await fetch(`/api/challenges/${id}`);
        if (!response.ok) throw new Error('Failed to fetch challenge');
        const data = await response.json();
        setChallenge(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchChallenge();
    }
  }, [id]);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChild || !challenge) return;

    setIsSubmitting(true);
    try {
      // First, complete the challenge
      const completeResponse = await fetch('/api/challenges/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: selectedChild.id,
          challenge_id: challenge.id,
          reflection,
          mood_rating: moodRating
        })
      });

      if (!completeResponse.ok) throw new Error('Failed to complete challenge');

      // Then, create a journal entry
      const journalResponse = await fetch('/api/journal/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          child_id: selectedChild.id,
          entry_text: reflection,
          mood_rating: moodRating,
          tags: ['challenge-reflection']
        })
      });

      if (!journalResponse.ok) throw new Error('Failed to create journal entry');

      // Navigate back to dashboard
      navigate('/dashboard', { state: { success: true } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  if (!challenge) {
    return <div className="p-4 text-gray-600">Challenge not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-6">{challenge.title}</h1>

      <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
        <h2 className="font-semibold mb-2">Goal</h2>
        <p className="text-gray-700 mb-6">{challenge.goal}</p>

        <h2 className="font-semibold mb-2">Steps</h2>
        <ol className="list-decimal list-inside space-y-2 mb-6">
          {challenge.steps?.map((step: string, index: number) => (
            <li key={index} className="text-gray-700">{step}</li>
          ))}
        </ol>

        {challenge.example_dialogue && (
          <div className="mb-6">
            <h2 className="font-semibold mb-2">Example Dialogue</h2>
            <blockquote className="italic text-gray-600 border-l-4 border-gray-200 pl-4">
              {challenge.example_dialogue}
            </blockquote>
          </div>
        )}

        {flags['premium.dashboard_insights'] && challenge.tip && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="font-semibold mb-2">Pro Tip</h2>
            <p className="text-gray-700">{challenge.tip}</p>
          </div>
        )}
      </div>

      <form onSubmit={handleComplete} className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Complete Challenge</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            What happened during this challenge?
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="w-full p-2 border rounded-md"
            rows={4}
            required
            placeholder="Share your experience..."
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            How did it go?
          </label>
          <div className="flex gap-4">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setMoodRating(rating)}
                className={`w-10 h-10 rounded-full ${
                  moodRating === rating
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100'
                }`}
              >
                {['😢', '😕', '😐', '🙂', '😊'][rating - 1]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? 'Completing...' : 'Complete Challenge'}
        </button>
      </form>
    </div>
  );
}; 