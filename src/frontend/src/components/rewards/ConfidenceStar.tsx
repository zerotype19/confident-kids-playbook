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

const createPartialStarPointPath = (
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  index: number,
  fillRatio: number
): string => {
  const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
  const angleLeft = angle - Math.PI / 5;
  const angleRight = angle + Math.PI / 5;
  const currentRadius = innerRadius + (outerRadius - innerRadius) * fillRatio;

  const x0 = cx;
  const y0 = cy;
  const x1 = cx + Math.cos(angleLeft) * innerRadius;
  const y1 = cy + Math.sin(angleLeft) * innerRadius;
  const x2 = cx + Math.cos(angle) * currentRadius;
  const y2 = cy + Math.sin(angle) * currentRadius;
  const x3 = cx + Math.cos(angleRight) * innerRadius;
  const y3 = cy + Math.sin(angleRight) * innerRadius;

  return `M ${x0} ${y0} L ${x1} ${y1} L ${x2} ${y2} L ${x3} ${y3} Z`;
};

const createCenterStarPath = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): string => {
  let rot = Math.PI / 2 * 3;
  let step = Math.PI / spikes;
  let path = '';
  path += `M ${cx} ${cy - outerRadius} `;
  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius;
    let y = cy + Math.sin(rot) * outerRadius;
    path += `L ${x} ${y} `;
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    path += `L ${x} ${y} `;
    rot += step;
  }
  path += 'Z';
  return path;
};

export default function ConfidenceStar({ progress, childId }: ConfidenceStarProps) {
  if (!progress) return null;

  const MAX_CHALLENGES = 100;
  const cx = 100;
  const cy = 100;
  const outerRadius = 80;
  const innerRadius = 40;
  const centerStarOuter = 40;
  const centerStarInner = 20;

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-full max-w-[400px] mx-auto aspect-square overflow-visible">
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          {[0, 1, 2, 3, 4].map(index => {
            const pillarId = index + 1;
            const completed = progress.pillar_progress[pillarId]?.completed || 0;
            const fillRatio = Math.min(completed / MAX_CHALLENGES, 1);

            if (fillRatio === 0) return null;

            return (
              <path
                key={`point-${pillarId}`}
                d={createPartialStarPointPath(cx, cy, innerRadius, outerRadius, index, fillRatio)}
                fill={PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS]}
              />
            );
          })}

          <path
            d={createCenterStarPath(cx, cy, 5, centerStarOuter, centerStarInner)}
            fill="#10B981"
          />

          <path
            d={createCenterStarPath(cx, cy, 5, outerRadius, innerRadius)}
            fill="none"
            stroke="black"
            strokeWidth="2"
          />

          {[0, 1, 2, 3, 4].map(index => {
            const pillarId = index + 1;
            const angle = (Math.PI * 2 * index) / 5 - Math.PI / 2;
            const labelX = cx + Math.cos(angle) * 85;
            const labelY = cy + Math.sin(angle) * 85;
            const completed = progress.pillar_progress[pillarId]?.completed || 0;
            const fillRatio = Math.min(completed / MAX_CHALLENGES, 1);

            return (
              <g
                key={`tooltip-${pillarId}`}
                transform={`translate(${labelX}, ${labelY})`}
                className="group hover:opacity-100 opacity-0 transition-opacity duration-300 pointer-events-auto"
              >
                <rect x={-38} y={-13} width={76} height={26} rx={4} fill="#1F2937" />
                <text x={0} y={-1} textAnchor="middle" fill="white" fontSize="6px">
                  {PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES].split('&')[0]}
                </text>
                <text x={0} y={8} textAnchor="middle" fill="white" fontSize="7px" fontWeight="bold">
                  {Math.round(fillRatio * 100)}% ({completed})
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
