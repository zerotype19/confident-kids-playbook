import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-neutral-100 text-gray-900">
      {/* Header with Logo */}
      <header className="w-full bg-white shadow-sm">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <img 
            src="/logo.png" 
            alt="Kidoova" 
            className="h-8 sm:h-10 w-auto"
          />
        </div>
      </header>
      
      <main className="flex-1 w-full">
        <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
} 