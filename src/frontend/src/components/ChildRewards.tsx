import { useEffect, useState } from "react";

interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'streak' | 'pillar';
  criteria_value: number;
  pillar_id?: number;
}

interface ChildRewardsProps {
  childId: string;
}

export default function ChildRewards({ childId }: ChildRewardsProps) {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const url = `${import.meta.env.VITE_API_URL}/rewards?childId=${childId}`;
        console.log('Fetching rewards from:', url);

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch rewards: ${response.status}`);
        }

        const data = await response.json();
        setRewards(data);
      } catch (err) {
        console.error("Error fetching rewards:", err);
        setError(err instanceof Error ? err.message : "Failed to load rewards");
      }
    };

    if (childId) {
      fetchRewards();
    }
  }, [childId]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!rewards.length) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Rewards</h2>
        <p className="text-gray-500 text-center">No rewards earned yet. Keep completing challenges!</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Rewards</h2>
      <div className="grid grid-cols-2 gap-4">
        {rewards.map(reward => (
          <div 
            key={reward.id} 
            className="p-3 rounded-lg bg-yellow-50 border border-yellow-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-3xl mb-2">{reward.icon}</div>
            <p className="font-bold text-gray-900">{reward.title}</p>
            <p className="text-sm text-gray-600 mt-1">{reward.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 