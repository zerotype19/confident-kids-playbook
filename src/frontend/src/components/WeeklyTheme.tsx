import { useEffect, useState } from 'react';

interface ThemeWeek {
  id: string;
  week_number: number;
  pillar_id: number;
  title: string;
  description: string;
  pillar_name: string;
  pillar_icon: string;
  pillar_color: string;
}

export default function WeeklyTheme() {
  const [theme, setTheme] = useState<ThemeWeek | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        console.log('Fetching theme from:', `${import.meta.env.VITE_API_URL}/api/dashboard/theme`);
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/theme`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('Theme response status:', response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Theme fetch error:', errorData);
          throw new Error(errorData.error || 'Failed to fetch theme');
        }

        const data = await response.json();
        console.log('Theme data received:', data);
        setTheme(data);
      } catch (err) {
        console.error('Error fetching theme:', err);
        setError(err instanceof Error ? err.message : 'Failed to load theme');
      } finally {
        setLoading(false);
      }
    };

    fetchTheme();
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    console.error('Theme error state:', error);
    return (
      <div className="mb-6">
        <div className="text-red-500">
          <p>Unable to load this week's theme.</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!theme) {
    console.log('No theme data available');
    return null;
  }

  return (
    <div className="mb-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-5xl"
          >
            {theme.pillar_icon}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">This week's training theme:</p>
            <h2 className="text-3xl font-heading">{theme.title}</h2>
            <p className="text-lg text-gray-600 -mt-1">
              {theme.description} - Week {theme.week_number}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 