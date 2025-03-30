import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

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
  const { user } = useAuth();

  const totalSteps = 4; // Welcome, Parent Details, Family/Child, Completion

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