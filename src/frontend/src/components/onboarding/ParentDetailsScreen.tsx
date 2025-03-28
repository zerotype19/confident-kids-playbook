import React, { useEffect } from 'react';
import { useOnboarding } from './OnboardingState';
import { useAuth } from '../../contexts/AuthContext';

export default function ParentDetailsScreen(): JSX.Element {
  const { setCurrentStep, userData, setUserData } = useOnboarding();
  const { token } = useAuth();

  useEffect(() => {
    // Fetch user data from the backend
    const fetchUserData = async () => {
      try {
        if (!token) return;

        const response = await fetch("/api/user/profile", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch user data');
        
        const data = await response.json();
        setUserData({
          name: data.name,
          email: data.email
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [setUserData, token]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Confirm Your Details
        </h2>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900">
              {userData.name}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900">
              {userData.email}
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(1)}
            className="py-2 px-4 text-gray-600 hover:text-gray-800"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className="py-2 px-6 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
} 