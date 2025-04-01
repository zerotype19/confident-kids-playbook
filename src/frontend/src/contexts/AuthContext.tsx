import React, { createContext, useContext, useState, useEffect } from 'react';

console.log("✅ AuthContext loaded");

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  hasCompletedOnboarding: boolean;
  childId: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUserData: (token: string) => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

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
        hasCompletedOnboarding: data.hasCompletedOnboarding,
        childId: data.childId
      };
      console.log("👤 Mapped user data:", userData);
      setUser(userData);
      console.log("✅ User state updated with:", userData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we can't fetch user data, clear the token and user state
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
      throw error; // Re-throw to handle in the login function
    }
  };

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      console.log("🔑 Found stored token, initializing auth state");
      setToken(storedToken);
      setIsAuthenticated(true);
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
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout, fetchUserData }}>
      {children}
    </AuthContext.Provider>
  );
}; 