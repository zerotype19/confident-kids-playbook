import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface AuthenticatedNavProps {
  isMenuOpen: boolean;
  onCloseMenu: () => void;
}

const AuthenticatedNav: React.FC<AuthenticatedNavProps> = ({ isMenuOpen, onCloseMenu }) => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/pillars', label: 'Pillars', icon: '🏛️' },
    { path: '/all-challenges', label: 'Challenges', icon: '🎯' },
    { path: '/rewards', label: 'Rewards', icon: '🏆' },
  ];

  return (
    <>
      {/* Mobile menu backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-40 md:hidden"
          onClick={onCloseMenu}
        />
      )}
      
      {/* Navigation */}
      <nav
        className={`fixed left-0 top-16 bottom-0 w-64 bg-white shadow-sm transform transition-transform duration-300 ease-in-out z-50
          ${isMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 py-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={onCloseMenu}
                className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                  location.pathname === item.path ? 'bg-gray-50 border-l-4 border-kidoova-accent' : ''
                }`}
              >
                <span className="mr-3 text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-200 p-4">
            <Link
              to="/manage-children"
              onClick={onCloseMenu}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                location.pathname === '/manage-children' ? 'bg-gray-50 border-l-4 border-kidoova-accent' : ''
              }`}
            >
              <span className="mr-3 text-xl">👥</span>
              <span>Manage Children</span>
            </Link>
            <Link
              to="/manage-profile"
              onClick={onCloseMenu}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-50 ${
                location.pathname === '/manage-profile' ? 'bg-gray-50 border-l-4 border-kidoova-accent' : ''
              }`}
            >
              <span className="mr-3 text-xl">⚙️</span>
              <span>Settings</span>
            </Link>
          </div>
        </div>
      </nav>
    </>
  );
};

export default AuthenticatedNav; 