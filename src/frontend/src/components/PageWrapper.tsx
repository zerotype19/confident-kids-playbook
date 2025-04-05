// src/components/PageWrapper.tsx

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import UnauthenticatedHeader from './UnauthenticatedHeader';
import UnauthenticatedFooter from './UnauthenticatedFooter';

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {!isAuthenticated && <UnauthenticatedHeader />}
      <main className={`flex-grow ${!isAuthenticated ? 'pt-16' : ''}`}>
        {children}
      </main>
      {!isAuthenticated && <UnauthenticatedFooter />}
    </div>
  );
};

export default PageWrapper;
