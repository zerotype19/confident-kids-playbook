import React, { createContext, useContext, useState } from 'react';
import { Child } from '../../../types';

interface ChildContextType {
  selectedChild: Child | null;
  setSelectedChild: (child: Child) => void;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const ChildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  return (
    <ChildContext.Provider value={{ selectedChild, setSelectedChild }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChildContext = () => {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChildContext must be used within a ChildProvider');
  }
  return context;
}; 