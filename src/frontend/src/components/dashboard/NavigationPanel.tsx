import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function NavigationPanel(): JSX.Element {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Navigation</h2>
      
      <div className="space-y-3">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm w-full"
        >
          Dashboard
        </button>

        <button
          onClick={() => navigate('/pillars')}
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm w-full"
        >
          Pillars
        </button>

        <button
          onClick={() => navigate('/all-challenges')}
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm w-full"
        >
          All Challenges
        </button>

        <button
          onClick={() => navigate('/rewards')}
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm w-full"
        >
          Rewards
        </button>

        <button
          onClick={() => navigate('/onboarding/child')}
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm w-full"
        >
          Add New Child
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="bg-blue-600 text-white rounded-full px-4 py-2 text-sm w-full"
        >
          Profile Settings
        </button>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white rounded-full px-4 py-2 text-sm w-full"
        >
          Log Out
        </button>
      </div>
    </div>
  );
} 