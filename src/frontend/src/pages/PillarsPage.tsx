import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useChildContext } from '../contexts/ChildContext';
import { useAuth } from '../contexts/AuthContext';
import { Pillar, Child } from '../types';
import CustomButton from '../components/CustomButton';
import PillarCard from '../components/pillars/PillarCard';

export default function PillarsPage() {
  const { selectedChild, setSelectedChild } = useChildContext();
  const [children, setChildren] = useState<Child[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePillarSelect = (pillarId: string) => {
    navigate(`/pillars/${pillarId}`);
  };

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
        if (!data.success) {
          throw new Error('API response indicated failure');
        }
        if (!Array.isArray(data.children)) {
          throw new Error('Invalid response format: children is not an array');
        }
        setChildren(data.children);
        
        // Auto-select first child if only one exists
        if (data.children.length === 1 && !selectedChild) {
          setSelectedChild(data.children[0]);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-kidoova-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Error loading pillars</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-heading text-gray-900">Pillars</h1>
        </div>

        {selectedChild ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((pillar) => (
              <PillarCard
                key={pillar.id}
                pillar={pillar}
                childId={selectedChild.id}
                onClick={() => handlePillarSelect(pillar.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please select a child to view their pillars</p>
            <CustomButton onClick={() => navigate('/manage-children')}>
              Manage Children
            </CustomButton>
          </div>
        )}
      </div>
    </div>
  );
} 