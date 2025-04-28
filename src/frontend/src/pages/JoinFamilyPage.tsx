import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function JoinFamilyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading, login } = useAuth();
  const [status, setStatus] = useState<'loading'|'error'|'success'|'unauthenticated'>('loading');
  const [error, setError] = useState<string | null>(null);

  // Helper to get code from URL
  function getInviteCode() {
    const params = new URLSearchParams(location.search);
    return params.get('code');
  }

  useEffect(() => {
    const code = getInviteCode();
    if (!code) {
      setStatus('error');
      setError('No invite code provided.');
      return;
    }
    if (!user && !isLoading) {
      setStatus('unauthenticated');
      return;
    }
    if (user) {
      // Accept invite
      const acceptInvite = async () => {
        setStatus('loading');
        setError(null);
        try {
          const token = localStorage.getItem('token');
          const apiUrl = import.meta.env.VITE_API_URL || '';
          const res = await fetch(`${apiUrl}/api/family_join`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ invite_code: code })
          });
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Failed to accept invite');
          }
          setStatus('success');
          setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
        } catch (err) {
          setStatus('error');
          setError(err instanceof Error ? err.message : 'Failed to accept invite');
        }
      };
      acceptInvite();
    }
  }, [user, isLoading, location.search, navigate]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Joining family...</div>;
  }
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <p className="mb-4">Please log in or sign up to join the family.</p>
        <button className="bg-kidoova-green text-white px-6 py-2 rounded" onClick={login}>Log In / Sign Up</button>
      </div>
    );
  }
  if (status === 'error') {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  return <div className="min-h-screen flex items-center justify-center text-green-600">Success! Redirecting...</div>;
} 