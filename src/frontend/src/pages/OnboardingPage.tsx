import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { OnboardingProvider, useOnboarding } from '../components/onboarding/OnboardingState';
import WelcomeStep from '../components/onboarding/WelcomeStep';
import ParentDetailsStep from '../components/onboarding/ParentDetailsStep';
import FamilyChildStep from '../components/onboarding/FamilyChildStep';
import CompletionStep from '../components/onboarding/CompletionStep';

function OnboardingContent() {
  const { currentStep, setCurrentStep } = useOnboarding();
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();

  console.log('🎯 OnboardingContent render:', { user, currentStep, isAuthenticated, token });

  useEffect(() => {
    console.log('🔄 OnboardingContent useEffect:', { user, isAuthenticated, token });
    
    // If we have a token but user data isn't loaded yet, wait
    if (token && !user) {
      console.log('⏳ Token exists but user data not loaded yet');
      return;
    }

    // If not authenticated and no token, redirect to home
    if (!isAuthenticated && !token) {
      console.log('❌ Not authenticated and no token, redirecting to home');
      navigate('/');
      return;
    }

    // If user has completed onboarding, redirect to dashboard
    if (user?.hasCompletedOnboarding) {
      console.log('✅ User completed onboarding, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, isAuthenticated, token, navigate]);

  // Show loading state while initializing
  if (token && !user) {
    console.log('⏳ Waiting for user data to load');
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
          <p className="mt-2 text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  // Show loading state while not authenticated
  if (!isAuthenticated && !token) {
    console.log('⏳ Waiting for authentication');
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
          <p className="mt-2 text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  const renderStep = () => {
    console.log('🎨 Rendering step:', currentStep);
    switch (currentStep) {
      case 1:
        return <WelcomeStep onNext={() => setCurrentStep(2)} />;
      case 2:
        return <ParentDetailsStep onNext={() => setCurrentStep(3)} onBack={() => setCurrentStep(1)} />;
      case 3:
        return <FamilyChildStep onNext={() => setCurrentStep(4)} onBack={() => setCurrentStep(2)} />;
      case 4:
        return <CompletionStep onComplete={() => navigate('/dashboard')} />;
      default:
        return <WelcomeStep onNext={() => setCurrentStep(2)} />;
    }
  };

  console.log('🎨 OnboardingContent: Rendering content');
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center mb-6">
          <img 
            src="/logo.png" 
            alt="Kidoova Logo" 
            className="h-16 md:h-20"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Kidoova
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Let's get your family set up
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  console.log('🚀 OnboardingPage render');
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
} 