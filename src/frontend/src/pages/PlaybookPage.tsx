import React from 'react';

export default function PlaybookPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <p className="text-base text-neutral-600 mb-2">Your Guide To</p>
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Raising Confident Kids</h1>
          <p className="text-sm text-neutral-600 mb-4">v3.10.25</p>
          <p className="text-base text-neutral-700">A Research-Backed Playbook for Building Confidence, Resilience and Purpose in Children</p>
        </header>

        {/* Table of Contents */}
        <nav className="sticky top-0 bg-white border-b mb-6 p-4 rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold text-neutral-800 mb-3">Table of Contents</h2>
          <ul className="space-y-2">
            <li><a href="#user-guide" className="text-neutral-700 hover:text-neutral-900">User Guide: How to Use This Playbook</a></li>
            <li><a href="#communication" className="text-neutral-700 hover:text-neutral-900">How to Guide Your Communication with Your Child</a></li>
            <li><a href="#troubleshooting" className="text-neutral-700 hover:text-neutral-900">Troubleshooting: What if My Child…</a></li>
            <li><a href="#what-not-to-say" className="text-neutral-700 hover:text-neutral-900">What NOT to Say</a></li>
            <li><a href="#five-pillars" className="text-neutral-700 hover:text-neutral-900">The 5 Pillars of Confidence in Kids</a></li>
            <li><a href="#pillar-1" className="text-neutral-700 hover:text-neutral-900">Pillar 1: Independence & Problem-Solving</a></li>
            <li><a href="#pillar-2" className="text-neutral-700 hover:text-neutral-900">Pillar 2: Growth Mindset & Resilience</a></li>
            <li><a href="#pillar-3" className="text-neutral-700 hover:text-neutral-900">Pillar 3: Social Confidence & Communication</a></li>
            <li><a href="#pillar-4" className="text-neutral-700 hover:text-neutral-900">Pillar 4: Purpose & Strength Discovery</a></li>
            <li><a href="#pillar-5" className="text-neutral-700 hover:text-neutral-900">Pillar 5: Managing Fear & Anxiety</a></li>
            <li><a href="#age-adaptation" className="text-neutral-700 hover:text-neutral-900">How to Adapt These Techniques for Different Ages</a></li>
            <li><a href="#daily-habits" className="text-neutral-700 hover:text-neutral-900">Daily Habits for Parents</a></li>
            <li><a href="#appendix" className="text-neutral-700 hover:text-neutral-900">Appendix: Research & References</a></li>
          </ul>
        </nav>

        {/* Content Sections */}
        <section id="user-guide" className="mb-8">
          <details className="border rounded-lg mb-4 bg-neutral-50 p-4">
            <summary className="cursor-pointer text-lg font-semibold text-neutral-800">
              User Guide: How to Use This Playbook
            </summary>
            <div className="mt-2 space-y-4">
              <h3 className="text-lg font-medium text-neutral-700 mt-5 mb-2">Who is this for?</h3>
              <p className="text-base text-neutral-700 mb-4">This playbook is for parents who want to raise confident, resilient children. Whether your child struggles with self-doubt, avoids challenges, or just needs extra encouragement, this guide will provide practical, research-backed strategies to help.</p>
            </div>
          </details>
        </section>

        {/* Add other sections following the same pattern */}
      </div>
    </div>
  );
} 