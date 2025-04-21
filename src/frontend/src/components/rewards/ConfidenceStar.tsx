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

const createStarPath = (cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): string => {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  let step = Math.PI / spikes;
  let path = '';
  path += `M ${cx} ${cy - outerRadius} `;
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
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

  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-6">
      <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">Confidence Star</h3>
      <div className="relative w-full max-w-[400px] mx-auto aspect-square">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Full-sized background star outline */}
          <path
            d={createStarPath(100, 100, 5, 80, 35)}
            fill="none"
            stroke="black"
            strokeWidth="2"
          />

          {/* Color-fill behind center star */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const data = progress.pillar_progress[pillarId];
            const completed = data?.completed || 0;
            const percent = Math.min(completed / MAX_CHALLENGES, 1);
            const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
            const baseRadius = 35;
            const fillRadius = baseRadius + ((80 - baseRadius) * percent);

            return (
              <path
                key={`pillar-${pillarId}`}
                d={`M 100 100 L ${100 + Math.cos(angle - 0.3) * fillRadius} ${100 + Math.sin(angle - 0.3) * fillRadius} 
                   L ${100 + Math.cos(angle) * fillRadius} ${100 + Math.sin(angle) * fillRadius} 
                   L ${100 + Math.cos(angle + 0.3) * fillRadius} ${100 + Math.sin(angle + 0.3) * fillRadius} Z`}
                fill={PILLAR_COLORS[pillarId as keyof typeof PILLAR_COLORS]}
              />
            );
          })}

          {/* Center green star */}
          <path
            d={createStarPath(100, 100, 5, 40, 20)}
            fill="#10B981"
          />

          {/* Hover tooltip areas */}
          {[0, 1, 2, 3, 4].map((index) => {
            const pillarId = index + 1;
            const data = progress.pillar_progress[pillarId];
            const completed = data?.completed || 0;
            const percent = Math.min(completed / MAX_CHALLENGES, 1);
            const angle = (index / 5) * 2 * Math.PI - Math.PI / 2;
            const labelX = 100 + Math.cos(angle) * 70;
            const labelY = 100 + Math.sin(angle) * 70;

            return (
              <g
                key={`tooltip-${pillarId}`}
                transform={`translate(${labelX}, ${labelY})`}
                className="group hover:opacity-100 opacity-0 transition-opacity duration-300"
              >
                <rect x={-40} y={-15} width={80} height={28} rx={4} fill="#1F2937" />
                <text x={0} y={-2} textAnchor="middle" fill="white" fontSize="6px">
                  {PILLAR_NAMES[pillarId as keyof typeof PILLAR_NAMES].split('&')[0]}
                </text>
                <text x={0} y={9} textAnchor="middle" fill="white" fontSize="7px" fontWeight="bold">
                  {Math.round(percent * 100)}% ({completed})
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
} 