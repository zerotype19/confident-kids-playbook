import React from 'react';
import { ProgressSummary } from '../../types';

interface ConfidenceStarProps {
  progress: ProgressSummary | null;
  childId: string;
  childName: string;
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

export default function ConfidenceStar({ progress, childId, childName }: ConfidenceStarProps) {
  if (!progress) return null;

  const MAX_XP = 150; // 150 XP required per pillar
  const cx = 100;
  const cy = 100;
  const outerRadius = 80;
  const innerRadius = 40;
  const centerStarOuter = 40;
  const centerStarInner = 20;

  // Use star_fill_progress for each pillar, fallback to XP if missing or all zeros
  let starFill = progress.star_fill_progress || {};
  // If star_fill is missing or all zeros, fallback to XP calculation
  const allZeroOrMissing = [1,2,3,4,5].every(pid => !starFill[pid] || starFill[pid] === 0);
  if (allZeroOrMissing && progress.pillar_progress) {
    starFill = {};
    for (let pid = 1; pid <= 5; pid++) {
      const xp = progress.pillar_progress[pid]?.xp || 0;
      starFill[pid] = (xp % 150) / 150;
    }
  }
  const completedStars = progress.completed_stars_count || 0;
  const completedStarDates = progress.completed_stars || [];

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
      <h2 className="text-2xl font-heading text-kidoova-green mb-2 text-center">{childName}'s Confidence Star</h2>
      <p className="text-sm text-gray-600 mb-2 text-center">Earn 150 XP in each pillar to complete a star. Stars are cumulative!</p>
      <div className="flex flex-col items-center mb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">⭐️</span>
          <span className="font-bold text-lg">{completedStars} Completed Star{completedStars === 1 ? '' : 's'}</span>
        </div>
        {completedStarDates.length > 0 && (
          <div className="text-xs text-gray-500 text-center">
            {completedStarDates.map(star => (
              <div key={star.star_number}>
                Star {star.star_number}: {new Date(star.date_completed).toLocaleDateString()}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="relative w-full max-w-[400px] mx-auto aspect-square overflow-visible">
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
          {[0, 1, 2, 3, 4].map(index => {
            const pillarId = index + 1;
            const fillRatio = starFill[pillarId] ?? 0;
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
            const fillRatio = starFill[pillarId] ?? 0;
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
                  {Math.round(fillRatio * 100)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
