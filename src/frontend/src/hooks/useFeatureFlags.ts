import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureFlags, FeatureFlagsResponse } from '../types';

export const useFeatureFlags = (): FeatureFlagsResponse & { isPremium: boolean; refreshFlags: () => Promise<void> } => {
  const { token } = useAuth();
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlags = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/feature-flags`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch feature flags');
      }

      const data = await response.json();
      setFlags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch feature flags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchFlags();
    }
  }, [token]);

  const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
    return flags?.[feature] ?? false;
  };

  const isPremium = isFeatureEnabled('premium.dashboard_insights');

  return {
    flags,
    loading,
    error,
    isFeatureEnabled,
    isPremium,
    refreshFlags: fetchFlags,
  };
}; 