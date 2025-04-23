export interface ConfidenceData {
  date: string;
  feeling: number;
}

export function getConfidenceSummary(data: ConfidenceData[]): string {
  if (data.length < 2) return 'Let\'s keep tracking your confidence!';

  const recent = [...data].reverse().map(d => d.feeling);
  const deltas = [];

  for (let i = 1; i < recent.length; i++) {
    deltas.push(recent[i] - recent[i - 1]);
  }

  const averageChange = deltas.reduce((a, b) => a + b, 0) / deltas.length;

  if (averageChange > 0.2) return 'You\'re trending upward — keep it up!';
  if (averageChange < -0.2) return 'Confidence has dipped a bit — let\'s keep practicing!';
  return 'You\'re staying steady — nice work!';
} 