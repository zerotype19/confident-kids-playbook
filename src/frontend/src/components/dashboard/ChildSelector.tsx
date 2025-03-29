import React from 'react';
import { Child } from '../../types';

interface ChildSelectorProps {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
}

export default function ChildSelector({ children, selectedChild, onSelectChild }: ChildSelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-kidoova p-4">
      <h2 className="text-lg font-semibold text-kidoova-green mb-4">Select Child</h2>
      <div className="space-y-2">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelectChild(child)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedChild?.id === child.id
                ? 'bg-kidoova-accent text-white'
                : 'hover:bg-kidoova-background text-text-base'
            }`}
          >
            {child.name}
          </button>
        ))}
      </div>
    </div>
  );
} 