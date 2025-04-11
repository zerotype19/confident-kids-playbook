import React, { useState } from 'react';
import AuthenticatedHeader from './AuthenticatedHeader';
import AuthenticatedNav from './AuthenticatedNav';
import Chatbot from './Chatbot';

interface AuthenticatedPageWrapperProps {
  children: React.ReactNode;
}

const AuthenticatedPageWrapper: React.FC<AuthenticatedPageWrapperProps> = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedHeader isMenuOpen={isMenuOpen} onToggleMenu={toggleMenu} />
      <AuthenticatedNav isMenuOpen={isMenuOpen} onCloseMenu={closeMenu} />
      <main className="md:ml-64 pt-16">
        {children}
      </main>
      <Chatbot />
    </div>
  );
};

export default AuthenticatedPageWrapper; 