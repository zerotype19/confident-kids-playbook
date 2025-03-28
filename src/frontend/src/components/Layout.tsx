import React from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-100 text-gray-900">
      <main className="max-w-screen-md mx-auto px-4 py-6 space-y-6">
        {children}
      </main>
    </div>
  );
} 