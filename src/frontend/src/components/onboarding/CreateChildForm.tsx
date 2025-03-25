import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AGE_RANGES = [
  '3-4 years',
  '5-6 years',
  '7-8 years',
  '9-10 years'
];

export default function CreateChildForm(): JSX.Element {
  const [childName, setChildName] = useState('');
  const [ageRange, setAgeRange] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/children/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: childName,
          age_range: ageRange,
          avatar_url: avatarUrl || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create child profile');
      }

      // Update user's onboarding status
      await fetch('/api/onboarding/complete', {
        method: 'POST',
      });

      // Navigate to dashboard after successful child creation
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto p-6 bg-white rounded-xl shadow-sm">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Create Child Profile</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
            Child's Name
          </label>
          <input
            type="text"
            id="childName"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Enter child's name"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="ageRange" className="block text-sm font-medium text-gray-700 mb-1">
            Age Range
          </label>
          <select
            id="ageRange"
            value={ageRange}
            onChange={(e) => setAgeRange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          >
            <option value="">Select age range</option>
            {AGE_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="avatarUrl" className="block text-sm font-medium text-gray-700 mb-1">
            Avatar URL (Optional)
          </label>
          <input
            type="url"
            id="avatarUrl"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="https://example.com/avatar.png"
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
          {isSubmitting ? 'Creating...' : 'Create Profile & Continue'}
        </button>
      </form>
    </div>
  );
} 