// src/components/PageWrapper.tsx

import React from 'react';
import SubNavBar from './SubNavBar';

interface PageWrapperProps {
  children: React.ReactNode;
}

export default function PageWrapper({ children }: PageWrapperProps) {
  return (
    <div className="min-h-screen bg-kidoova-background flex flex-col">
      {/* Header with Logo */}
      <header className="w-full bg-white shadow-kidoova">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <img 
            src={import.meta.env.BASE_URL + 'logo.png'} 
            alt="Kidoova" 
            className="h-8 sm:h-10 w-auto"
          />
        </div>
      </header>
      
      <SubNavBar />
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
