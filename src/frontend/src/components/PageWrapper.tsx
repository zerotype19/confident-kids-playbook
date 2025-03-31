// src/components/PageWrapper.tsx

import React from 'react';
import SubNavBar from './SubNavBar';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-kidoova-background flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <SubNavBar />
    </div>
  );
}
