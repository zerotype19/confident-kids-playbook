import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useChildContext } from '../../contexts/ChildContext';
import { ProgressSummary, Reward } from '../../types';

interface Trait {
  trait_id: number;
  trait_name: string;
  trait_code: string;
  pillar_id: number;
  score: number;
}

interface ChallengeLog {
  id: string;
  child_id: string;
  challenge_id: string;
  trait_id: number;
  xp_value: number;
  completed_at: string;
}

interface TraitScoreHistory {
  id: string;
  child_id: string;
  trait_id: number;
  score_delta: number;
  completed_at: string;
}
const pillarHex: Record<number, string> = {
  1: '#F7B801', // Core Strength (Independence & Problem-Solving)
  2: '#38A169', // Endurance (Growth Mindset & Resilience)
  3: '#4299E1', // Social Mobility (Social Confidence & Communication)
  4: '#805AD5', // Inner Strength (Purpose & Strength Discovery)
  5: '#E53E3E'  // Calm & Control (Managing Fear & Anxiety)
};

export function getProfileLevel(totalXP: number): number {
  if (totalXP >= 1000) return 4; // Diamond
  if (totalXP >= 700) return 3;  // Platinum
  if (totalXP >= 400) return 2;  // Gold
  if (totalXP >= 200) return 1;  // Silver
  return 0;                      // Bronze
}

export const profileLevelLabels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
export const profileLevelEmojis = ['🥉', '🥈', '🥇', '💎', '🏆'];

export function getTraitTier(xp: number): number {
  if (xp >= 100) return 4; // Diamond
  if (xp >= 60) return 3;  // Platinum
  if (xp >= 35) return 2;  // Gold
  if (xp >= 15) return 1;  // Silver
  return 0;                // Bronze
}

export const traitTierLabels = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
export const traitTierEmojis = ['🥉', '🥈', '🥇', '💎', '🏆'];

interface RPGTraitPanelProps {
  progress: ProgressSummary | null;
  rewards: Reward[];
}


