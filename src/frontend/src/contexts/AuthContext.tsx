import React, { createContext, useContext, useState, useEffect } from 'react';

console.log("✅ AuthContext loaded");

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  accessToken: string;
  hasCompletedOnboarding: boolean;
  childId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  selectedChildId: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserData: (token: string) => Promise<void>;
  setSelectedChildId: (childId: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface GoogleCredentialResponse {
  credential: string;
  select_by: string;
  g_csrf_token: string;
}

interface GoogleIdentityServices {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => Promise<void>;
  }) => void;
  renderButton: (
    element: HTMLElement | null,
    options: {
      theme: "outline" | "filled";
      size: "large" | "medium" | "small";
      shape: "rectangular" | "pill" | "circle";
    }
  ) => void;
  disableAutoSelect: () => Promise<void>;
  revoke: () => Promise<void>;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: GoogleIdentityServices;
      };
    };
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [selectedChildId, setSelectedChildIdState] = useState<string | null>(null);

  const fetchUserData = async (authToken: string) => {
    try {
      console.log("🔍 Fetching user data with token:", authToken.substring(0, 10) + "...");
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/user/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error("❌ Failed to fetch user data:", response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error("Error details:", errorData);
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log("📥 User data received:", data);
      const userData = {
        uid: data.userId,
        email: data.email,
        displayName: data.name,
        photoURL: data.picture,
        accessToken: data.accessToken,
        hasCompletedOnboarding: data.hasCompletedOnboarding,
        childId: data.childId
      };
      console.log("👤 Mapped user data:", userData);
      setUser(userData);
      console.log("✅ User state updated with:", userData);
      
      // Set selected child ID from localStorage or use the first child if available
      const storedChildId = localStorage.getItem('selectedChildId');
      console.log("🔍 Stored child ID:", storedChildId);
      
      if (storedChildId && data.children?.some((child: any) => child.id === storedChildId)) {
        console.log("✅ Using stored child ID:", storedChildId);
        setSelectedChildIdState(storedChildId);
      } else if (data.selectedChildId) {
        // If the backend has a selected child ID, use that
        console.log("✅ Using backend selected child ID:", data.selectedChildId);
        setSelectedChildIdState(data.selectedChildId);
        localStorage.setItem('selectedChildId', data.selectedChildId);
      } else if (data.children?.length > 0) {
        // If no stored child ID or it's invalid, use the first child
        console.log("✅ Using first child as default:", data.children[0].id);
        setSelectedChildIdState(data.children[0].id);
        localStorage.setItem('selectedChildId', data.children[0].id);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we can't fetch user data, clear the token and user state
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      throw error; // Re-throw to handle in the login function
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('token');
    const storedChildId = localStorage.getItem('selectedChildId');
    
    if (storedToken) {
      console.log("🔑 Found stored token, initializing auth state");
      setToken(storedToken);
      setIsAuthenticated(true);
      
      // Set the selected child ID from localStorage before fetching user data
      if (storedChildId) {
        console.log("🔍 Setting initial selected child ID from localStorage:", storedChildId);
        setSelectedChildIdState(storedChildId);
      }
      
      fetchUserData(storedToken);
    }
  }, []);

  const login = async (newToken: string) => {
    console.log("🔑 Starting login process");
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    console.log("✅ Auth state updated, fetching user data");
    await fetchUserData(newToken);
  };

  const logout = async () => {
    // Clear Google auth state if it exists
    if (window.google?.accounts?.id) {
      try {
        // Disable auto-select to prevent automatic sign-in
        await window.google.accounts.id.disableAutoSelect();
      } catch (error) {
        console.error('Error disabling Google auto-select:', error);
      }
    }
    // Clear local storage and state
    localStorage.removeItem('token');
    localStorage.removeItem('selectedChildId');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    setSelectedChildIdState(null);
  };

  const setSelectedChildId = async (childId: string | null) => {
    if (childId) {
      localStorage.setItem('selectedChildId', childId);
      setSelectedChildIdState(childId);
      
      // Update the selected child in the backend if authenticated
      if (token) {
        try {
          const apiUrl = import.meta.env.VITE_API_URL;
          await fetch(`${apiUrl}/api/user/selected-child`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ childId })
          });
        } catch (error) {
          console.error('Error updating selected child:', error);
        }
      }
    } else {
      localStorage.removeItem('selectedChildId');
      setSelectedChildIdState(null);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isLoading, 
      user, 
      token, 
      selectedChildId,
      login, 
      logout, 
      fetchUserData,
      setSelectedChildId
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 