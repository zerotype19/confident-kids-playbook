import React, { createContext, useContext, useState, useEffect } from 'react';
import { Child } from '../types';
import { useAuth } from './AuthContext';

console.log("✅ ChildContext loaded");

interface ChildContextType {
  selectedChild: Child | null;
  setSelectedChild: (child: Child) => void;
  children: Child[];
  setChildren: (children: Child[]) => void;
  isLoading: boolean;
  error: string | null;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const ChildProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedChild, setSelectedChildState] = useState<Child | null>(null);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token, selectedChildId, setSelectedChildId } = useAuth();

  // Fetch children when the component mounts or when the token changes
  useEffect(() => {
    const fetchChildren = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL;
        const response = await fetch(`${apiUrl}/api/children`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch children');
        }

        const data = await response.json();
        setChildrenList(data);

        // If we have a selectedChildId from auth context, find and set the corresponding child
        if (selectedChildId) {
          const child = data.find((c: Child) => c.id === selectedChildId);
          if (child) {
            setSelectedChildState(child);
          } else if (data.length > 0) {
            // If the selected child not found but we have children, select the first one
            setSelectedChildState(data[0]);
            setSelectedChildId(data[0].id);
          }
        } else if (data.length > 0) {
          // If no selected child ID but we have children, select the first one
          setSelectedChildState(data[0]);
          setSelectedChildId(data[0].id);
        }
      } catch (err) {
        console.error('Error fetching children:', err);
        setError('Failed to load children');
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, [token]);

  // Update selected child when selectedChildId changes
  useEffect(() => {
    if (selectedChildId && childrenList.length > 0) {
      const child = childrenList.find(c => c.id === selectedChildId);
      if (child) {
        setSelectedChildState(child);
      }
    }
  }, [selectedChildId, childrenList]);

  const setSelectedChild = (child: Child) => {
    setSelectedChildState(child);
    setSelectedChildId(child.id);
  };

  return (
    <ChildContext.Provider value={{ 
      selectedChild, 
      setSelectedChild, 
      children: childrenList, 
      setChildren: setChildrenList,
      isLoading,
      error
    }}>
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