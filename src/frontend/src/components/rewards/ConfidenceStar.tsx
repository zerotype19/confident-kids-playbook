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
  const midAngle = (angle + nextAngle) / 2;
  
  const outerX1 = 100 + Math.cos(angle) * outerRadius;
  const outerY1 = 100 + Math.sin(angle) * outerRadius;
  const innerX = 100 + Math.cos(midAngle) * innerRadius;
  const innerY = 100 + Math.sin(midAngle) * innerRadius;
  const outerX2 = 100 + Math.cos(nextAngle) * outerRadius;
  const outerY2 = 100 + Math.sin(nextAngle) * outerRadius;
  
  return `M ${outerX1} ${outerY1} L ${innerX} ${innerY} L ${outerX2} ${outerY2} Z`;
};

export default function ConfidenceStar({ progress, childId }: ConfidenceStarProps) {
  if (!progress) return null;

  const getPillarProgress = (pillarId: number) => {
    const pillarProgress = progress.pillar_progress[pillarId];
    return pillarProgress ? pillarProgress.percentage : 0;
  };

  const outerRadius = 80;
  const innerRadius = 30;

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-[480px] h-[480px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Star points */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const progress = getPillarProgress(pillarId);
            const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;

            return (
              <g key={pillarId} className="group relative">
                {/* Star point with fill */}
                <path
                  d={createStarPoint(index, outerRadius, innerRadius)}
                  className="transition-all duration-500"
                  style={{
                    fill: PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS],
                    stroke: 'black',
                    strokeWidth: '1'
                  }}
                />
                {/* White overlay for incomplete portion */}
                <path
                  d={createStarPoint(index, outerRadius, innerRadius)}
                  className="transition-all duration-500"
                  style={{
                    fill: 'white',
                    fillOpacity: 1 - (progress / 100)
                  }}
                />
                {/* Tooltip */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <foreignObject
                    x={100 + Math.cos(angle) * (outerRadius + 20)}
                    y={100 + Math.sin(angle) * (outerRadius + 20)}
                    width="200"
                    height="60"
                    style={{
                      transform: `translate(-50%, -50%)`
                    }}
                  >
                    <div className="absolute bg-gray-800 text-white px-2 py-1 rounded text-[10px] whitespace-nowrap">
                      <p>{PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES]}</p>
                      <p className="font-bold text-[11px]">{Math.round(progress)}% complete</p>
                    </div>
                  </foreignObject>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
} 