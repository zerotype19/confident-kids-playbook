import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PrivateRoute } from '../components/PrivateRoute';
import AuthenticatedPageWrapper from '../components/AuthenticatedPageWrapper';

export const ParentGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-gray-900">Kidoova Parent Guide</h1>
          <p className="text-xl text-gray-600 mb-12">Helping Your Child Build Confidence, One Day at a Time</p>
          
          <div className="prose prose-lg max-w-none text-gray-900">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">💡 What Is Kidoova?</h2>
              <p className="mb-4">
                Kidoova gives you short, research-backed challenges you can do with your child to build real-world confidence, resilience, and purpose — in just a few focused minutes a day.
              </p>
              <p>
                It's not about doing it perfectly — it's about showing up, trying together, and building emotional strength through practice.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">✅ How to Use the App</h2>
              
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🏠 1. Start on the Dashboard</h3>
                <p className="mb-4">Each day, you'll see:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Today's Challenge</li>
                  <li>This Week's Theme (e.g. Brave Voice Week)</li>
                  <li>A simple explanation of the goal and steps to try</li>
                </ul>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🧭 What to do:</h4>
                  <ul className="list-disc pl-6">
                    <li>Read the goal and steps</li>
                    <li>Choose 1 or 2 that fit your day</li>
                    <li>Use the example dialogue if needed</li>
                    <li>Click Mark Challenge Complete when you're done</li>
                  </ul>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">📈 2. Track Confidence Over Time</h3>
                <p className="mb-4">After each challenge, your child reflects on how confident they felt using an emoji slider.</p>
                <p className="mb-4">You'll see:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>A Confidence Trend Chart over time</li>
                  <li>A Summary Message based on how things are going — like "You're trending upward — keep it up!" or "Confidence dipped — let's keep practicing!"</li>
                </ul>
                <p>This gives you insight into how your child is growing emotionally.</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🎯 3. Celebrate Progress & Rewards</h3>
                <p className="mb-4">As you complete challenges, your child earns:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Challenge Streaks (daily momentum)</li>
                  <li>Trophies for milestone completions (5, 10, 20...)</li>
                  <li>A Confidence Star, which fills up as they complete challenges in each pillar</li>
                  <li>Pillar Progress Bars, showing growth in different skill areas</li>
                </ul>
                <p>Celebrating effort makes confidence stick.</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">🏛 4. Explore the Pillars</h3>
                <p className="mb-4">Kidoova's challenges are grouped into 5 research-backed skill areas:</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-200">
                    <thead>
                      <tr>
                        <th className="px-4 py-2 border-b">Pillar</th>
                        <th className="px-4 py-2 border-b">What It Builds</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-2 border-b">🌱 Independence & Problem-Solving</td>
                        <td className="px-4 py-2 border-b">Critical thinking, initiative, self-trust</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b">💪 Growth Mindset & Resilience</td>
                        <td className="px-4 py-2 border-b">Persistence, learning from mistakes</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b">🗣 Social Confidence & Communication</td>
                        <td className="px-4 py-2 border-b">Expressing ideas, handling social situations</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b">🧭 Purpose & Strength Discovery</td>
                        <td className="px-4 py-2 border-b">Recognizing talents and interests</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2 border-b">🛡 Managing Fear & Anxiety</td>
                        <td className="px-4 py-2 border-b">Bravery, calmness, emotional regulation</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-4">You can view all challenges by pillar or filter by type and difficulty anytime.</p>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">💬 5. Get Support Anytime</h3>
                <p className="mb-4">Need a hand or a reminder?</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Tap Parent Guide from your Dashboard</li>
                  <li>Use the Parenting Coach chat bubble for ideas or help</li>
                </ul>
                <p>Everything is designed to be simple, supportive, and doable — even on busy days</p>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">🚀 How to Start Using Kidoova Today (Quick Walkthrough)</h2>
              <ol className="list-decimal pl-6 mb-4">
                <li>Log in and choose your child from the dropdown</li>
                <li>Go to the Dashboard to see today's challenge</li>
                <li>Read the goal + steps, and pick one to try today</li>
                <li>Try the challenge together (even for 5 minutes)</li>
                <li>Click Mark Challenge Complete</li>
                <li>Fill in the quick confidence reflection (optional but helpful!)</li>
              </ol>
              <p className="text-lg font-semibold">🎉 That's it — your child earns a reward, and you both build confidence together.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">💡 Tips for Success</h2>
              <ul className="list-disc pl-6 mb-4">
                <li>Don't worry about doing it "right" — do it consistently</li>
                <li>Praise effort, not just success</li>
                <li>Let your child try things their way</li>
                <li>It's okay to pause or come back later</li>
                <li>Keep it light, fun, and conversational</li>
              </ul>
              <p className="text-lg font-semibold text-center mt-8">✨ Every time you show up, you're helping your child believe in themselves. That's real progress. ✨</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentGuidePage; 