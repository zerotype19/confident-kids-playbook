// src/components/PageWrapper.tsx

import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import SubNavBar from './SubNavBar';

export default function PageWrapper() {
  return (
    <div className="min-h-screen">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-screen-lg mx-auto px-4 py-4">
          <Link to="/dashboard">
            <img 
              src="/logo.png" 
              alt="Kidoova Logo" 
              className="h-10 md:h-12"
            />
          </Link>
        </div>
      </header>
      <SubNavBar />
      <main className="max-w-screen-lg mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
