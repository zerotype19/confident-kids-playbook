import React from 'react';
import { OnboardingProvider } from '../components/onboarding/OnboardingState';
import WelcomeScreen from '../components/onboarding/WelcomeScreen';
import ParentDetailsScreen from '../components/onboarding/ParentDetailsScreen';
import FamilyChildScreen from '../components/onboarding/FamilyChildScreen';
import { useOnboarding } from '../components/onboarding/OnboardingState';

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
  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
} 