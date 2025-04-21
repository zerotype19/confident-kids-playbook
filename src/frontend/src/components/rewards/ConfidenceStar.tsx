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
  
  return `M ${startX} ${startY} L ${pointX} ${pointY} L ${endX} ${endY} Z`;
};

// Pre-built small star path for center
const SMALL_STAR_PATH = `
  M 100 80 
  L 105 90 
  L 115 92 
  L 108 100 
  L 110 110 
  L 100 105 
  L 90 110 
  L 92 100 
  L 85 92 
  L 95 90 
  Z
`;

export default function ConfidenceStar({ progress, childId }: ConfidenceStarProps) {
  if (!progress) return null;

  const getPillarProgress = (pillarId: number) => {
    const pillarProgress = progress.pillar_progress[pillarId];
    return pillarProgress ? Math.min((pillarProgress.completed / 100) * 100, 100) : 0;
  };

  const outerRadius = 80;
  const centerRadius = 25;

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-[600px] h-[600px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <defs>
            {/* Define clip paths for each star point */}
            {[0, 1, 2, 3, 4].map((index) => {
              const pillarId = index + 1;
              return (
                <clipPath key={`clip-${pillarId}`} id={`clip-${pillarId}`}>
                  <path d={createStarPoint(index, outerRadius, centerRadius)} />
                </clipPath>
              );
            })}
          </defs>

          {/* Star points with hover areas */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const progress = getPillarProgress(pillarId);
            const pointAngle = (index / 5) * 2 * Math.PI - Math.PI / 2;
            const tooltipX = 100 + Math.cos(pointAngle) * (outerRadius - 10);
            const tooltipY = 100 + Math.sin(pointAngle) * (outerRadius - 10);

            return (
              <g key={pillarId} className="group">
                {/* Base white star point */}
                <path
                  d={createStarPoint(index, outerRadius, centerRadius)}
                  fill="white"
                  stroke="black"
                  strokeWidth="1"
                  className="cursor-pointer"
                />
                
                {/* Colored fill with clip path */}
                <rect
                  x="0"
                  y={200 - (200 * progress) / 100}
                  width="200"
                  height={(200 * progress) / 100}
                  fill={PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS]}
                  clipPath={`url(#clip-${pillarId})`}
                  className="transition-all duration-500 ease-in-out"
                />
                
                {/* Reapply stroke to ensure clean edges */}
                <path
                  d={createStarPoint(index, outerRadius, centerRadius)}
                  fill="none"
                  stroke="black"
                  strokeWidth="1"
                  pointerEvents="none"
                />
                
                {/* Tooltip using SVG elements */}
                <g 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  transform={`translate(${tooltipX}, ${tooltipY})`}
                >
                  <rect
                    x="-60"
                    y="-20"
                    width="120"
                    height="40"
                    rx="4"
                    fill="#1F2937"
                  />
                  <text
                    x="0"
                    y="-5"
                    fill="white"
                    fontSize="6"
                    textAnchor="middle"
                  >
                    {PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES]}
                  </text>
                  <text
                    x="0"
                    y="10"
                    fill="white"
                    fontSize="8"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {Math.round(progress)}% complete
                  </text>
                </g>
              </g>
            );
          })}

          {/* Center star with glow effect */}
          <path
            d={SMALL_STAR_PATH}
            fill="#10B981"
            filter="url(#glow)"
          />
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
} 