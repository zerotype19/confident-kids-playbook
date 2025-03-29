// src/components/PageWrapper.tsx

import React from "react";

export const PageWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-kidoova-background text-kidoova-green px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">{children}</div>
    </div>
  );
};
