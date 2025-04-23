import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ConfidenceData } from '../utils/confidenceTrend';

const emojiMap = ['😖', '😐', '🙂', '😄', '🤩'];
const labelMap = ['Not Confident', 'A Little Unsure', 'Feeling Okay', 'Pretty Confident', 'Super Confident'];

interface ConfidenceTrendChartProps {
  data: ConfidenceData[];
  summary: string;
}

export default function ConfidenceTrendChart({ data, summary }: ConfidenceTrendChartProps) {
  if (data.length < 7) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h3 className="text-2xl font-heading text-kidoova-green mb-4 text-center">Confidence Trend</h3>
        <p className="text-center text-gray-600">
          Complete 7 challenges to see your confidence trend
        </p>
      </div>
    );
  }

  const chartData = [...data].reverse().map(d => ({
    ...d,
    emoji: emojiMap[d.feeling - 1],
    label: labelMap[d.feeling - 1],
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
      <h3 className="text-2xl font-heading text-kidoova-green mb-4 text-center">Confidence Trend</h3>
      <div className="relative w-full max-w-[600px] mx-auto">
        <div className="w-full h-[300px] sm:h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={chartData} 
              margin={{ top: 10, right: 20, bottom: 10, left: 20 }}
            >
              <XAxis 
                dataKey="date" 
                stroke="#6B7280"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                tick={{ fontSize: 12 }}
                padding={{ left: 10, right: 10 }}
              />
              <YAxis
                domain={[1, 5]}
                tickFormatter={(val) => emojiMap[val - 1]}
                stroke="#6B7280"
                tick={{ fontSize: 16 }}
                padding={{ top: 10, bottom: 10 }}
              />
              <Tooltip 
                formatter={(val) => labelMap[val as number - 1]}
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              />
              <Line
                type="monotone"
                dataKey="feeling"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 6 }}
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      {summary && (
        <p className="mt-1 text-center text-sm text-gray-700 italic">{summary}</p>
      )}
    </div>
  );
} 