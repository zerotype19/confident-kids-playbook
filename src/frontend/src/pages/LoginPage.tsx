import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get invite code from URL
  const getInviteCode = () => {
    const params = new URLSearchParams(location.search);
    return params.get('invite_code');
  };

  const handleGoogleLogin = async () => {
    try {
      // Initialize Google Sign-In
      const googleAuth = await window.gapi.auth2.getAuthInstance();
      const googleUser = await googleAuth.signIn();
      const token = googleUser.getAuthResponse().id_token;
      const invite_code = getInviteCode();

      // Exchange token for JWT
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          credential: token,
          invite_code 
        }),
      });

      if (!response.ok) throw new Error('Login failed');

      const { jwt, user } = await response.json();
      await login(jwt);
      
      // Clear invite data from localStorage if it exists
      if (invite_code) {
        localStorage.removeItem('pendingInviteData');
      }
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      // Initialize Apple Sign-In
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
      navigate('/dashboard');
    } catch (error) {
      console.error('Apple login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign in with Google
            </button>

            <button
              onClick={handleAppleLogin}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Sign in with Apple
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 