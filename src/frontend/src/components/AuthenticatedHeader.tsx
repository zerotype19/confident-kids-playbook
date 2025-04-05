import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AuthenticatedHeader: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center">
          <img src="/logo.png" alt="Kidoova Logo" className="h-8 md:h-10" />
        </Link>
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center space-x-2">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'User'} 
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-600 text-sm">
                    {user.displayName?.charAt(0) || user.email?.charAt(0)}
                  </span>
                </div>
              )}
              <span className="text-gray-700">{user.displayName || user.email}</span>
            </div>
          )}
          <button
            onClick={() => logout()}
            className="text-gray-600 hover:text-gray-900"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default AuthenticatedHeader; 