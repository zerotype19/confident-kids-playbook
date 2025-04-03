import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, user, token } = useAuth();
  const location = useLocation();
  const [isInitialized, setIsInitialized] = useState(false);

  console.log('🔒 PrivateRoute render:', { isAuthenticated, user, token, location: location.pathname, isInitialized });

  useEffect(() => {
    // Wait a short moment to allow token to be loaded from localStorage
    const timer = setTimeout(() => {
      setIsInitialized(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while initializing
  if (!isInitialized) {
    console.log('⏳ Waiting for initialization');
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
          <p className="mt-2 text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to home page
  if (!isAuthenticated || !token) {
    console.log('❌ Not authenticated, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If we have a token but user data isn't loaded yet, show loading state
  if (token && !user) {
    console.log('⏳ Token exists but user data not loaded yet');
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Loading...</h2>
          <p className="mt-2 text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  // If user has completed onboarding and tries to access onboarding pages
  if (user?.hasCompletedOnboarding && location.pathname.startsWith('/onboarding')) {
    console.log('✅ User completed onboarding, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and tries to access dashboard or profile
  if (user && !user.hasCompletedOnboarding && 
      (location.pathname === '/dashboard')) {
    console.log('🔄 User not completed onboarding, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  // If authenticated and user data is loaded, render children
  console.log('✅ Authenticated, rendering protected content');
  return <>{children}</>;
}; 