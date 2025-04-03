import React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function PlaybookPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src="/logo.png" alt="Kidoova Logo" className="h-8 md:h-10" />
          <div id="google-login-button"></div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 py-8 pt-32">
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
          <div className="bg-neutral-50 p-6 rounded-lg">
            <h2 className="text-xl font-semibold text-neutral-800 mb-4">User Guide: How to Use This Playbook</h2>
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-neutral-700">Who is this for?</h3>
              <p className="text-base text-neutral-700">This playbook is for parents who want to raise confident, resilient children. Whether your child struggles with self-doubt, avoids challenges, or just needs extra encouragement, this guide will provide practical, research-backed strategies to help.</p>
            </div>
          </div>
        </section>

        {/* Add other sections following the same pattern */}
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">About Us</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Our Story</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Team</a></li>
                <li><a href="/playbook" className="text-gray-600 hover:text-gray-900">Kidoova Confident Kids Playbook</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Support</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Feedback</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-gray-900">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-gray-900">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 text-center text-gray-600">
            <p>&copy; 2024 Kidoova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 