// src/components/PageWrapper.tsx

import React from 'react';
import SubNavBar from './SubNavBar';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-kidoova-background pb-16 md:pb-0">
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
      <SubNavBar />
    </div>
  );
}
