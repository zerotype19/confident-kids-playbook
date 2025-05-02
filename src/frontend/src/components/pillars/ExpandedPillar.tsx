import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../../contexts/ChildContext';

interface ExpandedPillarProps {
  pillar: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    progress: number;
    challenge_types: Array<{
      pillar_id: number;
      challenge_type_id: number;
      name: string;
      description: string;
    }>;
  };
  childId: string;
}

export default function ExpandedPillar({ pillar, childId }: ExpandedPillarProps) {
  const navigate = useNavigate();
  const { selectedChild } = useChildContext();
  const [isExpanded, setIsExpanded] = useState(false);

  // Function to truncate text to 15-20 words
  const truncateDescription = (text: string) => {
    const words = text.split(' ');
    if (words.length <= 20) return text;
    return words.slice(0, 20).join(' ') + '...';
  };

  const handleViewAll = () => {
    navigate(`/all-challenges?pillar=${pillar.id}`);
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-6">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-start gap-4 bg-white hover:bg-gray-50 transition-colors border-0 focus:outline-none focus:ring-0 appearance-none cursor-pointer"
        style={{ backgroundColor: 'white' }}
      >
        <span className="text-4xl">{pillar.icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading text-gray-900">{pillar.name}</h2>
            <span className="text-gray-500 text-xl font-medium">
              {isExpanded ? '−' : '+'}
            </span>
          </div>
          <p className="text-gray-600 mt-1">
            {isExpanded ? pillar.description : truncateDescription(pillar.description)}
          </p>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>{selectedChild?.name}'s Progress</span>
              <span>{Math.round(pillar.progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${pillar.progress}%`,
                  backgroundColor: pillar.color
                }}
              />
            </div>
          </div>
        </div>
      </button>

      {isExpanded && (
        <div className="p-6">
          <h3 className="text-lg font-heading text-gray-900 mb-4">Challenge Types</h3>
          <div className="space-y-4">
            {pillar.challenge_types.map((type) => (
              <div key={`${type.pillar_id}-${type.challenge_type_id}`} className="bg-kidoova-background rounded-xl p-4 shadow-yellowSoft">
                <h3 className="text-lg font-semibold text-kidoova-green mb-2">{type.name}</h3>
                <p className="text-text-base">{type.description}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleViewAll}
            className="mt-6 w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            View All Challenges
          </button>
        </div>
      )}
    </div>
  );
} 