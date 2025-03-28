import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from './OnboardingState';

export default function FamilyChildScreen(): JSX.Element {
  const { setCurrentStep, familyData, setFamilyData, children, addChild, removeChild } = useOnboarding();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [newChild, setNewChild] = useState({
    name: '',
    birthdate: '',
    gender: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const apiUrl = import.meta.env.VITE_API_URL;
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('No authentication token found');

      // Create family
      const familyResponse = await fetch(`${apiUrl}/api/family/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(familyData)
      });

      if (!familyResponse.ok) throw new Error('Failed to create family');

      // Create children
      for (const child of children) {
        const childResponse = await fetch(`${apiUrl}/api/children/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${jwt}`
          },
          body: JSON.stringify(child)
        });

        if (!childResponse.ok) throw new Error('Failed to create child profile');
      }

      // Mark onboarding as complete
      const completeResponse = await fetch(`${apiUrl}/api/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      });

      if (!completeResponse.ok) throw new Error('Failed to complete onboarding');

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChild.name) return;

    // Check for duplicate names
    if (children.some(child => child.name === newChild.name)) {
      setError('A child with this name already exists');
      return;
    }

    addChild(newChild);
    setNewChild({ name: '', birthdate: '', gender: '' });
  };

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create Your Family
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Family Name */}
          <div>
            <label htmlFor="familyName" className="block text-sm font-medium text-gray-700 mb-1">
              Family Name
            </label>
            <input
              type="text"
              id="familyName"
              value={familyData.name}
              onChange={(e) => setFamilyData({ name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter your family name"
              required
            />
          </div>

          {/* Children List */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Children</h3>
            {children.map((child, index) => (
              <div key={index} className="flex items-center justify-between mb-2 p-3 bg-gray-50 rounded-md">
                <div>
                  <p className="font-medium">{child.name}</p>
                  {child.birthdate && <p className="text-sm text-gray-500">Birthdate: {child.birthdate}</p>}
                  {child.gender && <p className="text-sm text-gray-500">Gender: {child.gender}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => removeChild(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          {/* Add Child Form */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add Child</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="childName" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="childName"
                  value={newChild.name}
                  onChange={(e) => setNewChild({ ...newChild, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter child's name"
                  required
                />
              </div>

              <div>
                <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-1">
                  Birthdate (Optional)
                </label>
                <input
                  type="date"
                  id="birthdate"
                  value={newChild.birthdate}
                  onChange={(e) => setNewChild({ ...newChild, birthdate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                  Gender (Optional)
                </label>
                <select
                  id="gender"
                  value={newChild.gender}
                  onChange={(e) => setNewChild({ ...newChild, gender: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddChild}
                className="w-full py-2 px-4 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Add Child
              </button>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-2 px-4 text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || children.length === 0}
              className={`py-2 px-6 font-medium rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors
                ${isSubmitting || children.length === 0
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
            >
              {isSubmitting ? 'Creating...' : 'Complete Setup →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 