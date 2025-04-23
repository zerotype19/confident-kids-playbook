import React, { useState } from 'react';

interface PostChallengeReflectionModalProps {
  onClose: () => void;
  onSubmit: (data: { feeling: number; reflection: string }) => Promise<void>;
  isSubmitting?: boolean;
}

const emojiFaces = ['😖', '😐', '🙂', '😄', '🤩'];
const confidenceLabels = [
  'Not Confident',
  'A Little Unsure',
  'Feeling Okay',
  'Pretty Confident',
  'Super Confident',
];

export default function PostChallengeReflectionModal({ 
  onClose, 
  onSubmit,
  isSubmitting = false 
}: PostChallengeReflectionModalProps) {
  const [feeling, setFeeling] = useState(3); // Default to middle value
  const [reflection, setReflection] = useState('');

  const handleSubmit = async () => {
    if (!reflection.trim()) {
      alert('Please share your thoughts about the challenge');
      return;
    }
    await onSubmit({ feeling, reflection });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold mb-6 text-center text-kidoova-green">How confident did you feel?</h2>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-medium mb-1 px-1">
            {confidenceLabels.map((label, i) => (
              <span key={i} className="w-1/5 text-center text-gray-600">{label}</span>
            ))}
          </div>

          <input
            type="range"
            min={1}
            max={5}
            step={1}
            value={feeling}
            onChange={(e) => setFeeling(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mb-2 accent-kidoova-green"
          />

          <div className="flex justify-between text-2xl">
            {emojiFaces.map((face, i) => (
              <span 
                key={i} 
                className={`w-1/5 text-center transition-transform duration-200 ${
                  feeling === i + 1 ? 'scale-125' : ''
                }`}
              >
                {face}
              </span>
            ))}
          </div>
        </div>

        <label className="block text-sm font-medium mb-1 text-gray-700">
          What made you feel that way?
        </label>
        <textarea
          rows={3}
          className="w-full border rounded-md p-2 mb-6 focus:ring-2 focus:ring-kidoova-green focus:border-transparent"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Write a few words about your experience..."
        />

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-xl hover:bg-gray-300 transition"
            disabled={isSubmitting}
          >
            Skip
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-kidoova-green text-white py-2 px-4 rounded-xl hover:bg-kidoova-green-dark transition disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save Reflection'}
          </button>
        </div>
      </div>
    </div>
  );
} 