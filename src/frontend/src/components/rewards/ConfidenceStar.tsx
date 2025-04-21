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

// Function to create star point path
const createStarPoint = (index: number, outerRadius: number, innerRadius: number) => {
  const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
  const nextAngle = ((index + 1) / 5) * 2 * Math.PI - Math.PI / 2;
  
  const outerX1 = 100 + Math.cos(angle) * outerRadius;
  const outerY1 = 100 + Math.sin(angle) * outerRadius;
  const innerX = 100 + Math.cos(angle + Math.PI / 5) * innerRadius;
  const innerY = 100 + Math.sin(angle + Math.PI / 5) * innerRadius;
  const outerX2 = 100 + Math.cos(nextAngle) * outerRadius;
  const outerY2 = 100 + Math.sin(nextAngle) * outerRadius;
  
  return `M ${outerX1} ${outerY1} L ${innerX} ${innerY} L ${outerX2} ${outerY2}`;
};

export default function ConfidenceStar({ progress, childId }: ConfidenceStarProps) {
  if (!progress) return null;

  const getPillarProgress = (pillarId: number) => {
    const pillarProgress = progress.pillar_progress[pillarId];
    return pillarProgress ? pillarProgress.percentage : 0;
  };

  const outerRadius = 80;
  const innerRadius = 40;

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-[480px] h-[480px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Star points */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const progress = getPillarProgress(pillarId);

            return (
              <g key={pillarId} className="group relative">
                <path
                  d={createStarPoint(index, outerRadius, innerRadius)}
                  className="transition-all duration-500"
                  style={{
                    fill: PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS],
                    fillOpacity: progress / 100,
                    stroke: 'black',
                    strokeWidth: '1'
                  }}
                />
                {/* Tooltip */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <foreignObject
                    x={100 + Math.cos((index / 5) * 2 * Math.PI - Math.PI / 2) * (outerRadius + 10)}
                    y={100 + Math.sin((index / 5) * 2 * Math.PI - Math.PI / 2) * (outerRadius + 10)}
                    width="120"
                    height="40"
                    className="overflow-visible"
                  >
                    <div className="absolute bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap transform -translate-x-1/2 -translate-y-full">
                      <p>{PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES]}</p>
                      <p className="font-bold">{Math.round(progress)}% complete</p>
                    </div>
                  </foreignObject>
                </g>
              </g>
            );
          })}

          {/* Center circle */}
          <circle 
            cx={100} 
            cy={100} 
            r={innerRadius - 10} 
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