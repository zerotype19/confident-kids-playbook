// src/components/PageWrapper.tsx

import React from "react";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-full min-h-screen bg-kidoova-background text-kidoova-green">
      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          {children}
        </div>
      </div>
    </div>
  );
};
