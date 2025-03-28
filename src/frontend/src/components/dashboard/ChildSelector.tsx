import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Child {
  id: string;
  name: string;
  age_range: string;
}

interface ChildSelectorProps {
  selectedChildId: string | null;
  onSelectChild: (childId: string) => void;
}

export default function ChildSelector({ selectedChildId, onSelectChild }: ChildSelectorProps): JSX.Element {
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/');
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/children`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch children');
        }

        const data = await response.json();
        setChildren(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch children');
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [navigate]);

  if (loading) {
    return <div className="text-sm text-gray-600">Loading children...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Select Child</h2>
        <button
          onClick={() => navigate('/onboarding/child')}
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm"
        >
          Add Child
        </button>
      </div>

      <div className="space-y-2">
        {children.map((child) => (
          <button
            key={child.id}
            onClick={() => onSelectChild(child.id)}
            className={`w-full text-left p-3 rounded-lg border ${
              selectedChildId === child.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="font-medium">{child.name}</div>
            <div className="text-sm text-gray-600">{child.age_range}</div>
          </button>
        ))}
      </div>
    </div>
  );
} 