import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import WelcomeStep from '../components/onboarding/WelcomeStep';
import FamilyProfileStep from '../components/onboarding/FamilyProfileStep';
import ChildProfileStep from '../components/onboarding/ChildProfileStep';
import CompletionStep from '../components/onboarding/CompletionStep';
import { useUser } from '../contexts/UserContext';

export default function OnboardingPage() {
  const { user } = useAuth();
  const { userData, refreshUserData } = useUser();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // If user is not logged in, redirect to login
  if (!user) {
    navigate('/login');
    return null;
  }

  // If user has already completed onboarding, redirect to dashboard
  if (userData?.has_completed_onboarding) {
    navigate('/dashboard');
    return null;
  }

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to complete onboarding');
      }

      await refreshUserData();
      navigate('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeStep onNext={handleNext} />;
      case 1:
        return <FamilyProfileStep onNext={handleNext} onBack={handleBack} />;
      case 2:
        return <ChildProfileStep onNext={handleNext} onBack={handleBack} />;
      case 3:
        return <CompletionStep onComplete={handleComplete} onBack={handleBack} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {renderStep()}
      </div>
    </div>
  );
} 