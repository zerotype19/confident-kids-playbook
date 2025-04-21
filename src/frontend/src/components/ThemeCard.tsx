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
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            component="span"
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: theme.pillar_color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mr: 2,
            }}
          >
            {theme.pillar_icon}
          </Box>
          <Typography variant="h6" component="div">
            This Week's Theme
          </Typography>
        </Box>
        <Typography variant="h5" component="div" gutterBottom>
          {theme.title}
        </Typography>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>{theme.description}</span>
          <span>|</span>
          <span>Week {theme.week_number}</span>
        </div>
      </CardContent>
    </Card>
  );
}; 