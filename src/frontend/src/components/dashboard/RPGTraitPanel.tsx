import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChildContext } from '../../contexts/ChildContext';

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

export default function RPGTraitPanel() {
  const { selectedChildId, token } = useAuth();
  const { selectedChild } = useChildContext();
  const [traits, setTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for streak and trophies
  const streak = 7; // Replace with real data if available
  const trophies = 3; // Replace with real data if available

  useEffect(() => {
    const fetchTraits = async () => {
      if (!selectedChildId || !token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trait-scores/${selectedChildId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch trait scores');
        const data = await response.json();
        setTraits(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchTraits();
  }, [selectedChildId, token]);

  const totalXP = traits.reduce((sum, trait) => sum + trait.score, 0);
  const level = getLevel(totalXP);
  const nextLevelXP = [25, 50, 100, 1000][level];
  const xpPercent = Math.min((totalXP / nextLevelXP) * 100, 100);
  const avatarUrl = selectedChild?.avatar_url;
  const childName = selectedChild?.name || 'Your Child';
  const childAge = selectedChild?.birthdate
    ? Math.floor((Date.now() - new Date(selectedChild.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-sans">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={avatarUrl || '/avatar-placeholder.png'}
          alt="Child Avatar"
          className="w-20 h-20 rounded-full border-2 border-gray-300 object-cover bg-gray-100"
          onError={e => (e.currentTarget.src = '/avatar-placeholder.png')}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">{childName}</h2>
          {childAge && <p className="text-xs text-gray-500">Age: {childAge}</p>}
          <p className="text-sm text-gray-600">Level {level + 1} – {levelNames[level]}</p>
          <div className="mt-1 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2 items-center">
            XP: {totalXP} / {nextLevelXP}
            <span>|</span>
            <span>Streak: <span className="text-orange-500">🔥 {streak}</span></span>
            <span>|</span>
            <span>Trophies: <span className="text-yellow-500">🏆 {trophies}</span></span>
          </p>
        </div>
      </div>

      {/* Trait Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {traits.map((trait) => {
          const traitLevel = getLevel(trait.score);
          const percent = Math.min(trait.score, 100);
          return (
            <div
              key={trait.trait_id}
              className="flex flex-col gap-2 p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-100 hover:scale-[1.01] hover:shadow-lg transition-transform duration-200 cursor-pointer"
            >
              <div className="flex justify-between items-center text-sm font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: pillarHex[trait.pillar_id] }} />
                  {trait.trait_name}
                </span>
                <span className="text-green-800 font-semibold">{Math.round(trait.score)} XP</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${percent}%`, backgroundColor: pillarHex[trait.pillar_id] }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-1">Level: <strong>{levelNames[traitLevel]}</strong></div>
            </div>
          );
        })}
      </div>

      {/* Stats & Awards Summary (Optional/Stretch) */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-6 items-center justify-between text-sm text-gray-700">
        <div>
          <span className="font-semibold">Total Challenges:</span> 24
        </div>
        <div>
          <span className="font-semibold">Most Improved Trait:</span> Grit
        </div>
        <div>
          <span className="font-semibold">Awards:</span> <span className="text-yellow-500">🏆</span> 3
        </div>
        <div>
          <span className="font-semibold">Streak:</span> <span className="text-orange-500">🔥</span> 7 days
        </div>
        {/* Add more stats or links as needed */}
      </div>
    </div>
  );
} 