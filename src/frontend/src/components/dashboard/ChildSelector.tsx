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

  // Add debug logging
  useEffect(() => {
    console.log('🎯 ChildSelector - Context Children:', contextChildren);
    console.log('🎯 ChildSelector - Prop Children:', propChildren);
    console.log('🎯 ChildSelector - Final Children:', children);
    console.log('🎯 ChildSelector - Selected Child:', selectedChild);
    console.log('🎯 ChildSelector - Is Loading:', isLoading);
    console.log('🎯 ChildSelector - Children Length:', children?.length);
    console.log('🎯 ChildSelector - Children Array:', children);
  }, [contextChildren, propChildren, children, selectedChild, isLoading]);

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
          className="w-full inline-flex justify-between items-center rounded-xl bg-gray-200 text-gray-700 font-bold px-4 py-2 shadow-kidoova hover:bg-gray-300 transition"
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
                  console.log('👆 Child selected:', child);
                  setSelectedChild(child);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  selectedChild?.id === child.id
                    ? 'bg-gray-200 text-gray-700'
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