import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }

    // Here you could verify the session with your backend if needed
    console.log('Payment successful, session ID:', sessionId);
    
    // Redirect to dashboard after a short delay
    const timer = setTimeout(() => {
      navigate('/dashboard');
    }, 3000);

    return () => clearTimeout(timer);
  }, [sessionId, isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-4">Payment Successful!</h2>
        <p className="text-neutral-600 mb-6">
          Thank you for your subscription. You will be redirected to your dashboard shortly.
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-neutral-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    </div>
  );
} 