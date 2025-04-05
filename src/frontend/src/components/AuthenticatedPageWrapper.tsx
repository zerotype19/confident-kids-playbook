import React from 'react';
import AuthenticatedHeader from './AuthenticatedHeader';

interface AuthenticatedPageWrapperProps {
  children: React.ReactNode;
}

const AuthenticatedPageWrapper: React.FC<AuthenticatedPageWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
};

export default AuthenticatedPageWrapper; 