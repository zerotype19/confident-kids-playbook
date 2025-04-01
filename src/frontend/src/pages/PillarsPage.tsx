import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { Pillar } from '../types';
import PillarCard from '../components/pillars/PillarCard';

export default function PillarsPage() {
  const navigate = useNavigate();
  const { selectedChild } = useChildContext();
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPillars = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars`,
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
  }, []);

  if (!selectedChild) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please select a child to view pillars</p>
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-heading text-gray-900">Pillars of Growth</h1>
        <p className="text-gray-600">Track your child's progress across different areas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pillars.map((pillar) => (
          <PillarCard
            key={pillar.id}
            pillar={pillar}
            childId={selectedChild.id}
            onClick={() => navigate(`/pillars/${pillar.id}`)}
          />
        ))}
      </div>
    </div>
  );
} 