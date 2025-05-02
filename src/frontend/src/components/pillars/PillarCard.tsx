import React, { useState, useEffect } from 'react';
import { Pillar } from '../../types';

interface PillarCardProps {
  pillar: Pillar;
  childId: string;
  onClick: () => void;
}

const pillarHex: Record<number, string> = {
  1: '#F7B801', // Independence & Problem-Solving
  2: '#38A169', // Growth Mindset & Resilience
  3: '#4299E1', // Social Confidence & Communication
  4: '#805AD5', // Purpose & Strength Discovery
  5: '#E53E3E'  // Managing Fear & Anxiety
};

export default function PillarCard({ pillar, childId, onClick }: PillarCardProps) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars/${pillar.id}/progress?child_id=${childId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch pillar progress');
        }

        const { progress } = await response.json();
        // Calculate progress based on 75 total challenges
        const completedChallenges = Math.round((progress / 100) * 75);
        setProgress((completedChallenges / 75) * 100);
      } catch (err) {
        console.error('Error fetching pillar progress:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgress();
  }, [pillar.id, childId]);

  return (
    <div
      className="bg-white rounded-xl shadow-sm p-6 cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <span className="text-4xl">{pillar.icon}</span>
        <div className="flex-1">
          <h2 className="text-xl font-heading text-gray-900">{pillar.name}</h2>
          <p className="text-gray-600 mt-1 line-clamp-2">{pillar.description}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{isLoading ? '...' : `${Math.round(progress)}%`}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${progress}%`,
              backgroundColor: pillarHex[parseInt(pillar.id)]
            }}
          />
        </div>
      </div>
    </div>
  );
} 