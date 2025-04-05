import React from 'react';

interface AuthenticatedPageWrapperProps {
  children: React.ReactNode;
}

const AuthenticatedPageWrapper: React.FC<AuthenticatedPageWrapperProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {children}
    </div>
  );
};

export default AuthenticatedPageWrapper; 