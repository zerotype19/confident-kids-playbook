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
  const centerRadius = 25;

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-[600px] h-[600px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Center green star */}
          {[0, 1, 2, 3, 4].map((index) => (
            <path
              key={`center-${index}`}
              d={createStarPointPath(index, centerRadius, centerRadius * 0.4)}
              fill="#10B981"
              stroke="none"
            />
          ))}

          {/* Outer points */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const data = progress.pillar_progress[pillarId];

            const completed = data?.completed || 0;
            const cappedPercent = Math.min((completed / MAX_CHALLENGES) * 100, 100);
            const isOverachieved = completed > MAX_CHALLENGES;

            const fillOuter = centerRadius + ((outerRadius - centerRadius) * (cappedPercent / 100));
            const fullPath = createStarPointPath(index, outerRadius, innerRadius);
            const fillPath = createStarPointPath(index, fillOuter, innerRadius);

            const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
            const tooltipX = 100 + Math.cos(angle) * (outerRadius + 12);
            const tooltipY = 100 + Math.sin(angle) * (outerRadius + 12);

            return (
              <g key={`pillar-${pillarId}`} className="group">
                {/* Outline base shape */}
                <path
                  d={fullPath}
                  fill="white"
                  stroke="black"
                  strokeWidth="1.5"
                />

                {/* Fill */}
                <path
                  d={fillPath}
                  fill={PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS]}
                  className="transition-all duration-300 ease-in-out"
                />

                {/* Glow effect for >100 completions */}
                {isOverachieved && (
                  <path
                    d={fullPath}
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
                >
                  <rect x={-60} y={-20} width={120} height={40} rx={6} fill="#1F2937" />
                  <text x={0} y={-4} textAnchor="middle" fill="white" fontSize="7px">
                    {PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES]}
                  </text>
                  <text x={0} y={10} textAnchor="middle" fill="white" fontSize="9px" fontWeight="bold">
                    {Math.round(cappedPercent)}% complete ({completed} challenges)
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