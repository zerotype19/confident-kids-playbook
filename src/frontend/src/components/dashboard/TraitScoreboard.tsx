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
        const response = await fetch(`/api/trait-scores/${selectedChildId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch trait scores');
        }

        const data = await response.json();
        setTraits(data);
      } catch (err) {
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
    <div className="p-4 rounded-xl bg-white shadow-md">
      <h2 className="text-xl font-semibold mb-4">Confidence DNA</h2>
      <div className="space-y-2">
        {traits.map((trait) => (
          <div key={trait.trait_id} className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${pillarColors[trait.pillar_id]}`}></span>
              <span>{trait.trait_name}</span>
            </span>
            <span className="font-bold">{Math.round(trait.score)} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
} 