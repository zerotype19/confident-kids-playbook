import React, { useState, useEffect } from 'react';
import { useChildContext } from '../contexts/ChildContext';
import { Pillar } from '../types';
import ChildSelector from '../components/dashboard/ChildSelector';
import { Child } from '../types';
import ExpandedPillar from '../components/pillars/ExpandedPillar';

export default function PillarsPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const [children, setChildren] = useState<Child[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch children on component mount
  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/children`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch children');
        }

        const data = await response.json();
        setChildren(data);
        
        // Auto-select first child if only one exists
        if (data.length === 1 && !selectedChild) {
          setSelectedChild(data[0]);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children');
      }
    };

    fetchChildren();
  }, [setSelectedChild, selectedChild]);

  // Fetch pillars when selected child changes
  useEffect(() => {
    const fetchPillars = async () => {
      if (!selectedChild) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars?child_id=${selectedChild.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch pillars');
        }

        const data = await response.json();
        setPillars(data);
      } catch (err) {
        console.error('Error fetching pillars:', err);
        setError('Failed to load pillars');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPillars();
  }, [selectedChild]);

  if (!selectedChild) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">Please select a child to view their pillars</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading pillars...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-heading text-gray-900">Pillars of Growth</h1>
        <ChildSelector children={children} />
      </div>

      <div className="space-y-6">
        {pillars.map((pillar) => (
          <ExpandedPillar
            key={pillar.id}
            pillar={pillar}
            childId={selectedChild.id}
          />
        ))}
      </div>
    </div>
  );
} 