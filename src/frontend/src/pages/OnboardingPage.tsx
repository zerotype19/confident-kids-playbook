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
        const jwt = localStorage.getItem("jwt");
        if (!jwt) {
          console.error("No JWT found");
          navigate("/");
          return;
        }

        const response = await fetch('/api/onboarding/status', {
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to check onboarding status');
        }
        
        const data = await response.json();
        setHasCompletedOnboarding(data.hasCompletedOnboarding);
        
        if (data.hasCompletedOnboarding) {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        navigate("/");
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
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {isChildStep ? "Create Your Child's Profile" : "Welcome to Confident Kids!"}
          </h1>
          
          {isChildStep ? <CreateChildForm /> : <CreateFamilyForm />}
        </div>
      </div>
    </div>
  );
} 