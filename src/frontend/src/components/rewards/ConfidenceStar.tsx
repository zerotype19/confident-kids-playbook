import React from 'react';
import { ProgressSummary } from '../../types';

interface ConfidenceStarProps {
  progress: ProgressSummary | null;
  childId: string;
}

const PILLAR_COLORS = {
  1: '#F7B801', // Independence & Problem-Solving
  2: '#38A169', // Growth Mindset & Resilience
  3: '#4299E1', // Social Confidence & Communication
  4: '#805AD5', // Purpose & Strength Discovery
  5: '#E53E3E'  // Managing Fear & Anxiety
};

const PILLAR_NAMES = {
  1: 'Independence & Problem-Solving',
  2: 'Growth Mindset & Resilience',
  3: 'Social Confidence & Communication',
  4: 'Purpose & Strength Discovery',
  5: 'Managing Fear & Anxiety'
};

export default function ConfidenceStar({ progress, childId }: ConfidenceStarProps) {
  if (!progress) return null;

  const getPillarProgress = (pillarId: number) => {
    const pillarProgress = progress.pillar_progress[pillarId];
    return pillarProgress ? pillarProgress.percentage : 0;
  };

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-[320px] h-[320px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {[1, 2, 3, 4, 5].map((pillarId, index) => {
            const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
            const x = 100 + Math.cos(angle) * 80;
            const y = 100 + Math.sin(angle) * 80;
            const progress = getPillarProgress(pillarId);

            return (
              <g key={pillarId} className="cursor-pointer group">
                <circle
                  cx={x}
                  cy={y}
                  r={24}
                  className="transition-all duration-500 stroke-white stroke-[3px]"
                  style={{
                    fill: PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS],
                    fillOpacity: progress / 100
                  }}
                  onClick={() => {
                    // TODO: Add navigation to pillar details
                    console.log(`View details for ${PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES]}`);
                  }}
                />
                <text
                  x={x}
                  y={y + 35}
                  textAnchor="middle"
                  className="text-xs fill-gray-800 font-medium group-hover:fill-kidoova-green transition-colors"
                >
                  {PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES].split(' & ')[0]}
                </text>
                <text
                  x={x}
                  y={y + 45}
                  textAnchor="middle"
                  className="text-xs fill-gray-600 group-hover:fill-kidoova-green transition-colors"
                >
                  {Math.round(progress)}%
                </text>
              </g>
            );
          })}

          {/* Center star for total completion */}
          <circle 
            cx={100} 
            cy={100} 
            r={32} 
            className="fill-kidoova-accent stroke-white stroke-[4px]"
          />
          <text 
            x={100} 
            y={105} 
            textAnchor="middle" 
            className="text-sm fill-white font-bold"
          >
            {Math.round(
              Object.values(progress.pillar_progress)
                .reduce((sum, pillar) => sum + pillar.percentage, 0) / 5
            )}%
          </text>
        </svg>
      </div>
    </div>
  );
} 