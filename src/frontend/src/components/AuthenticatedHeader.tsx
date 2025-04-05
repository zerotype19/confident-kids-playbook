import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthenticatedHeaderProps {
  isMenuOpen: boolean;
  onToggleMenu: () => void;
}

const AuthenticatedHeader: React.FC<AuthenticatedHeaderProps> = ({ isMenuOpen, onToggleMenu }) => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-sm z-50">
      <div className="h-full flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={onToggleMenu}
            className="md:hidden mr-4 text-gray-600 hover:text-gray-900"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          <Link to="/dashboard" className="flex items-center">
            <img src="/logo.png" alt="Kidoova" className="h-8" />
          </Link>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm text-white bg-kidoova-accent rounded-md hover:bg-kidoova-accent-dark"
        >
          Sign Out
        </button>
      </div>
    </header>
  );
};

export default AuthenticatedHeader; 