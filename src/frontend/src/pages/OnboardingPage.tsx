import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider } from '../components/onboarding/OnboardingState';
import WelcomeScreen from '../components/onboarding/WelcomeScreen';
import ParentDetailsScreen from '../components/onboarding/ParentDetailsScreen';
import FamilyChildScreen from '../components/onboarding/FamilyChildScreen';
import { useOnboarding } from '../components/onboarding/OnboardingState';
import { useAuth } from '../contexts/AuthContext';
import { PageWrapper } from '../components/PageWrapper';

function OnboardingContent(): JSX.Element {
  const { currentStep } = useOnboarding();

  switch (currentStep) {
    case 1:
      return <WelcomeScreen />;
    case 2:
      return <ParentDetailsScreen />;
    case 3:
      return <FamilyChildScreen />;
    default:
      return <WelcomeScreen />;
  }
}

export default function OnboardingPage(): JSX.Element {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  useEffect(() => {
    // If user has completed onboarding, redirect to dashboard
    if (user?.hasCompletedOnboarding) {
      navigate('/dashboard');
      return;
    }

    // If no token, redirect to login
    if (!token) {
      navigate('/');
      return;
    }
  }, [token, user, navigate]);

  return (
    <OnboardingProvider>
      <PageWrapper>
        <OnboardingContent />
      </PageWrapper>
    </OnboardingProvider>
  );
} 