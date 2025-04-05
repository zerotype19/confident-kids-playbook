import React, { useState } from 'react';
import { useOnboarding } from './OnboardingState';
import { useAuth } from '../../contexts/AuthContext';

interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  const { userData, familyData, children } = useOnboarding();
  const { token, fetchUserData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      if (!token) throw new Error('No authentication token found');

      // Create family
      const familyResponse = await fetch(`${apiUrl}/api/family/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(familyData)
      });

      if (!familyResponse.ok) {
        const errorData = await familyResponse.json();
        throw new Error(errorData.message || 'Failed to create family');
      }

      // Wait a moment to ensure family creation is complete
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create children
      for (const child of children) {
        const childResponse = await fetch(`${apiUrl}/api/children/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(child)
        });

        if (!childResponse.ok) {
          const errorData = await childResponse.json();
          throw new Error(errorData.message || 'Failed to create child profile');
        }
      }

      // Mark onboarding as complete
      const completeResponse = await fetch(`${apiUrl}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!completeResponse.ok) {
        const errorData = await completeResponse.json();
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

      // Refresh user data to get updated onboarding status
      await fetchUserData(token);

      // Navigate to dashboard
      onComplete();
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while completing setup');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <div className="text-center">
        <h3 className="text-xl font-heading text-[#00A67E]">Setup Complete!</h3>
        <p className="mt-2 text-sm text-gray-500">
          Your family profile has been created successfully.
        </p>

        <div className="mt-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="text-sm font-medium text-gray-900">Family Details</h4>
            <dl className="mt-2 text-sm text-gray-500">
              <div className="mt-1">
                <dt className="inline">Family Name:</dt>
                <dd className="inline ml-2">{familyData.name}</dd>
              </div>
              <div className="mt-1">
                <dt className="inline">Parent:</dt>
                <dd className="inline ml-2">{userData.name}</dd>
              </div>
              <div className="mt-1">
                <dt className="inline">Children:</dt>
                <dd className="inline ml-2">{children.length}</dd>
              </div>
            </dl>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="mt-8">
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSubmitting ? 'Completing Setup...' : 'Go to Dashboard'}
          </button>
        </div>
      </div>
    </div>
  );
} 