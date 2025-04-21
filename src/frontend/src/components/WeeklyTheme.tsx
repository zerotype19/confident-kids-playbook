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

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/dashboard/theme`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch theme');
        }

        const data = await response.json();
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
      <div className="bg-white rounded-xl shadow-xl p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error || !theme) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
      <div className="flex items-center gap-4 mb-4">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
          style={{ backgroundColor: theme.pillar_color + '20' }}
        >
          {theme.pillar_icon}
        </div>
        <div>
          <h2 className="text-xl font-heading mb-1">This Week's Theme</h2>
          <p className="text-sm text-gray-600">Week {theme.week_number}</p>
        </div>
      </div>
      
      <div className="space-y-3">
        <h3 className="text-lg font-medium text-gray-900">{theme.title}</h3>
        <p className="text-gray-600">{theme.description}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500">Focus Area:</span>
          <span 
            className="font-medium px-3 py-1 rounded-full text-sm"
            style={{ 
              backgroundColor: theme.pillar_color + '20',
              color: theme.pillar_color
            }}
          >
            {theme.pillar_name}
          </span>
        </div>
      </div>
    </div>
  );
} 