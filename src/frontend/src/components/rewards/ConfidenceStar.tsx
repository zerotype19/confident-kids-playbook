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
  // Calculate angles for the current point
  const startAngle = ((index - 0.5) / 5) * 2 * Math.PI - Math.PI / 2;
  const endAngle = ((index + 0.5) / 5) * 2 * Math.PI - Math.PI / 2;
  const pointAngle = (index / 5) * 2 * Math.PI - Math.PI / 2;
  
  // Calculate points
  const startX = 100 + Math.cos(startAngle) * innerRadius;
  const startY = 100 + Math.sin(startAngle) * innerRadius;
  const pointX = 100 + Math.cos(pointAngle) * outerRadius;
  const pointY = 100 + Math.sin(pointAngle) * outerRadius;
  const endX = 100 + Math.cos(endAngle) * innerRadius;
  const endY = 100 + Math.sin(endAngle) * innerRadius;
  
  return `M ${startX} ${startY} L ${pointX} ${pointY} L ${endX} ${endY}`;
};

// Function to create the inner pentagon path
const createInnerPentagon = (radius: number) => {
  const points = Array.from({ length: 5 }, (_, i) => {
    const angle = (i / 5) * 2 * Math.PI - Math.PI / 2;
    const x = 100 + Math.cos(angle) * radius;
    const y = 100 + Math.sin(angle) * radius;
    return `${x},${y}`;
  });
  return `M ${points[0]} L ${points.slice(1).join(' L ')} Z`;
};

export default function ConfidenceStar({ progress, childId }: ConfidenceStarProps) {
  if (!progress) return null;

  const getPillarProgress = (pillarId: number) => {
    const pillarProgress = progress.pillar_progress[pillarId];
    return pillarProgress ? Math.min((pillarProgress.completed / 100) * 100, 100) : 0;
  };

  const outerRadius = 80;
  const innerRadius = 35;

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-[480px] h-[480px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Green center */}
          <path
            d={createInnerPentagon(innerRadius)}
            fill="#10B981"
            stroke="none"
          />
          
          {/* Star points with hover areas */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const progress = getPillarProgress(pillarId);
            const pointAngle = (index / 5) * 2 * Math.PI - Math.PI / 2;

            return (
              <g key={pillarId} className="group">
                {/* Invisible hover area (full star point) */}
                <path
                  d={createStarPoint(index, outerRadius, innerRadius)}
                  className="opacity-0 cursor-pointer"
                  stroke="none"
                />
                
                {/* Visible star point with fill */}
                <path
                  d={createStarPoint(index, outerRadius, innerRadius)}
                  fill={PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS]}
                  fillOpacity={progress / 100}
                  stroke="black"
                  strokeWidth="1"
                />
                
                {/* Tooltip */}
                <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <foreignObject
                    x={100 + Math.cos(pointAngle) * (outerRadius + 15)}
                    y={100 + Math.sin(pointAngle) * (outerRadius + 15)}
                    width="120"
                    height="35"
                    style={{
                      transform: `translate(-50%, -50%)`
                    }}
                  >
                    <div className="absolute bg-gray-800 text-white px-1.5 py-0.5 rounded text-[7px] leading-tight whitespace-nowrap">
                      <p>{PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES]}</p>
                      <p className="font-bold">{Math.round(progress)}% complete</p>
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