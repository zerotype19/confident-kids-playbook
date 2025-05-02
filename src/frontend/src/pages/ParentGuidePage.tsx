import React from 'react';
import { PrivateRoute } from '../components/PrivateRoute';
import AuthenticatedPageWrapper from '../components/AuthenticatedPageWrapper';

export const ParentGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4 text-[#00A67E] font-kidoova">Kidoova Parent Guide</h1>
          <p className="text-xl text-gray-700 mb-10 font-semibold">Helping Your Child Build Confidence, One Day at a Time</p>

          <div className="prose prose-lg max-w-none text-gray-900">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">💡 What Is Kidoova?</h2>
              <p className="mb-4">Kidoova is a confidence-building app that gives you short, age-appropriate, research-backed challenges to do with your child each day.</p>
              <p>It's not about doing it perfectly — it's about doing it consistently. In just a few focused minutes, you'll be helping your child build emotional strength, resilience, and real-world confidence — one small action at a time.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">✅ How to Use Kidoova</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">🏠 1. Start Your Day on the Dashboard</h3>
              <p className="mb-2">When you log in, you'll see:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Today's Challenge — personalized by age and this week's theme</li>
                <li>This Week's Theme — like "Brave Voice Week" or "Try Something New"</li>
                <li>Daily Motivation Card for Parents — a short reminder that you're doing great too</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-2">🧭 What to do:</h4>
                <ul className="list-disc pl-6">
                  <li>Click Today's Challenge</li>
                  <li>Walk through the steps together using the card-by-card format</li>
                  <li>Try one or more steps that fit your day</li>
                  <li>Use the "example dialogue" if you need a prompt</li>
                  <li>Click Mark Challenge Complete when done</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">📊 2. Reflect and Track Growth</h3>
              <p className="mb-2">After each challenge, your child will see a quick reflection prompt:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Emoji Confidence Slider: "How confident did you feel?"</li>
                <li>Optional: "What made you feel that way?"</li>
              </ul>
              <p className="mb-2">This helps them build emotional awareness — and helps you see how they're doing.</p>
              <p className="mt-2 mb-2">You'll be able to view:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>📈 Confidence Trend Charts over time</li>
                <li>💬 Progress Messages ("You're trending upward!" or "Confidence dipped — keep practicing!")</li>
                <li>🧠 Challenge Journal (coming soon): their growing record of effort and emotional wins</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">🏆 3. Celebrate Progress & Rewards</h3>
              <p className="mb-2">Your child earns recognition for showing up and growing:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>🔥 Streaks for consecutive days completed</li>
                <li>🏅 Trophies at key milestones (5, 10, 20 challenges...)</li>
                <li>⭐ Confidence Star that fills as they complete challenges across all pillars</li>
                <li>🧱 Pillar Progress Bars that show growth in each skill area</li>
                <li>🎯 Challenge Tracker sorted by age, type, and theme</li>
              </ul>
              <p className="mb-6">Celebrating effort (not perfection) is key to making confidence stick.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">🧬 4. Understand Your Child's Confidence "DNA"</h3>
              <p className="mb-2">Every challenge in Kidoova includes metadata to help personalize your child's experience:</p>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Element</th>
                      <th className="px-4 py-2 border-b">What It Does</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b">🏛 Pillar</td>
                      <td className="px-4 py-2 border-b">Links the challenge to a skill domain (e.g., Growth Mindset)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🧪 Challenge Type</td>
                      <td className="px-4 py-2 border-b">Indicates the format (e.g., "Try It Together", "Role Play", "Reflection")</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🔢 Difficulty Level</td>
                      <td className="px-4 py-2 border-b">Ranges from 1 (easy) to 3 (more independent)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🏷 Tags</td>
                      <td className="px-4 py-2 border-b">Help filter challenges by topic (e.g., bravery, creativity, friendship)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mb-6">You can explore challenges by pillar, type, difficulty, or tag — or follow the guided "Today's Challenge" path each day.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">🏛 5. Explore the 5 Pillars of Confidence</h3>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Pillar</th>
                      <th className="px-4 py-2 border-b">What It Builds</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b">🌱 Independence & Problem-Solving</td>
                      <td className="px-4 py-2 border-b">Decision-making, initiative, critical thinking</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">💪 Growth Mindset & Resilience</td>
                      <td className="px-4 py-2 border-b">Effort, perseverance, reframing failure</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🗣 Social Confidence & Communication</td>
                      <td className="px-4 py-2 border-b">Assertiveness, self-expression, friendships</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🧭 Purpose & Strength Discovery</td>
                      <td className="px-4 py-2 border-b">Talent exploration, self-worth, intrinsic motivation</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🛡 Managing Fear & Anxiety</td>
                      <td className="px-4 py-2 border-b">Bravery, calming strategies, positive self-talk</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mb-6">You can explore pillar-specific content anytime from the Pillars section. Each includes an overview, progress bar, and relevant challenges.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">👨‍👩‍👧‍👦 6. Designed for Shared Parenting</h3>
              <p className="mb-2">Kidoova supports multiple parents or caregivers:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>All parents linked to a child's profile can view and complete challenges</li>
                <li>Reflections and progress are synced across all devices</li>
                <li>Ideal for co-parenting, grandparents, or rotating routines</li>
              </ul>
              <p className="mb-6">Just make sure each adult is logged in under the same family group.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4">💬 7. Get Help Anytime</h3>
              <p className="mb-2">Need a quick boost or clarification?</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Tap Parent Guide from the menu (you're here now!)</li>
                <li>Tap the 💬 Chatbot Coach in the corner — it offers tips, ideas, or emotional support</li>
                <li>Or revisit your child's past reflections and progress anytime</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">🚀 Quick Start Guide: First Challenge</h2>
              <ol className="list-decimal pl-6 mb-6">
                <li>Log in and select your child</li>
                <li>Visit the Dashboard</li>
                <li>Tap Today's Challenge</li>
                <li>Read the cards, try one or more steps together</li>
                <li>Mark it complete</li>
                <li>Fill out the emoji reflection with your child</li>
              </ol>
              <p className="text-lg font-semibold mb-2">🎉 Celebrate! Your child just built confidence.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">💡 Tips for Parents</h2>
              <ul className="list-disc pl-6 mb-6">
                <li>Show up consistently, even if it's just for 5 minutes</li>
                <li>Don't worry about doing it all — one step is better than none</li>
                <li>Praise effort, not just outcomes</li>
                <li>Let your child take the lead when they're ready</li>
                <li>Use the "example dialogue" when you need help knowing what to say</li>
                <li>If you miss a day, just pick it up again tomorrow — no guilt, no pressure</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2 className="text-2xl font-semibold text-[#00A67E] mb-4">✨ Remember: Confidence Grows Through Practice</h2>
              <p>Every challenge is a small investment in your child's belief in themselves.<br />Keep it light, stay curious, and enjoy the journey together.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentGuidePage; 