export default function RPGTraitPanel({ progress, rewards }: RPGTraitPanelProps) {
  const { selectedChildId, token } = useAuth();
  const { selectedChild } = useChildContext();
  const [traits, setTraits] = useState<Trait[]>([]);
  const [historicalTraits, setHistoricalTraits] = useState<Trait[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mostImprovedTrait, setMostImprovedTrait] = useState<string>('N/A');
  const [weeklyXPGained, setWeeklyXPGained] = useState<number>(0);
  const [fastestGrowingTrait, setFastestGrowingTrait] = useState<{ trait_name: string; growthPercent: number } | null>(null);
  const [nextTraitToMaster, setNextTraitToMaster] = useState<{ trait_name: string; from: string; to: string; xp_remaining: number } | null>(null);

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
        if (data.data) {
          setTraits(data.data);
          // Find the trait with the highest recent_gain
          const mostImproved = data.data.reduce((max: Trait, current: Trait) => {
            const maxGain = typeof (max as any).recent_gain === 'number' ? (max as any).recent_gain : 0;
            const currGain = typeof (current as any).recent_gain === 'number' ? (current as any).recent_gain : 0;
            return currGain > maxGain ? current : max;
          }, data.data[0]);
          setMostImprovedTrait((mostImproved as any)?.trait_name || 'N/A');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchTraits();
  }, [selectedChildId, token]);

  useEffect(() => {
    const fetchHistoricalTraits = async () => {
      if (!selectedChildId || !token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trait-scores/${selectedChildId}?historical=true`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch historical trait scores');
        const data = await response.json();
        setHistoricalTraits(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    };
    fetchHistoricalTraits();
  }, [selectedChildId, token]);

  // Use only trait-scores API for all advanced stats
  useEffect(() => {
    const fetchTraitScores = async () => {
      if (!selectedChildId || !token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/trait-scores/${selectedChildId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        if (!response.ok) throw new Error('Failed to fetch trait scores');
        const data = await response.json();
        if (data.data) setTraits(data.data);
        setWeeklyXPGained(data.weekly_xp_gained ?? 0);
        setFastestGrowingTrait(data.fastest_growing_trait ?? null);
        setNextTraitToMaster(data.next_trait_to_master ?? null);
        // Most improved trait logic remains as before
        if (data.data) {
          const mostImproved = data.data.reduce((max: Trait, current: Trait) => {
            const maxGain = typeof (max as any).recent_gain === 'number' ? (max as any).recent_gain : 0;
            const currGain = typeof (current as any).recent_gain === 'number' ? (current as any).recent_gain : 0;
            return currGain > maxGain ? current : max;
          }, data.data[0]);
          setMostImprovedTrait((mostImproved as any)?.trait_name || 'N/A');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchTraitScores();
  }, [selectedChildId, token]);

  const totalXP = traits.reduce((sum, trait) => sum + trait.score, 0);
  const profileLevel = getProfileLevel(totalXP);
  const nextLevelXP = [200, 400, 700, 1000, 1200][profileLevel]; // safe cap
  const xpPercent = Math.min((totalXP / nextLevelXP) * 100, 100);
  const profileLevelLabel = profileLevelLabels[profileLevel];
  const profileEmoji = profileLevelEmojis[profileLevel];
  const avatarUrl = selectedChild?.avatar_url;
  const childName = selectedChild?.name || 'Your Child';
  const childAge = selectedChild?.birthdate
    ? Math.floor((Date.now() - new Date(selectedChild.birthdate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : null;

  // Use real stats from props
  const streak = progress?.current_streak || 0;
  const trophies = rewards?.length || 0;
  const totalChallenges = progress?.milestones_completed || 0;
  const longestStreak = progress?.longest_streak || 0;
  const weeklyChallenges = progress?.weekly_challenges || 0;

  // --- Use backend-provided advanced stats ---
  const fastestLabel = fastestGrowingTrait ? `${fastestGrowingTrait.trait_name} (+${fastestGrowingTrait.growthPercent}%)` : 'N/A';
  const weeklyXPLabel = `+${Math.round(weeklyXPGained)} Points`;
  let nextTraitLabel = 'N/A';
  if (nextTraitToMaster) {
    // Map old emoji to index if needed
    const emojiToIndex: Record<string, number> = {
      '🔸': 0, '🥉': 0, // Bronze
      '🔹': 1, '🥈': 1, // Silver
      '🟢': 2, '🥇': 2, // Gold
      '🟣': 3, '💎': 3, // Platinum
      '🌟': 4, '🏆': 4  // Diamond
    };
    let fromTier = traitTierLabels.indexOf(nextTraitToMaster.from);
    let toTier = traitTierLabels.indexOf(nextTraitToMaster.to);
    if (fromTier === -1 && emojiToIndex[nextTraitToMaster.from] !== undefined) fromTier = emojiToIndex[nextTraitToMaster.from];
    if (toTier === -1 && emojiToIndex[nextTraitToMaster.to] !== undefined) toTier = emojiToIndex[nextTraitToMaster.to];
    const fromEmoji = traitTierEmojis[fromTier] || nextTraitToMaster.from;
    const toEmoji = traitTierEmojis[toTier] || nextTraitToMaster.to;
    nextTraitLabel = `${nextTraitToMaster.trait_name} (${fromEmoji} → ${toEmoji} in ${nextTraitToMaster.xp_remaining} Points)`;
  }

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-white rounded-xl shadow-md font-sans">
      {/* Profile Header */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={avatarUrl || '/logo.png'}
          alt="Child Avatar"
          className="w-20 h-20 rounded-full border-2 border-gray-300 object-cover bg-gray-100"
          onError={e => (e.currentTarget.src = '/logo.png')}
        />
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold truncate">{childName}</h2>
          {childAge !== null && <p className="text-xs text-gray-500">Age: {childAge}</p>}
          <p className="text-sm text-gray-600">
            Level {profileLevel + 1} – {profileEmoji} {profileLevelLabel}
          </p>
          <div className="mt-1 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 flex flex-wrap gap-2 items-center">
            Points: {Math.round(totalXP)} / {nextLevelXP}
          </p>
        </div>
      </div>

      {/* Trait Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {traits.map((trait) => {
          const traitTier = getTraitTier(trait.score);
          const traitLabel = traitTierLabels[traitTier];
          const traitEmoji = traitTierEmojis[traitTier];
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
                <span className="text-green-800 font-semibold">{Math.round(trait.score)} Points</span>
              </div>
              <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-3 rounded-full transition-all duration-700"
                  style={{ width: `${percent}%`, backgroundColor: pillarHex[trait.pillar_id] }}
                />
              </div>
              <p className="text-xs text-gray-600">
                Tier: {traitEmoji} {traitLabel}
              </p>
            </div>
          );
        })}
      </div>

      {/* Advanced Stats Summary */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-6 items-center justify-between text-xs text-gray-700">
        <div>
          <span className="font-semibold">Most Improved Trait:</span> {mostImprovedTrait}
        </div>
        <div>
          <span className="font-semibold">Weekly Points Gained:</span> {weeklyXPLabel}
        </div>
        <div>
          <span className="font-semibold">Fastest Growing Trait:</span> {fastestLabel}
        </div>
        <div>
          <span className="font-semibold">Next Trait to Master:</span> {nextTraitLabel}
        </div>
      </div>
    </div>
  );
} 