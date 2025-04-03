import React, { useState, useRef, useEffect } from 'react';
import { Child } from '../../types';
import { useChildContext } from '../../contexts/ChildContext';

interface ChildSelectorProps {
  children?: Child[];
}

export default function ChildSelector({ children: propChildren }: ChildSelectorProps) {
  const { selectedChild, setSelectedChild, children: contextChildren, isLoading } = useChildContext();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Use children from props if provided, otherwise use from context
  const children = propChildren || contextChildren;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="relative inline-block w-48 sm:w-56 text-left">
        <div className="w-full inline-flex justify-between items-center rounded-xl bg-gray-200 text-white font-bold px-4 py-2 shadow-kidoova">
          <span className="truncate">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative inline-block w-48 sm:w-56 text-left" ref={dropdownRef}>
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full inline-flex justify-between items-center rounded-xl bg-kidoova-accent text-white font-bold px-4 py-2 shadow-kidoova hover:bg-kidoova-green transition"
        >
          <span className="truncate">
            {selectedChild ? selectedChild.name : 'Select Child'}
          </span>
          <svg
            className={`ml-2 h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {isOpen && children && children.length > 0 && (
        <div className="absolute right-0 mt-2 w-48 sm:w-56 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => {
                  setSelectedChild(child);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  selectedChild?.id === child.id
                    ? 'bg-kidoova-accent text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                role="menuitem"
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 