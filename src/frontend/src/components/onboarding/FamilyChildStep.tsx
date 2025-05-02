import React, { useState } from 'react';
import { useOnboarding } from './OnboardingState';

interface FamilyChildStepProps {
  onNext: () => void;
  onBack: () => void;
}

export default function FamilyChildStep({ onNext, onBack }: FamilyChildStepProps): JSX.Element {
  const { familyData, setFamilyData, children, addChild, removeChild } = useOnboarding();
  const [familyName, setFamilyName] = useState(familyData.name);
  const [childName, setChildName] = useState('');
  const [childBirthdate, setChildBirthdate] = useState('');
  const [childGender, setChildGender] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFamilyData({ name: familyName });
    onNext();
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (childName && childBirthdate && childGender) {
      addChild({ name: childName, birthdate: childBirthdate, gender: childGender });
      setChildName('');
      setChildBirthdate('');
      setChildGender('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-8">
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div>
            <label htmlFor="familyName" className="block text-sm font-bold text-gray-700">
              Family Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                name="familyName"
                id="familyName"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Add Child</h4>
            <div className="mt-4 space-y-4">
              {children.map((child, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{child.name}</p>
                    <p className="text-sm text-gray-500">
                      {child.birthdate} • {child.gender}
                    </p>
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

              {children.length === 0 && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Child's Name
                    </label>
                    <input
                      type="text"
                      placeholder="Child's Name"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Birthdate
                    </label>
                    <input
                      type="date"
                      value={childBirthdate}
                      onChange={(e) => setChildBirthdate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700">
                      Gender
                    </label>
                    <select
                      value={childGender}
                      onChange={(e) => setChildGender(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
              {children.length === 0 && (
                <button
                  type="button"
                  onClick={handleAddChild}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Add Child
                </button>
              )}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back
            </button>
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Next
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 