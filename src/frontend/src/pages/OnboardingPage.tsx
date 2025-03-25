import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CreateFamilyForm from "../components/onboarding/CreateFamilyForm";
import CreateChildForm from "../components/onboarding/CreateChildForm";

export default function OnboardingPage(): JSX.Element {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const response = await fetch('/api/onboarding/status');
        const data = await response.json();
        
        setHasCompletedOnboarding(data.hasCompletedOnboarding);
        
        if (data.hasCompletedOnboarding) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  if (hasCompletedOnboarding === null) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const isChildStep = location.pathname === '/onboarding/child';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome to Confident Kids Playbook!
          </h1>
          <p className="text-gray-600">
            {isChildStep 
              ? "Let's set up your child's profile to get started."
              : "Let's create your family account to begin the journey."}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className={`h-2 w-2 rounded-full ${!isChildStep ? 'bg-indigo-500' : 'bg-indigo-200'}`}></div>
          <div className="h-0.5 w-8 bg-indigo-200"></div>
          <div className={`h-2 w-2 rounded-full ${isChildStep ? 'bg-indigo-500' : 'bg-indigo-200'}`}></div>
        </div>

        {isChildStep ? <CreateChildForm /> : <CreateFamilyForm />}
      </div>
    </div>
  );
} 