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
    { path: '/all-challenges', label: 'Challenges', icon: '🧠' },
    { path: '/rewards', label: 'Rewards', icon: '🎁' },
    { path: '/manage-children', label: 'Children', icon: '👶' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/subscription', label: 'Subscription', icon: '💳' },
  ];

  // Don't show nav on login, onboarding, or root pages
  if (['/login', '/onboarding', '/'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 z-50">
      <div className="flex justify-around items-center py-2 px-4 md:justify-center md:py-4 md:space-x-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center text-xs transition-colors duration-200 ${
              location.pathname === item.path
                ? 'text-kidoova-accent font-semibold'
                : 'text-gray-500 hover:text-kidoova-accent'
            }`}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        
        <button
          onClick={handleLogout}
          className="flex flex-col items-center text-xs text-gray-500 hover:text-red-500 transition-colors duration-200"
        >
          <span className="text-lg mb-1">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
} 