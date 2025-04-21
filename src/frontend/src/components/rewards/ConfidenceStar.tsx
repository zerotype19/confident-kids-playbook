import React from 'react';
import { ProgressSummary } from '../../types';

interface ConfidenceStarProps {
  progress: ProgressSummary | null;
  childId: string;
}

const PILLAR_COLORS = {
  1: '#F7B801', // Independence
  2: '#38A169', // Growth Mindset
  3: '#4299E1', // Social
  4: '#805AD5', // Purpose
  5: '#E53E3E'  // Fear
};

const PILLAR_NAMES = {
  1: 'Independence & Problem-Solving',
  2: 'Growth Mindset & Resilience',
  3: 'Social Confidence & Communication',
  4: 'Purpose & Strength Discovery',
  5: 'Managing Fear & Anxiety'
};

const createStarPointPath = (
  index: number,
  outerRadius: number,
  innerRadius: number
): string => {
  const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
  const angleOffset = (1 / 10) * 2 * Math.PI;

  const startX = 100 + Math.cos(angle - angleOffset) * innerRadius;
  const startY = 100 + Math.sin(angle - angleOffset) * innerRadius;
  const tipX = 100 + Math.cos(angle) * outerRadius;
  const tipY = 100 + Math.sin(angle) * outerRadius;
  const endX = 100 + Math.cos(angle + angleOffset) * innerRadius;
  const endY = 100 + Math.sin(angle + angleOffset) * innerRadius;

  return `M ${startX} ${startY} L ${tipX} ${tipY} L ${endX} ${endY} Z`;
};

export default function ConfidenceStar({ progress, childId }: ConfidenceStarProps) {
  if (!progress) return null;

  const MAX_CHALLENGES = 100;
  const outerRadius = 80;
  const innerRadius = 35;

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
                  <path d={createStarPointPath(index, outerRadius, innerRadius)} />
                </clipPath>
              );
            })}
            {/* Drop shadow filter for center star */}
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Center green star */}
          <polygon
            points="100,75 108,90 125,92 112,102 116,120 100,110 84,120 88,102 75,92 92,90"
            fill="#10B981"
            filter="url(#glow)"
            className="drop-shadow-lg"
          />

          {/* Outer points */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const data = progress.pillar_progress[pillarId];

            const completed = data?.completed || 0;
            const cappedPercent = Math.min((completed / MAX_CHALLENGES) * 100, 100);
            const isOverachieved = completed > MAX_CHALLENGES;

            const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
            const tooltipX = 100 + Math.cos(angle) * (outerRadius + 10);
            const tooltipY = 100 + Math.sin(angle) * (outerRadius + 10);

            return (
              <g key={`pillar-${pillarId}`} className="group">
                {/* Outline base shape */}
                <path
                  d={createStarPointPath(index, outerRadius, innerRadius)}
                  fill="white"
                  stroke="black"
                  strokeWidth="1.5"
                />

                {/* Fill using clip path */}
                <rect
                  x="0"
                  y={200 - (200 * cappedPercent) / 100}
                  width="200"
                  height={(200 * cappedPercent) / 100}
                  fill={PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS]}
                  clipPath={`url(#clip-${pillarId})`}
                  className="transition-all duration-300 ease-in-out"
                />

                {/* Glow effect for >100 completions */}
                {isOverachieved && (
                  <path
                    d={createStarPointPath(index, outerRadius, innerRadius)}
                    fill="none"
                    stroke={PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS]}
                    strokeWidth="4"
                    className="animate-pulse opacity-50"
                  />
                )}

                {/* Tooltip */}
                <g
                  transform={`translate(${tooltipX}, ${tooltipY})`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ zIndex: 10 }}
                >
                  <rect x={-50} y={-16} width={100} height={32} rx={4} fill="#1F2937" />
                  <text x={0} y={-3} textAnchor="middle" fill="white" fontSize="6px">
                    {PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES].split('&')[0].trim()}
                  </text>
                  <text x={0} y={9} textAnchor="middle" fill="white" fontSize="7px" fontWeight="bold">
                    {Math.round(cappedPercent)}% ({completed})
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
} 