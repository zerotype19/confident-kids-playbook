import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

interface Trait {
  trait_id: number;
  trait_name: string;
  trait_code: string;
  pillar_id: number;
  score: number;
}

const pillarHex: Record<number, string> = {
  1: '#F7B801', // Independence & Problem-Solving
  2: '#38A169', // Growth Mindset & Resilience
  3: '#4299E1', // Social Confidence & Communication
  4: '#805AD5', // Purpose & Strength Discovery
  5: '#E53E3E'  // Managing Fear & Anxiety
};

const levelNames = ['🏕 Explorer', '🔧 Builder', '🏆 Champion', '🌟 Master'];

function getLevel(score: number): number {
  if (score >= 100) return 3;
  if (score >= 50) return 2;
  if (score >= 25) return 1;
  return 0;
}

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {traits?.map((trait) => {
          const level = getLevel(trait.score);
          const levelName = levelNames[level];
          const percent = Math.min(trait.score, 100);

          return (
            <div key={trait.trait_id} className="flex flex-col gap-2 p-4 rounded-xl bg-gray-50 shadow-sm">
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pillarHex[trait.pillar_id] }} />
                  {trait.trait_name}
                </span>
                <span className="text-green-800 font-semibold">{Math.round(trait.score)} pts</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all"
                  style={{ width: `${percent}%`, backgroundColor: pillarHex[trait.pillar_id] }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">Level: <strong>{levelName}</strong></div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 