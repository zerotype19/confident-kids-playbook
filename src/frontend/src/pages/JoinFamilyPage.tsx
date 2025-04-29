import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function JoinFamilyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading'|'error'|'success'>('loading');
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

    // Accept invite regardless of authentication status
    const acceptInvite = async () => {
      setStatus('loading');
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/family_join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ invite_code: code })
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to accept invite');
        }

        const data = await res.json();
        setStatus('success');

        // If we got a redirect URL, use it
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        } else {
          setTimeout(() => navigate('/dashboard', { replace: true }), 1000);
        }
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to accept invite');
      }
    };

    acceptInvite();
  }, [location.search, navigate]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Joining family...</div>;
  }
  if (status === 'error') {
    return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  }
  return <div className="min-h-screen flex items-center justify-center text-green-600">Success! Redirecting...</div>;
} 