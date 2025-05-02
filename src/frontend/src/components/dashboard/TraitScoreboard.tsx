import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Trait {
  trait_id: number;
  trait_name: string;
  trait_code: string;
  pillar_id: number;
  score: number;
}

const pillarColors: Record<number, string> = {
  1: 'bg-yellow-300',
  2: 'bg-green-400',
  3: 'bg-blue-400',
  4: 'bg-purple-400',
  5: 'bg-red-400'
};

export default function TraitScoreboard() {
  const { selectedChildId, token } = useAuth();
  const [traits, setTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTraits = async () => {
      if (!selectedChildId || !token) return;

      try {
        console.log('Fetching trait scores for child:', selectedChildId);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trait-scores/${selectedChildId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch trait scores: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Unexpected content type:', contentType);
          console.error('Response text:', text);
          throw new Error('Invalid response format: expected JSON');
        }

        const data = await response.json();
        console.log('Received trait scores:', data);
        setTraits(data.data);
      } catch (err) {
        console.error('Error in fetchTraits:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTraits();
  }, [selectedChildId, token]);

  if (loading) {
    return (
      <div className="p-4 rounded-xl bg-white shadow-md">
        <div className="animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-xl bg-white shadow-md">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 rounded-xl bg-white shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Confidence DNA</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {traits?.map((trait) => (
          <div key={trait.trait_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="flex items-center gap-3">
              <span className={`w-4 h-4 rounded-full ${pillarColors[trait.pillar_id]}`}></span>
              <span className="font-medium">{trait.trait_name}</span>
            </span>
            <span className="font-bold text-lg">{Math.round(trait.score)} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
} 