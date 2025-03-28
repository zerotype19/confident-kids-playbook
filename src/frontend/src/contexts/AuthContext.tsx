import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

console.log("✅ AuthContext loaded");

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  hasCompletedOnboarding: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUserData = async (authToken: string) => {
    try {
      const response = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      const userData = {
        uid: data.userId,
        email: data.email,
        displayName: data.name,
        photoURL: null,
        hasCompletedOnboarding: data.hasCompletedOnboarding
      };
      setUser(userData);

      // Redirect to dashboard if onboarding is completed
      if (userData.hasCompletedOnboarding) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      // If we can't fetch user data, clear the token and user state
      localStorage.removeItem('token');
      setToken(null);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  useEffect(() => {
    // Check for existing session
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      setIsAuthenticated(true);
      fetchUserData(storedToken);
    }
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    await fetchUserData(newToken);
  };

  const logout = async () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}; 