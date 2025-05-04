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

const pillarHex: Record<number, string> = {
  1: '#F7B801', // Independence & Problem-Solving
  2: '#38A169', // Growth Mindset & Resilience
  3: '#4299E1', // Social Confidence & Communication
  4: '#805AD5', // Purpose & Strength Discovery
  5: '#E53E3E'  // Managing Fear & Anxiety
};

export function getProfileLevel(totalXP: number): number {
  if (totalXP >= 1000) return 4;
  if (totalXP >= 700) return 3;
  if (totalXP >= 400) return 2;
  if (totalXP >= 200) return 1;
  return 0;
}

export const profileLevelLabels = ['Explorer', 'Pathfinder', 'Trailblazer', 'Guardian', 'Hero'];
export const profileLevelEmojis = ['🧭', '🏕', '🔥', '🛡', '🌟'];

export function getTraitTier(xp: number): number {
  if (xp >= 100) return 4;
  if (xp >= 60) return 3;
  if (xp >= 35) return 2;
  if (xp >= 15) return 1;
  return 0;
}

export const traitTierLabels = ['Novice', 'Learner', 'Skilled', 'Expert', 'Mastery'];
export const traitTierEmojis = ['🔸', '🔹', '🟢', '🟣', '🌟'];

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
  const [challengeLogs, setChallengeLogs] = useState<ChallengeLog[]>([]);

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

  // Fetch challenge logs for advanced stats
  useEffect(() => {
    const fetchLogs = async () => {
      if (!selectedChildId || !token) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/challenge-logs?child_id=${selectedChildId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch challenge logs');
        const data = await response.json();
        setChallengeLogs(data);
      } catch (err) {
        // Ignore for now
      }
    };
    fetchLogs();
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

  // --- Advanced Stats Logic ---
  // 1. Top Trait
  function getTopTrait(traits: Trait[]) {
    if (traits.length === 0) return null;
    return traits.reduce((max, t) => (t.score > max.score ? t : max));
  }
  const topTrait = getTopTrait(traits);
  const topTraitLabel = topTrait ? `${topTrait.trait_name} (${Math.round(topTrait.score)} XP)` : 'N/A';

  // 2. Fastest Growing Trait (Last 7 Days)
  function getFastestGrowingTrait(challengeLogs: ChallengeLog[], traits: Trait[]) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const recentXPMap: Record<number, number> = {};
    challengeLogs.forEach(log => {
      const completedAt = new Date(log.completed_at);
      if (completedAt >= cutoff) {
        recentXPMap[log.trait_id] = (recentXPMap[log.trait_id] || 0) + log.xp_value;
      }
    });
    const growthRates = traits
      .map(trait => {
        const gain = recentXPMap[trait.trait_id] || 0;
        const previousXP = trait.score - gain;
        const growth = previousXP > 0 ? gain / previousXP : gain > 0 ? 1 : 0;
        return { trait, growth };
      })
      .filter(t => t.growth > 0);
    if (growthRates.length === 0) return null;
    const fastest = growthRates.sort((a, b) => b.growth - a.growth)[0];
    return {
      name: fastest.trait.trait_name,
      percent: Math.round(fastest.growth * 100),
    };
  }
  const fastest = getFastestGrowingTrait(challengeLogs, traits);
  const fastestLabel = fastest ? `${fastest.name} (+${fastest.percent}%)` : 'N/A';

  // 3. Weekly XP Gained
  function getWeeklyXPGained(challengeLogs: ChallengeLog[]) {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay()); // Sunday start
    return challengeLogs
      .filter(log => new Date(log.completed_at) >= weekStart)
      .reduce((sum, log) => sum + log.xp_value, 0);
  }
  const weeklyXP = getWeeklyXPGained(challengeLogs);
  const weeklyXPLabel = `+${weeklyXP} XP`;

  // 4. Next Trait to Master
  const traitThresholds = [15, 35, 60, 100];
  function getNextTraitToMaster(traits: Trait[]) {
    let closestTrait = null;
    let minXPNeeded = Infinity;
    traits.forEach(trait => {
      for (let i = 0; i < traitThresholds.length; i++) {
        const nextTierXP = traitThresholds[i];
        if (trait.score < nextTierXP) {
          const xpNeeded = nextTierXP - trait.score;
          if (xpNeeded < minXPNeeded) {
            closestTrait = {
              name: trait.trait_name,
              currentTier: i === 0 ? '🔸' : i === 1 ? '🔹' : i === 2 ? '🟢' : '🟣',
              nextTier: ['🔹', '🟢', '🟣', '🌟'][i],
              xpRemaining: xpNeeded,
            };
            minXPNeeded = xpNeeded;
          }
          break;
        }
      }
    });
    return closestTrait;
  }
  const nextTrait = getNextTraitToMaster(traits);
  const nextTraitLabel =
    nextTrait &&
    typeof nextTrait === 'object' &&
    nextTrait !== null &&
    'name' in nextTrait &&
    'currentTier' in nextTrait &&
    'nextTier' in nextTrait &&
    'xpRemaining' in nextTrait
      ? `${(nextTrait as any).name} (${(nextTrait as any).currentTier} → ${(nextTrait as any).nextTier} in ${(nextTrait as any).xpRemaining} XP)`
      : 'N/A';

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
            XP: {Math.round(totalXP)} / {nextLevelXP}
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
                <span className="text-green-800 font-semibold">{Math.round(trait.score)} XP</span>
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
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 flex flex-wrap gap-6 items-center justify-between text-sm text-gray-700">
        <div>
          <span className="font-semibold">Most Improved Trait:</span> {mostImprovedTrait}
        </div>
        <div>
          <span className="font-semibold">Top Trait:</span> {topTraitLabel}
        </div>
        <div>
          <span className="font-semibold">Fastest Growing Trait:</span> {fastestLabel}
        </div>
        <div>
          <span className="font-semibold">Weekly XP Gained:</span> {weeklyXPLabel}
        </div>
        <div>
          <span className="font-semibold">Next Trait to Master:</span> {nextTraitLabel}
        </div>
      </div>
    </div>
  );
} 