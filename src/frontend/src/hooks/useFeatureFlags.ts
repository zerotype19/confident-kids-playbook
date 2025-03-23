import { useState, useEffect } from 'react';
import { FeatureFlags } from '../../../types';

export const useFeatureFlags = () => {
  const [flags, setFlags] = useState<FeatureFlags>({
    'premium.dashboard_insights': false
  });

  useEffect(() => {
    // TODO: Replace with actual API call to fetch feature flags
    const fetchFlags = async () => {
      try {
        // Mock API call
        const response = await fetch('/api/feature-flags');
        const data = await response.json();
        setFlags(data);
      } catch (error) {
        console.error('Error fetching feature flags:', error);
      }
    };

    fetchFlags();
  }, []);

  return flags;
}; 