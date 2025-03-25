import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import CreateFamilyForm from "../components/onboarding/CreateFamilyForm";
import CreateChildForm from "../components/onboarding/CreateChildForm";

export default function OnboardingPage(): JSX.Element {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        console.log("🚀 Starting onboarding status check");
        const jwt = localStorage.getItem("jwt");
        console.log("🔍 Checking onboarding status:", { 
          hasJWT: !!jwt,
          jwtLength: jwt?.length,
          jwtPrefix: jwt?.substring(0, 10) + '...'
        });
        
        if (!jwt) {
          console.error("❌ No JWT found in localStorage");
          setError("Please log in to continue");
          navigate("/");
          return;
        }

        const apiUrl = import.meta.env.VITE_API_URL || '';
        console.log("🔗 Using API URL:", apiUrl);
        
        console.log("📤 Preparing fetch request with headers:", {
          'Authorization': `Bearer ${jwt.substring(0, 10)}...`,
          'Content-Type': 'application/json'
        });

        const response = await fetch(`${apiUrl}/api/onboarding/status`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          },
          mode: 'cors',
          credentials: 'omit'
        });
        
        console.log("📡 Onboarding status response received:", {
          status: response.status,
          ok: response.ok,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        if (!response.ok) {
          console.error("❌ Response not OK, attempting to read error data");
          const errorData = await response.json().catch((e) => {
            console.error("❌ Failed to parse error response:", e);
            return {};
          });
          console.error("❌ Onboarding status check failed:", errorData);
          throw new Error(errorData.error || 'Failed to check onboarding status');
        }
        
        console.log("📥 Parsing response JSON");
        const data = await response.json();
        console.log("✅ Onboarding status data:", data);
        
        setHasCompletedOnboarding(data.hasCompletedOnboarding);
        
        if (data.hasCompletedOnboarding) {
          console.log("✅ Onboarding completed, redirecting to dashboard");
          navigate('/dashboard');
        } else {
          console.log("ℹ️ Onboarding not completed, showing form");
        }
      } catch (error) {
        console.error('❌ Failed to check onboarding status:', error);
        if (error instanceof Error) {
          console.error('Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
        }
        setError(error instanceof Error ? error.message : "Failed to load onboarding status");
        navigate("/");
      }
    };

    checkOnboardingStatus();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

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