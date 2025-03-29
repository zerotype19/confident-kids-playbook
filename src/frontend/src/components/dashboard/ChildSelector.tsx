import React from 'react';
import { Child } from '../../types';

interface ChildSelectorProps {
  selectedChild: Child | null;
  onChildSelect: (child: Child | null) => void;
  children: Child[];
  loading?: boolean;
  error?: string | null;
}

export default function ChildSelector({ 
  selectedChild, 
  onChildSelect, 
  children,
  loading = false,
  error = null
}: ChildSelectorProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <div className="text-red-600 text-sm">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Child</h2>
      <div className="space-y-2">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onChildSelect(child)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedChild?.id === child.id
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              {child.avatar_url ? (
                <img
                  src={child.avatar_url}
                  alt={child.name}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 text-sm">
                    {child.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <div className="font-medium">{child.name}</div>
                <div className="text-sm text-gray-500">{child.age_range}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 