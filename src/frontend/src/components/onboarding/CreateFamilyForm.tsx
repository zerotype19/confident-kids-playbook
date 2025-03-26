import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateFamilyForm(): JSX.Element {
  const [familyName, setFamilyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const response = await fetch(`${apiUrl}/api/family/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
          name: familyName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create family');
      }

      // Navigate to child creation after successful family creation
      navigate('/onboarding/child');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Your Family</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
            Family Name
          </label>
          <input
            type="text"
            id="familyName"
            value={familyName}
            onChange={(e) => setFamilyName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter your family name"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 px-4 rounded-xl text-white font-medium
            ${isSubmitting 
              ? 'bg-indigo-400 cursor-not-allowed' 
              : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
        >
          {isSubmitting ? 'Creating...' : 'Create Family'}
        </button>
      </form>
    </div>
  );
} 