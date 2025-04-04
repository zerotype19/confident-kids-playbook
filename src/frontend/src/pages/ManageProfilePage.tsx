import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { SubscriptionModal } from '../components/SubscriptionModal';

interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export const ManageProfilePage: React.FC = () => {
  const { user, logout, selectedChildId } = useAuth();
  const navigate = useNavigate();
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        if (!selectedChildId) {
          console.error('No child ID selected');
          setSubscriptionStatus({
            isActive: false,
            plan: 'Free',
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false
          });
          setIsLoading(false);
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${apiUrl}/api/billing_status?child_id=${selectedChildId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error('Failed to fetch subscription status:', response.status, response.statusText);
          setSubscriptionStatus({
            isActive: false,
            plan: 'Free',
            currentPeriodEnd: null,
            cancelAtPeriodEnd: false
          });
          return;
        }
        
        const data = await response.json();
        setSubscriptionStatus(data);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setSubscriptionStatus({
          isActive: false,
          plan: 'Free',
          currentPeriodEnd: null,
          cancelAtPeriodEnd: false
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [selectedChildId]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleManageSubscription = async () => {
    try {
      if (!selectedChildId) {
        setError('No child selected');
        return;
      }

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiUrl}/api/billing_create_portal`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ child_id: selectedChildId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 404 && errorData.error === 'No active subscription found') {
          // Show subscription modal instead of redirecting
          setIsSubscriptionModalOpen(true);
          return;
        }
        throw new Error(errorData.error || 'Failed to create billing portal session');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No billing portal URL returned');
      }
    } catch (err) {
      console.error('Error creating billing portal session:', err);
      setError(err instanceof Error ? err.message : 'Failed to create billing portal session');
    }
  };

  const handleUpgradeSubscription = async () => {
    try {
      if (!selectedChildId) {
        setError('No child selected');
        return;
      }

      // Show subscription modal instead of direct upgrade
      setIsSubscriptionModalOpen(true);
    } catch (err) {
      console.error('Error handling subscription upgrade:', err);
      setError(err instanceof Error ? err.message : 'Failed to handle subscription upgrade');
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    try {
      // TODO: Implement account deletion API endpoint
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Account deletion error:', error);
      setError('Failed to delete account');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow rounded-lg p-6">
          {/* User Information Section */}
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <img
                className="h-12 w-12 rounded-full"
                src={user?.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.displayName || 'User')}
                alt="Profile"
              />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.displayName}</h2>
              <p className="text-gray-500">{user?.email}</p>
            </div>
          </div>

          {/* Account Settings Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
            <div className="mt-4 space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={user?.displayName || ''}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Subscription Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">Subscription</h3>
            <div className="mt-4">
              {subscriptionStatus?.isActive ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Current Plan</p>
                      <p className="text-sm text-gray-500">{subscriptionStatus.plan}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Next Billing Date</p>
                      <p className="text-sm text-gray-500">
                        {subscriptionStatus.currentPeriodEnd
                          ? new Date(subscriptionStatus.currentPeriodEnd).toLocaleDateString()
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleManageSubscription}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Manage Subscription
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">You are currently on the free plan.</p>
                  <button
                    onClick={() => setIsSubscriptionModalOpen(true)}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Upgrade Plan
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 border-t border-gray-200 pt-8">
            <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
            <div className="mt-4 space-y-4">
              <button
                onClick={handleLogout}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Sign Out
              </button>
              <button
                onClick={handleDeleteAccount}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        selectedChildId={selectedChildId}
        hasActiveSubscription={subscriptionStatus?.isActive || false}
        currentPlan={subscriptionStatus?.plan}
      />
    </div>
  );
}; 