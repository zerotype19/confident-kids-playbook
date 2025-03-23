import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = async () => {
    try {
      const googleAuth = await window.gapi.auth2.getAuthInstance();
      const googleUser = await googleAuth.signIn();
      const token = googleUser.getAuthResponse().id_token;

      // Exchange token for JWT
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'google', token }),
      });

      if (!response.ok) throw new Error('Login failed');
      const { token: jwt } = await response.json();
      await login(jwt);
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      const appleAuth = await window.AppleID.auth.signIn();
      const { identityToken } = appleAuth;

      // Exchange token for JWT
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider: 'apple', token: identityToken }),
      });

      if (!response.ok) throw new Error('Login failed');
      const { token: jwt } = await response.json();
      await login(jwt);
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  return (
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
  );
};

export default HomePage; 