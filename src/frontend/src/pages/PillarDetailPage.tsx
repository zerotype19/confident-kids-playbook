import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { Pillar } from '../types';
import ExpandedPillar from '../components/pillars/ExpandedPillar';

export default function PillarDetailPage() {
  const { pillarId } = useParams<{ pillarId: string }>();
  const { selectedChild } = useChildContext();
  const [pillar, setPillar] = useState<Pillar | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPillarData = async () => {
      if (!pillarId || !selectedChild) return;

      setIsLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch pillar details
        const pillarResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/pillars/${pillarId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!pillarResponse.ok) {
          throw new Error('Failed to fetch pillar details');
        }

        const pillarData = await pillarResponse.json();
        setPillar(pillarData);
      } catch (err) {
        console.error('Error fetching pillar data:', err);
        setError('Failed to load pillar data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPillarData();
  }, [pillarId, selectedChild]);

  if (!selectedChild) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please select a child to view pillar details</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading pillar details...</div>;
  }

  if (error || !pillar) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error || 'Pillar not found'}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ExpandedPillar pillar={pillar} childId={selectedChild.id} />
    </div>
  );
} 