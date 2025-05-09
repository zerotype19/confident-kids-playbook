import React from 'react';
import { PrivateRoute } from '../components/PrivateRoute';
import AuthenticatedPageWrapper from '../components/AuthenticatedPageWrapper';

export const ParentGuidePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-4 text-[#00A67E] font-kidoova">💪 Kidoova Parent Guide</h1>
          <p className="text-xl text-gray-700 mb-10 font-semibold">Helping Your Child Train Confidence — One Rep at a Time</p>

          <div className="prose prose-lg max-w-none text-gray-900">
            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 mt-8">💡 What Is Kidoova?</h2>
              <p>Kidoova is your child’s confidence gym — and you’re their coach. Each day, you’ll get a short, age-appropriate, research-backed workout (formerly “challenge”) to complete together.</p>
              <p>It’s not about being perfect. It’s about showing up. In just a few focused minutes a day, you’ll help your child train key emotional skills like resilience, independence, and communication — one small rep at a time.</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 mt-8">✅ How to Use Kidoova</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">🏠 1. Start Your Day in the Training Hub</h3>
              <p>When you log in, you’ll see:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Today’s Workout — personalized by age and training zone</li>
                <li>This Week’s Focus — like “Social Warm-Ups” or “Try Again Reps”</li>
                <li>Daily Motivation for Parents — a reminder that you’re doing great too</li>
              </ul>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold mb-2 mt-4">What to do:</h4>
                <ul className="list-disc pl-6">
                  <li>Tap Today’s Workout</li>
                  <li>Walk through the steps together — each card is part of the routine</li>
                  <li>Try 1 or more steps that fit your moment</li>
                  <li>Use the “Coaching Cue” if you need help with what to say</li>
                  <li>Tap Mark Workout Complete when done</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">📊 2. Reflect and Track Growth</h3>
              <p>After each workout, your child will see a cool-down reflection prompt:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Confidence Slider: “How did this workout feel?”</li>
                <li>Optional: “What made you feel that way?”</li>
              </ul>
              <p>This builds emotional awareness and helps you track their growth.</p>
              <p className="mt-2 mb-2">You’ll be able to view:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>📈 Training Progress Charts</li>
                <li>💬 Encouragement Messages (“Confidence is building!” or “Keep training this zone”)</li>
                <li>🧠 Workout Journal (coming soon): a timeline of their emotional reps</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">🏆 3. Celebrate Training Wins</h3>
              <p>Your child earns recognition for consistency and growth:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>🔥 Streaks for showing up daily</li>
                <li>🥇 Medals at milestone XP levels (Bronze, Silver, Gold...)</li>
                <li>⭐ Confidence Star that fills as they train across all zones</li>
                <li>🧭 Zone Progress Bars showing gains in specific skills</li>
                <li>🏷 Workout Tracker sorted by age, format, and focus</li>
              </ul>
              <p>Celebrate effort, not perfection — that’s how confidence sticks.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">🧬 4. Understand Your Child’s Confidence “Training Profile”</h3>
              <p>Every workout in Kidoova includes data that helps personalize your child’s plan:</p>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Element</th>
                      <th className="px-4 py-2 border-b">What It Represents</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b">🎯 Training Zone</td>
                      <td className="px-4 py-2 border-b">The skill area being trained (like Endurance or Calm & Control)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🛠 Workout Type</td>
                      <td className="px-4 py-2 border-b">The format (e.g., Core Rep, Partner Drill, Mindset Flip)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🔢 Intensity Level</td>
                      <td className="px-4 py-2 border-b">Ranges from Light (1) to Heavy (3)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🏷 Tags</td>
                      <td className="px-4 py-2 border-b">Help filter by theme (e.g., bravery, decision-making, emotions)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>You can explore workouts by zone, format, or intensity — or follow the Today’s Workout to stay on track.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">🏋️ 5. Explore the 5 Training Zones</h3>
              <div className="overflow-x-auto mb-6">
                <table className="min-w-full bg-white border border-gray-200 mb-4">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 border-b">Training Zone</th>
                      <th className="px-4 py-2 border-b">What It Builds</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2 border-b">🧱 Core Strength</td>
                      <td className="px-4 py-2 border-b">Independence, problem-solving, decision-making</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🏃 Endurance</td>
                      <td className="px-4 py-2 border-b">Resilience, growth mindset, perseverance</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🤝 Social Mobility</td>
                      <td className="px-4 py-2 border-b">Communication, emotional expression, friendship</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">💡 Inner Strength</td>
                      <td className="px-4 py-2 border-b">Purpose, talent exploration, self-worth</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2 border-b">🧘 Calm & Control</td>
                      <td className="px-4 py-2 border-b">Bravery, emotional regulation, anxiety coping</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p>Each zone includes an overview, a progress bar, and a catalog of workouts you can revisit anytime.</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">👨‍👩‍👧‍👦 6. Built for Shared Parenting</h3>
              <p>Kidoova works across caregivers:</p>
              <ul className="list-disc pl-6 mb-6">
                <li>All parents linked to a child’s profile can view and log workouts</li>
                <li>Reflections and progress sync across devices</li>
                <li>Great for co-parenting, grandparents, or rotating routines</li>
              </ul>
              <p>Just make sure everyone’s using the same family account</p>

              <h3 className="text-xl font-semibold text-gray-800 mb-4 mt-6">💬 7. Get Help Anytime</h3>
              <p>Need a quick spotter or second opinion?</p>
              <ul className="list-disc pl-6 mb-6">
                <li>Tap Parent Guide (you’re here!)</li>
                <li>Use the 💬 Chatbot Coach for support, ideas, or encouragement</li>
                <li>Review past reflections or track zone progress anytime</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 mt-8">🚀 Quick Start: First Workout</h2>
              <ol className="list-decimal pl-6 mb-6">
                <li>Log in and select your child</li>
                <li>Tap Today’s Workout</li>
                <li>Read the cards and do a few reps together</li>
                <li>Mark it complete</li>
                <li>Complete the reflection</li>
              </ol>
              <p className="text-lg font-semibold mb-2">🎉 Celebrate — your child just trained confidence!</p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6 mt-8">💡 Tips for Parent-Coaches</h2>
              <ul className="list-disc pl-6 mb-6">
                <li>Show up consistently — even 5 minutes helps</li>
                <li>Don’t stress about “finishing” every workout</li>
                <li>Praise effort and small wins</li>
                <li>Let your child take the lead when they’re ready</li>
                <li>Use coaching prompts when you feel stuck</li>
                <li>Miss a day? No guilt — just pick it up again tomorrow</li>
              </ul>
            </section>

            <section className="mb-4">
              <h2 className="text-2xl font-semibold text-[#00A67E] mb-4 mt-8">✨ Remember: Confidence Grows Through Practice</h2>
              <p>Every Kidoova workout is a tiny rep that helps your child believe in themselves more.<br />Stay present, stay playful — and train confidence together.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentGuidePage; 