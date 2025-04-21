import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { fetchWithAuth } from '../lib/auth';

interface ThemeWeek {
  week_number: number;
  title: string;
  description: string;
  pillar_name: string;
  pillar_icon: string;
  pillar_color: string;
}

const fetchTheme = async (): Promise<ThemeWeek> => {
  const response = await fetchWithAuth('/api/dashboard/theme');
  if (!response.ok) {
    throw new Error('Failed to fetch theme');
  }
  return response.json();
};

export const ThemeCard: React.FC = () => {
  const { data: theme, isLoading, error } = useQuery<ThemeWeek>({
    queryKey: ['currentTheme'],
    queryFn: fetchTheme,
  });

  if (isLoading) {
    return (
      <Card sx={{ mb: 2, minHeight: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Card>
    );
  }

  if (error || !theme) {
    return (
      <Card sx={{ mb: 2, minHeight: 200 }}>
        <CardContent>
          <Typography color="error">
            Unable to load this week's theme. Please try again later.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box
            component="span"
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              backgroundColor: theme.pillar_color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 3,
              fontSize: '1.5rem'
            }}
          >
            {theme.pillar_icon}
          </Box>
          <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
            This Week's Theme
          </Typography>
        </Box>
        <Typography variant="h3" component="div" gutterBottom sx={{ 
          fontWeight: 700,
          mb: 3,
          color: 'text.primary'
        }}>
          {theme.title}
        </Typography>
        <div className="flex items-center gap-3 text-lg text-gray-600">
          <span className="font-medium">{theme.description}</span>
          <span className="text-gray-400">|</span>
          <span className="font-semibold">Week {theme.week_number}</span>
        </div>
      </CardContent>
    </Card>
  );
}; 