import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { FeatureFlags } from '../../../backend/types';

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchFlags = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/flags', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch feature flags');
        }

        const data = await response.json();
        setFlags(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feature flags');
      } finally {
        setLoading(false);
      }
    };

    fetchFlags();
  }, [token]);

  return {
    flags,
    loading,
    error,
    isFeatureEnabled: (feature: keyof FeatureFlags) => flags?.[feature] ?? false,
  };
}; 