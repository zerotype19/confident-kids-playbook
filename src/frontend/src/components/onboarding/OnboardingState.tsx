import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface OnboardingState {
  currentStep: number;
  totalSteps: number;
  userData: {
    name: string;
    email: string;
  };
  familyData: {
    name: string;
  };
  children: Array<{
    name: string;
    birthdate?: string;
    gender?: string;
  }>;
  setCurrentStep: (step: number) => void;
  setUserData: (data: { name: string; email: string }) => void;
  setFamilyData: (data: { name: string }) => void;
  addChild: (child: { name: string; birthdate?: string; gender?: string }) => void;
  removeChild: (index: number) => void;
}

const OnboardingContext = createContext<OnboardingState | undefined>(undefined);

export function OnboardingProvider({ children: providerChildren }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [userData, setUserData] = useState({ name: '', email: '' });
  const [familyData, setFamilyData] = useState({ name: '' });
  const [children, setChildren] = useState<Array<{ name: string; birthdate?: string; gender?: string }>>([]);
  const navigate = useNavigate();

  const totalSteps = 4; // Welcome, Parent Details, Family/Child, Completion

  useEffect(() => {
    // Check onboarding status on mount
    const checkOnboardingStatus = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL;
        const jwt = localStorage.getItem('jwt');
        if (!jwt) {
          navigate('/login');
          return;
        }

        const response = await fetch(`${apiUrl}/api/onboarding/status`, {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });

        if (!response.ok) throw new Error('Failed to check onboarding status');
        
        const data = await response.json();
        if (data.hasCompletedOnboarding) {
          navigate('/home');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
        navigate('/login');
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  const addChild = (child: { name: string; birthdate?: string; gender?: string }) => {
    setChildren(prev => [...prev, child]);
  };

  const removeChild = (index: number) => {
    setChildren(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <OnboardingContext.Provider
      value={{
        currentStep,
        totalSteps,
        userData,
        familyData,
        children,
        setCurrentStep,
        setUserData,
        setFamilyData,
        addChild,
        removeChild,
      }}
    >
      {providerChildren}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
} 