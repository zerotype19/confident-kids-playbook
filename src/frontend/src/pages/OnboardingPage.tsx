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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  console.log('🎯 OnboardingContent render:', { user, currentStep, isAuthenticated });

  useEffect(() => {
    console.log('🔄 OnboardingContent useEffect:', { user, isAuthenticated });
    
    if (!isAuthenticated) {
      console.log('❌ Not authenticated, redirecting to login');
      navigate('/');
      return;
    }

    if (!user) {
      console.log('⏳ User data not loaded yet');
      return;
    }

    if (user.hasCompletedOnboarding) {
      console.log('✅ User completed onboarding, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [user, isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    console.log('⏳ Waiting for authentication or user data');
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
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Welcome to Confident Kids Playbook
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