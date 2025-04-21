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

// Create the outer star point shape
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
  const centerRadius = 35;

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-[600px] h-[600px] mx-auto">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Center star — filled polygon */}
          <polygon
            points="100,50 117,85 155,90 127,115 135,155 100,135 65,155 73,115 45,90 83,85"
            fill="#10B981"
          />

          {/* Outer star points */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const data = progress.pillar_progress[pillarId];
            const completed = data?.completed || 0;
            const percent = Math.min((completed / MAX_CHALLENGES) * 100, 100);
            const isOver = completed > MAX_CHALLENGES;

            const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
            const tooltipX = 100 + Math.cos(angle) * (outerRadius + 12);
            const tooltipY = 100 + Math.sin(angle) * (outerRadius + 12);

            const pathId = `clip-${pillarId}`;
            const fullPath = createStarPointPath(index, outerRadius, innerRadius);

            return (
              <g key={`pillar-${pillarId}`} className="group">
                {/* Define clipping mask */}
                <defs>
                  <clipPath id={pathId}>
                    <path d={fullPath} />
                  </clipPath>
                </defs>

                {/* Outline */}
                <path
                  d={fullPath}
                  fill="white"
                  stroke="black"
                  strokeWidth="1.5"
                />

                {/* Fill using rect + clip */}
                <rect
                  x="0"
                  y={200 - 200 * (percent / 100)}
                  width="200"
                  height={200 * (percent / 100)}
                  fill={PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS]}
                  clipPath={`url(#${pathId})`}
                  className="transition-all duration-300 ease-in-out"
                />

                {/* Glow if over 100 */}
                {isOver && (
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
                  <rect x={-45} y={-15} width={90} height={28} rx={4} fill="#1F2937" />
                  <text x={0} y={-2} textAnchor="middle" fill="white" fontSize="6px">
                    {PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES].split('&')[0]}
                  </text>
                  <text
                    x={0}
                    y={9}
                    textAnchor="middle"
                    fill="white"
                    fontSize="7px"
                    fontWeight="bold"
                  >
                    {Math.round(percent)}% ({completed})
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