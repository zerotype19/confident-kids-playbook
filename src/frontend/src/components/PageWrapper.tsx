// src/components/PageWrapper.tsx

import React from 'react';
import { Outlet } from 'react-router-dom';
import SubNavBar from './SubNavBar';

export default function PageWrapper() {
  return (
    <div className="min-h-screen bg-kidoova-background">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-screen-lg mx-auto px-4 py-4">
          <img 
            src="/logo.png" 
            alt="Kidoova Logo" 
            className="h-8 md:h-10"
          />
        </div>
      </header>
      <SubNavBar />
      <main className="max-w-screen-lg mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
