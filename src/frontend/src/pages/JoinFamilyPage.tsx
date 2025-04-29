import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function JoinFamilyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState<'loading'|'error'|'success'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

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

    // Verify invite is valid before proceeding
    const verifyInvite = async () => {
      setStatus('loading');
      setError(null);
      try {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const res = await fetch(`${apiUrl}/api/verify_invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ invite_code: code })
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || 'Invalid invite code');
        }

        // Store all invite data for use after Google auth
        localStorage.setItem('pendingInviteData', JSON.stringify({
          invite_code: code,
          family_id: data.family_id,
          role: data.role
        }));
        
        setStatus('success');
        setMessage('Redirecting to sign in...');

        // Redirect to Google sign in
        setTimeout(() => {
          window.location.href = '/login';
        }, 1000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Invalid invite code');
      }
    };

    verifyInvite();
  }, [location.search, navigate]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Verifying invite...</div>;
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-green-600">{message}</div>
    </div>
  );
} 