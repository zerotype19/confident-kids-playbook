import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If user has completed onboarding and tries to access onboarding pages
  if (user?.hasCompletedOnboarding && location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/dashboard" replace />;
  }

  // If user hasn't completed onboarding and tries to access dashboard
  if (!user?.hasCompletedOnboarding && location.pathname === '/dashboard') {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}; 