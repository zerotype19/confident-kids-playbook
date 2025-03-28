import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider } from '../components/onboarding/OnboardingState';
import WelcomeScreen from '../components/onboarding/WelcomeScreen';
import ParentDetailsScreen from '../components/onboarding/ParentDetailsScreen';
import FamilyChildScreen from '../components/onboarding/FamilyChildScreen';
import { useOnboarding } from '../components/onboarding/OnboardingState';
import { useAuth } from '../contexts/AuthContext';

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
  const { token } = useAuth();

  useEffect(() => {
    const checkProfile = async () => {
      if (!token) return;

      try {
        const res = await fetch("/api/user/profile", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!res.ok) {
          console.error('Failed to check user profile');
          return;
        }

        const data = await res.json();
        if (data.hasFamily && data.hasChild) {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error('Error checking user profile:', error);
      }
    };

    checkProfile();
  }, [token, navigate]);

  return (
    <OnboardingProvider>
      <OnboardingContent />
    </OnboardingProvider>
  );
} 