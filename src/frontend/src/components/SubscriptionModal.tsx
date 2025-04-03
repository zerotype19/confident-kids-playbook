import React, { useState } from 'react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChildId: string | null;
  hasActiveSubscription: boolean;
  currentPlan?: string;
}

interface SubscriptionPlan {
  id: 'monthly' | 'yearly';
  name: string;
  price: number;
  features: string[];
  interval: 'month' | 'year';
  price_id: string;
}

const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 9.99,
    features: [
      'Unlimited access to all content',
      'Personalized learning paths',
      'Progress tracking',
      '24/7 support'
    ],
    interval: 'month',
    price_id: 'price_1R55sbPEQoD1awJQfStxQA3F' // Replace with your actual monthly price ID
  },
  {
    id: 'yearly',
    name: 'Yearly Plan',
    price: 99.99,
    features: [
      'All Monthly Plan features',
      'Save 16% compared to monthly',
      'Priority support',
      'Early access to new features'
    ],
    interval: 'year',
    price_id: 'price_1R55sbPEQoD1awJQfStxQA3F' // Replace with your actual yearly price ID
  }
];

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedChildId,
  hasActiveSubscription,
  currentPlan
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubscribe = async (planId: string) => {
    try {
      if (!selectedChildId) {
        setError('No child selected');
        return;
      }

      setIsLoading(true);
      setError(null);

      const apiUrl = import.meta.env.VITE_API_URL || '';
      const endpoint = hasActiveSubscription ? '/api/billing_create_portal' : '/api/billing_create_checkout';
      
      const selectedPlanDetails = SUBSCRIPTION_PLANS.find(plan => plan.id === planId);
      if (!selectedPlanDetails) {
        throw new Error('Invalid plan selected');
      }

      const response = await fetch(`${apiUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          child_id: selectedChildId,
          price_id: selectedPlanDetails.price_id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process subscription request');
      }

      const { url } = await response.json();
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No URL returned');
      }
    } catch (err) {
      console.error('Error processing subscription:', err);
      setError(err instanceof Error ? err.message : 'Failed to process subscription request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {hasActiveSubscription ? 'Manage Your Subscription' : 'Choose Your Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {hasActiveSubscription && currentPlan && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              Current Plan: <span className="font-medium">{currentPlan}</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Click on a plan to change your subscription or manage your billing details.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SUBSCRIPTION_PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`border rounded-lg p-6 ${
                selectedPlan === plan.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'
              }`}
            >
              <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${plan.price}
                <span className="text-base font-normal text-gray-500">/{plan.interval}</span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={isLoading}
                className={`mt-6 w-full py-2 px-4 rounded-md text-white font-medium ${
                  selectedPlan === plan.id
                    ? 'bg-indigo-600 hover:bg-indigo-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
              >
                {isLoading ? 'Processing...' : hasActiveSubscription ? 'Change Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>

        {hasActiveSubscription && (
          <div className="mt-6 text-center">
            <button
              onClick={() => handleSubscribe('cancel')}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Cancel Subscription
            </button>
          </div>
        )}
      </div>
    </div>
  );
}; 