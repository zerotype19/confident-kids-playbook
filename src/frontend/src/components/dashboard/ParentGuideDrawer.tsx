import React from 'react';

interface ParentGuideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ParentGuideDrawer({ isOpen, onClose }: ParentGuideDrawerProps) {
  return (
    <div className={`fixed inset-0 flex items-end justify-center transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
      <div className="w-[95%] max-w-2xl mx-auto">
        <div className="bg-white rounded-t-2xl shadow-2xl p-6 max-h-[80vh] overflow-y-auto border border-gray-200">
          {/* Content */}
          <div className="space-y-6">
            <h2 className="text-2xl font-heading text-kidoova-green flex items-center gap-2">
              <span>🧭</span>
              <span className="break-words">How to Use Daily Challenges as Parents</span>
            </h2>

            <p className="text-gray-700">
              Each daily challenge is a small step to help your child grow more confident. Here's how to get the most out of it:
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">✅</span>
                <div>
                  <h3 className="font-semibold text-kidoova-green">1. Read the Challenge</h3>
                  <p className="text-gray-700">Take a moment to understand:</p>
                  <ul className="list-disc list-inside ml-6 mt-1 text-gray-700">
                    <li>What's the goal?</li>
                    <li>Which confidence skill is being practiced?</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <h3 className="font-semibold text-kidoova-green">2. Look for an Opportunity Today</h3>
                  <p className="text-gray-700">
                    Find a moment during your normal routine—morning, after school, dinner, bedtime—where your child could try the challenge.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">🗣</span>
                <div>
                  <h3 className="font-semibold text-kidoova-green">3. Use the "Example Dialogue" (If Needed)</h3>
                  <p className="text-gray-700">
                    Each challenge includes a simple prompt to help you get the conversation started. Feel free to adapt it in your own voice.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h3 className="font-semibold text-kidoova-green">4. Just Try Your Best</h3>
                  <p className="text-gray-700">You don't have to follow every step perfectly. What matters is:</p>
                  <ul className="list-disc list-inside ml-6 mt-1 text-gray-700">
                    <li>Making a real effort</li>
                    <li>Giving your child a few focused minutes</li>
                    <li>Practicing the skill together</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <p className="text-gray-700 italic">
                  Confidence grows from small, consistent actions—not perfection. You're doing something great just by showing up.
                </p>
              </div>
            </div>
          </div>

          {/* Close button at bottom */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <span>Close</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 