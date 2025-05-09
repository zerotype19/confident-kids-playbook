import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PlaybookPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('user-guide');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      // Close sidebar on mobile after selecting a section
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="md:hidden mr-4 text-neutral-600 hover:text-neutral-900"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <a href="/" className="flex items-center">
                <img src="/logo.png" alt="Kidoova" className="h-8 w-auto" />
              </a>
            </div>
            <div id="g_id_onload"
              data-client_id={window.location.hostname === 'localhost' ? process.env.REACT_APP_GOOGLE_CLIENT_ID : process.env.REACT_APP_GOOGLE_CLIENT_ID_PROD}
              data-context="signin"
              data-callback="handleCredentialResponse"
              data-auto_prompt="false">
            </div>
            <div className="g_id_signin"
              data-type="standard"
              data-size="large"
              data-theme="outline"
              data-text="sign_in_with"
              data-shape="rectangular"
              data-logo_alignment="left">
            </div>
          </div>
        </div>
      </header>

      {/* Main Content with Sidebar */}
      <div className="pt-16 flex">
        {/* Sidebar Navigation */}
        <nav className={`fixed md:static w-64 h-[calc(100vh-4rem)] overflow-y-auto bg-neutral-50 p-4 border-r border-neutral-200 transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } z-40`}>
          <div className="sticky top-0">
            <h2 className="text-lg font-semibold text-neutral-800 mb-4">Table of Contents</h2>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection('user-guide')}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeSection === 'user-guide' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  User Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('communication')}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeSection === 'communication' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Communication Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('pillars')}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeSection === 'pillars' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  The 5 Training Zones of Confidence
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('age-adaptation')}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeSection === 'age-adaptation' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Age Adaptation
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('daily-habits')}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeSection === 'daily-habits' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Daily Habits
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('troubleshooting')}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeSection === 'troubleshooting' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Troubleshooting
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection('appendix')}
                  className={`w-full text-left px-3 py-2 rounded-lg ${
                    activeSection === 'appendix' ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  Appendix
                </button>
              </li>
            </ul>
          </div>
        </nav>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:ml-64">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">Raising Confident Kids Playbook</h1>
            <p className="text-lg text-neutral-700 mb-8">A comprehensive guide for parents to help their children develop confidence, resilience, and independence.</p>

            {/* User Guide Section */}
            <section id="user-guide" className="mb-12">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">User Guide</h2>
                <div className="space-y-4 text-neutral-700">
                  <p>This playbook is designed to help you raise confident, resilient children. Each section builds on the previous one, but feel free to jump to topics that are most relevant to your current needs.</p>
                  <div>
                    <h3 className="font-medium mb-2">How to Use This Guide:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Start with the Communication section to build a strong foundation</li>
                      <li>Explore the 5 Training Zones to understand key confidence-building principles</li>
                      <li>Use the Age Adaptation section to tailor strategies to your child's development</li>
                      <li>Implement Daily Habits to reinforce confidence consistently</li>
                      <li>Refer to Troubleshooting when you encounter challenges</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Communication Section */}
            <section id="communication" className="mb-12">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Communication Guide</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">The Power of Words</h3>
                    <p className="text-neutral-700">How we communicate with our children shapes their self-perception and confidence. Use these strategies to build a positive communication foundation:</p>
                    <ul className="list-disc pl-6 mt-4 space-y-2 text-neutral-700">
                      <li>Ask, Don't Tell – Instead of giving answers, ask questions that help kids think for themselves.</li>
                      <li>Praise the Process, Not Just the Outcome – Recognize effort, perseverance, and problem-solving, not just success.</li>
                      <li>Encourage Without Pushing – Create opportunities for kids to explore and try without pressure to be perfect.</li>
                      <li>Model Confidence Yourself – Kids learn by example - show resilience, self-belief, and positive self-talk in your own life.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* The 5 Training Zones Section */}
            <section id="pillars" className="mb-12">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">The 5 Training Zones of Confidence in Kids</h2>
                <div className="space-y-6">
                  <p className="text-neutral-700">These five training zones form the foundation of confidence in children. Each zone builds upon the others, creating a strong framework for healthy development.</p>
                  
                  {/* Training Zone 1 */}
                  <div className="border-t border-neutral-200 pt-6">
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">Training Zone 1: Independence & Problem-Solving</h3>
                    <p className="text-neutral-700">Teaching children to think for themselves and solve problems independently builds self-trust and confidence.</p>
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-700 mb-2">Key Strategies:</h4>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Use the "Ask, Don't Tell" method</li>
                        <li>Allow appropriate struggle</li>
                        <li>Guide through questions rather than solutions</li>
                        <li>Celebrate independent problem-solving</li>
                      </ul>
                    </div>
                  </div>

                  {/* Training Zone 2 */}
                  <div className="border-t border-neutral-200 pt-6">
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">Training Zone 2: Growth Mindset & Resilience</h3>
                    <p className="text-neutral-700">Helping children develop a growth mindset enables them to see challenges as opportunities for growth.</p>
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-700 mb-2">Key Strategies:</h4>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Teach the power of "yet"</li>
                        <li>Model resilience in your own life</li>
                        <li>Normalize mistakes as learning opportunities</li>
                        <li>Focus on progress rather than perfection</li>
                      </ul>
                    </div>
                  </div>

                  {/* Training Zone 3 */}
                  <div className="border-t border-neutral-200 pt-6">
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">Training Zone 3: Social Confidence & Communication</h3>
                    <p className="text-neutral-700">Building social skills and communication abilities helps children navigate relationships and express themselves confidently.</p>
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-700 mb-2">Key Strategies:</h4>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Practice conversation starters</li>
                        <li>Role-play social scenarios</li>
                        <li>Teach active listening</li>
                        <li>Encourage self-expression</li>
                      </ul>
                    </div>
                  </div>

                  {/* Training Zone 4 */}
                  <div className="border-t border-neutral-200 pt-6">
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">Training Zone 4: Purpose & Strength Discovery</h3>
                    <p className="text-neutral-700">Helping children discover their unique strengths and find purpose in their activities builds lasting confidence.</p>
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-700 mb-2">Key Strategies:</h4>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Use the "Strength Journal" exercise</li>
                        <li>Encourage exploration of interests</li>
                        <li>Celebrate unique talents</li>
                        <li>Connect activities to personal values</li>
                      </ul>
                    </div>
                  </div>

                  {/* Training Zone 5 */}
                  <div className="border-t border-neutral-200 pt-6">
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">Training Zone 5: Managing Fear & Anxiety</h3>
                    <p className="text-neutral-700">Teaching children to handle fear and anxiety builds resilience and confidence in facing challenges.</p>
                    <div className="mt-4">
                      <h4 className="font-medium text-neutral-700 mb-2">Key Strategies:</h4>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Use the "Reframe the Fear" technique</li>
                        <li>Break challenges into smaller steps</li>
                        <li>Practice calming techniques</li>
                        <li>Celebrate brave actions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Age Adaptation Section */}
            <section id="age-adaptation" className="mb-12">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Age Adaptation</h2>
                <div className="space-y-6">
                  <p className="text-neutral-700">Different ages require different approaches to building confidence. Here's how to adapt strategies for different developmental stages:</p>
                  
                  <div className="grid gap-6">
                    {/* Toddlers (2-4) */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Toddlers (2-4 years)</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Focus on basic independence skills</li>
                        <li>Use simple choices to build decision-making</li>
                        <li>Provide lots of encouragement for trying</li>
                        <li>Keep instructions simple and clear</li>
                      </ul>
                    </div>

                    {/* Early Childhood (5-7) */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Early Childhood (5-7 years)</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Introduce problem-solving strategies</li>
                        <li>Teach basic emotional regulation</li>
                        <li>Encourage peer interactions</li>
                        <li>Build on natural curiosity</li>
                      </ul>
                    </div>

                    {/* Middle Childhood (8-11) */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Middle Childhood (8-11 years)</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Develop more complex problem-solving</li>
                        <li>Teach self-advocacy skills</li>
                        <li>Encourage independence in learning</li>
                        <li>Support developing interests</li>
                      </ul>
                    </div>

                    {/* Pre-Teens (12-13) */}
                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Pre-Teens (12-13 years)</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Support identity development</li>
                        <li>Teach advanced emotional intelligence</li>
                        <li>Encourage leadership opportunities</li>
                        <li>Guide decision-making processes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Daily Habits Section */}
            <section id="daily-habits" className="mb-12">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Daily Habits for Building Confidence</h2>
                <div className="space-y-6">
                  <p className="text-neutral-700">Small, consistent actions build lasting confidence. Here are daily habits to implement:</p>
                  
                  <div className="grid gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Morning Routines</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Start with positive affirmations</li>
                        <li>Let children make simple choices</li>
                        <li>Encourage self-care tasks</li>
                        <li>Set a positive tone for the day</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">After-School Time</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Ask about challenges and successes</li>
                        <li>Support homework independence</li>
                        <li>Encourage physical activity</li>
                        <li>Provide unstructured play time</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Evening Routines</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Reflect on the day's achievements</li>
                        <li>Practice gratitude together</li>
                        <li>Set goals for tomorrow</li>
                        <li>End with positive connection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Troubleshooting Section */}
            <section id="troubleshooting" className="mb-12">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Troubleshooting Common Challenges</h2>
                <div className="space-y-6">
                  <div className="grid gap-6">
                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Fear of Failure</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Normalize mistakes as learning opportunities</li>
                        <li>Share your own experiences with failure</li>
                        <li>Break tasks into smaller steps</li>
                        <li>Celebrate effort and progress</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Social Anxiety</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Practice social skills through role-play</li>
                        <li>Start with small social interactions</li>
                        <li>Teach calming techniques</li>
                        <li>Build on existing friendships</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium text-neutral-700 mb-2">Perfectionism</h3>
                      <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                        <li>Focus on progress over perfection</li>
                        <li>Set realistic expectations</li>
                        <li>Model self-compassion</li>
                        <li>Celebrate small improvements</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Appendix Section */}
            <section id="appendix" className="mb-12">
              <div className="bg-neutral-50 p-6 rounded-lg">
                <h2 className="text-xl font-semibold text-neutral-800 mb-4">Appendix: Resources & References</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">Recommended Reading</h3>
                    <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                      <li>"The Whole-Brain Child" by Daniel J. Siegel</li>
                      <li>"Mindset" by Carol S. Dweck</li>
                      <li>"How to Talk So Kids Will Listen" by Adele Faber</li>
                      <li>"The Confidence Code" by Katty Kay and Claire Shipman</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">Professional Support</h3>
                    <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                      <li>Child psychologists and counselors</li>
                      <li>Parenting coaches</li>
                      <li>Family therapists</li>
                      <li>School counselors</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">Online Resources</h3>
                    <ul className="list-disc pl-6 space-y-2 text-neutral-700">
                      <li>Parenting support groups</li>
                      <li>Educational websites</li>
                      <li>Child development resources</li>
                      <li>Mental health organizations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">About Us</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="/about" className="text-base text-neutral-600 hover:text-neutral-900">Our Story</a></li>
                <li><a href="/team" className="text-base text-neutral-600 hover:text-neutral-900">Team</a></li>
                <li><a href="/playbook" className="text-base text-neutral-600 hover:text-neutral-900">Kidoova Confident Kids Playbook</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">Resources</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="/blog" className="text-base text-neutral-600 hover:text-neutral-900">Blog</a></li>
                <li><a href="/faq" className="text-base text-neutral-600 hover:text-neutral-900">FAQ</a></li>
                <li><a href="/support" className="text-base text-neutral-600 hover:text-neutral-900">Support</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="/privacy" className="text-base text-neutral-600 hover:text-neutral-900">Privacy Policy</a></li>
                <li><a href="/terms" className="text-base text-neutral-600 hover:text-neutral-900">Terms of Service</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-900 tracking-wider uppercase">Connect</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="https://twitter.com/kidoova" className="text-base text-neutral-600 hover:text-neutral-900">Twitter</a></li>
                <li><a href="https://facebook.com/kidoova" className="text-base text-neutral-600 hover:text-neutral-900">Facebook</a></li>
                <li><a href="https://instagram.com/kidoova" className="text-base text-neutral-600 hover:text-neutral-900">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-neutral-200 pt-8">
            <p className="text-base text-neutral-500 text-center">&copy; {new Date().getFullYear()} Kidoova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 