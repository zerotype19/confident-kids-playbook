import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  console.log('🔒 PrivateRoute render:', { isAuthenticated, user, location: location.pathname });

  // If not authenticated, redirect to home
  if (!isAuthenticated) {
    console.log('❌ Not authenticated, redirecting to home');
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user data is not loaded yet, show loading state
  if (!user) {
    console.log('⏳ User data not loaded yet');
    return <div>Loading...</div>;
  }

  // If user has completed onboarding and tries to access onboarding pages
  if (user.hasCompletedOnboarding && location.pathname.startsWith('/onboarding')) {
    console.log('✅ User completed onboarding, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and tries to access dashboard
  if (!user.hasCompletedOnboarding && location.pathname === '/dashboard') {
    console.log('🔄 User not completed onboarding, redirecting to onboarding');
    return <Navigate to="/onboarding" replace />;
  }

  console.log('✅ Access granted to:', location.pathname);
  return <>{children}</>;
}; 