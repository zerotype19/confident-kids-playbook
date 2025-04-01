import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function SubNavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        localStorage.removeItem('token');
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear token and redirect on error
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/pillars', label: 'Pillars', icon: '🎯' },
    { path: '/all-challenges', label: 'Challenges', icon: '🧠' },
    { path: '/rewards', label: 'Rewards', icon: '🎁' },
    { path: '/manage-children', label: 'Children', icon: '👶' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  // Don't show nav on login, onboarding, or root pages
  if (['/login', '/onboarding', '/'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 z-50">
      <div className="max-w-screen-lg mx-auto">
        <div className="flex justify-between items-center px-4">
          <div className="flex space-x-4 md:space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center py-3 px-2 md:px-3 text-sm font-medium transition-colors duration-200 ${
                  location.pathname === item.path
                    ? 'text-kidoova-accent border-b-2 border-kidoova-accent'
                    : 'text-gray-500 hover:text-kidoova-accent'
                }`}
              >
                <span className="text-xl md:text-lg">{item.icon}</span>
                <span className="hidden md:inline ml-2">{item.label}</span>
              </Link>
            ))}
          </div>
          <Link
            to="#"
            onClick={(e) => {
              e.preventDefault();
              handleLogout();
            }}
            className="flex items-center py-3 px-2 md:px-3 text-sm font-medium text-gray-500 hover:text-kidoova-accent transition-colors duration-200"
          >
            <span className="text-xl md:text-lg">🚪</span>
            <span className="hidden md:inline ml-2">Logout</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 