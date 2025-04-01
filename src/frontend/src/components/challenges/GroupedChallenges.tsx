import React, { useState } from 'react';
import ChallengeCard from './ChallengeCard';
import { Challenge } from '../../types';

interface GroupedChallengesProps {
  challenges: Challenge[];
  childId: string;
  itemsPerPage?: number;
}

export default function GroupedChallenges({ 
  challenges, 
  childId, 
  itemsPerPage = 9 
}: GroupedChallengesProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  // Group challenges by title
  const groupedChallenges = challenges.reduce((acc, challenge) => {
    const title = challenge.title;
    if (!acc[title]) {
      acc[title] = [];
    }
    acc[title].push(challenge);
    return acc;
  }, {} as Record<string, Challenge[]>);

  // Convert grouped challenges to array and sort by title
  const sortedGroups = Object.entries(groupedChallenges)
    .sort(([titleA], [titleB]) => titleA.localeCompare(titleB));

  // Calculate pagination
  const totalPages = Math.ceil(sortedGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = sortedGroups.slice(startIndex, endIndex);

  return (
    <div className="space-y-8">
      {/* Challenge Groups */}
      <div className="space-y-8">
        {currentGroups.map(([title, challenges]) => (
          <div key={title} className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 border-b pb-2">
              {title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  childId={childId}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="px-4 py-2 text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
} 