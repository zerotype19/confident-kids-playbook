import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    console.log('Google login clicked');
  };

  const handleAppleLogin = () => {
    console.log('Apple login clicked');
  };

  return (
    <div style={{ padding: '2rem', color: 'red' }}>
      <h1>Landing Page Test Render</h1>
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-6">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Build Your Child's Confidence — One Day at a Time</h1>
          <ul className="mb-6 text-left max-w-md mx-auto space-y-2">
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Daily parent/child confidence-building challenges
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Interactive practice modules
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Journaling and reflection tools
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Visual progress and streak tracking
            </li>
            <li className="flex items-center">
              <span className="text-green-500 mr-2">✅</span>
              Multi-parent family sharing
            </li>
          </ul>
          <div className="space-x-4">
            <button
              onClick={handleGoogleLogin}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Sign in with Google
            </button>
            <button
              onClick={handleAppleLogin}
              className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Sign in with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 