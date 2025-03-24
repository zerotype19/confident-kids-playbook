import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useFeatureFlags } from '../hooks/useFeatureFlags';

interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export const BillingSettingsPage: React.FC = () => {
  const { child_id } = useParams<{ child_id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isPremium, refreshFlags } = useFeatureFlags();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        const response = await fetch(`/api/billing/status?child_id=${child_id}`);
        if (!response.ok) throw new Error('Failed to fetch subscription status');
        const data = await response.json();
        setSubscription(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription status');
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [child_id]);

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Upgrade error:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/billing/create-portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ child_id }),
      });
      
      if (!response.ok) throw new Error('Failed to create portal session');
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open customer portal');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing Settings</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Subscription Status</h3>
            <p className="text-gray-600">
              {isPremium ? 'Premium Member' : 'Free Account'}
            </p>
          </div>

          {!isPremium && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Upgrade to Premium</h3>
              <p className="text-gray-600 mb-4">
                Get access to all premium features including advanced insights, practice modules, and more.
              </p>
              <button
                onClick={handleUpgrade}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 