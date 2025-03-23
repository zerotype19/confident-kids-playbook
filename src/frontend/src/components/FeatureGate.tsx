import React from 'react';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { FeatureFlags } from '../../../backend/types';

interface FeatureGateProps {
  feature: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  children,
  fallback = (
    <div className="p-4 text-center bg-gray-50 rounded-lg">
      <div className="text-gray-600 mb-2">This feature requires a premium subscription</div>
      <a
        href="/settings/subscription"
        className="inline-block px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        Upgrade Now
      </a>
    </div>
  ),
}) => {
  const { isFeatureEnabled, loading } = useFeatureFlags();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isFeatureEnabled(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}; 