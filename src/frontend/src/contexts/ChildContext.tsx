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
        console.log('❌ No token available, skipping children fetch');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const apiUrl = import.meta.env.VITE_API_URL;
        console.log('🔍 Fetching children from:', `${apiUrl}/api/children`);
        
        const response = await fetch(`${apiUrl}/api/children`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          throw new Error(`Failed to fetch children: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📥 Raw API response:', data);
        
        if (!data.success) {
          console.error('❌ API response indicated failure:', data);
          throw new Error('API response indicated failure');
        }

        if (!Array.isArray(data.children)) {
          console.error('❌ children is not an array:', data.children);
          throw new Error('Invalid response format: children is not an array');
        }

        const childrenArray = data.children;
        console.log('👥 Setting children list:', childrenArray);
        setChildrenList(childrenArray);

        // If we have a selectedChildId from auth context, find and set the corresponding child
        if (selectedChildId) {
          const child = childrenArray.find((c: Child) => c.id === selectedChildId);
          if (child) {
            console.log('✅ Found selected child:', child);
            setSelectedChildState(child);
          } else if (childrenArray.length > 0) {
            // If the selected child not found but we have children, select the first one
            console.log('⚠️ Selected child not found, using first child:', childrenArray[0]);
            setSelectedChildState(childrenArray[0]);
            setSelectedChildId(childrenArray[0].id);
          }
        } else if (childrenArray.length > 0) {
          // If no selected child ID but we have children, select the first one
          console.log('✅ No selected child, using first child:', childrenArray[0]);
          setSelectedChildState(childrenArray[0]);
          setSelectedChildId(childrenArray[0].id);
        }
      } catch (err) {
        console.error('❌ Error fetching children:', err);
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
        console.log('🔄 Updating selected child from ID:', child);
        setSelectedChildState(child);
      }
    }
  }, [selectedChildId, childrenList]);

  const setSelectedChild = (child: Child) => {
    console.log('👤 Setting selected child:', child);
    setSelectedChildState(child);
    setSelectedChildId(child.id);
  };

  // Log state changes
  useEffect(() => {
    console.log('📊 ChildContext state updated:', {
      selectedChild,
      childrenList,
      isLoading,
      error
    });
  }, [selectedChild, childrenList, isLoading, error]);

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