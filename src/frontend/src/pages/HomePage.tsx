import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import YouTubePlayer from "../components/YouTubePlayer"
import PrivacyPolicyModal from "../components/PrivacyPolicyModal"
import TermsModal from "../components/TermsModal"
import ContactModal from "../components/ContactModal"

interface GoogleCredentialResponse {
  credential: string
  select_by: string
  g_csrf_token: string
}

interface GoogleIdentityServices {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => Promise<void>;
  }) => void;
  renderButton: (
    element: HTMLElement | null,
    options: {
      theme: "outline" | "filled";
      size: "large" | "medium" | "small";
      shape: "rectangular" | "pill" | "circle";
    }
  ) => void;
  disableAutoSelect: () => Promise<void>;
  revoke: () => Promise<void>;
  prompt: () => void;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: GoogleIdentityServices;
      };
    };
  }
}

export default function HomePage(): JSX.Element {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const navigate = useNavigate()
  const { isAuthenticated, login } = useAuth()
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false)
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  if (!googleClientId) {
    console.error("❌ VITE_GOOGLE_CLIENT_ID is missing in environment variables")
    return (
      <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center px-6">
        <div className="text-red-600">Error: Google Sign-In is not configured</div>
      </div>
    )
  }

  const handleGoogleLogin = async (response: GoogleCredentialResponse) => {
    try {
      console.log("🔑 Received Google credential")
      localStorage.setItem('google_credential', response.credential)
      
      const params = new URLSearchParams(window.location.search);
      const inviteCode = params.get('invite_code');
      console.log('Invite code from URL:', inviteCode);
      
      const apiUrl = import.meta.env.VITE_API_URL
      const authResponse = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          credential: response.credential,
          ...(inviteCode ? { invite_code: inviteCode } : {})
        })
      })

      if (!authResponse.ok) {
        const errorData = await authResponse.json()
        console.error("❌ Auth response error:", errorData)
        throw new Error('Failed to exchange Google credential for JWT')
      }

      const { jwt } = await authResponse.json()
      console.log("✅ Received JWT, logging in")
      await login(jwt)
      localStorage.removeItem('google_credential')
      
      const userResponse = await fetch(`${apiUrl}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile')
      }
      
      const userData = await userResponse.json()
      
      if (userData.has_completed_onboarding) {
        navigate('/dashboard')
      } else {
        navigate('/onboarding')
      }
    } catch (error) {
      console.error('Login error:', error)
      localStorage.removeItem('google_credential')
    }
  }

  useEffect(() => {
    const loadGoogleScript = async () => {
      try {
        if (window.google) {
          console.log('Google script already loaded');
          initializeGoogleSignIn();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log('Google script loaded successfully');
          initializeGoogleSignIn();
        };
        script.onerror = (error) => {
          console.error('Failed to load Google script:', error);
          setTimeout(() => {
            console.log('Retrying Google script load...');
            loadGoogleScript();
          }, 2000);
        };
        document.body.appendChild(script);
      } catch (error) {
        console.error('Error loading Google script:', error);
      }
    };

    const initializeGoogleSignIn = () => {
      try {
        if (!window.google) {
          console.error('Google Identity Services not available');
          return;
        }

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLogin
        });

        // Render a narrower button in the header
        const headerButton = document.getElementById('google-login-button-hero');
        if (headerButton) {
          window.google.accounts.id.renderButton(headerButton, {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular'
          });
          headerButton.addEventListener('click', (e) => {
            console.log('Google button clicked');
            e.preventDefault();
          });
        } else {
          console.error('Google sign-in button element not found');
        }
      } catch (error) {
        console.error('Error initializing Google sign-in:', error);
      }
    };

    loadGoogleScript();

    return () => {
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.remove();
      }
      if (window.google?.accounts?.id) {
        try {
          // window.google.accounts.id.cancel(); // Removed: not part of the type
        } catch (error) {
          console.error('Error canceling Google sign-in:', error);
        }
      }
    };
  }, [googleClientId]);

  return (
    <main className="font-sans text-kidoova-green">
      {/* Sticky Header */}
      <header className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-4">
          <img src="/logo.png" alt="Kidoova" className="h-20" />
          <div id="google-login-button-hero" className="w-40 pr-2"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-kidoova-background py-20 px-6 text-center">
        <h1 className="text-5xl font-bold mb-4">💪 5-Minute Confidence Workouts for Kids</h1>
        <p className="text-xl max-w-2xl mx-auto mb-6 text-kidoova-green">Daily training sessions backed by research — designed for busy parents. Just one small rep a day.</p>
        <div id="google-login-button-hero" className="mx-auto"></div>
      </section>

      {/* Video Section */}
      <section className="bg-white py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-6">🔧 How Kidoova Helps</h2>
        <div className="max-w-3xl mx-auto">
          <video 
            src="/kidoova.mp4" 
            controls 
            autoPlay
            muted
            loop
            playsInline
            className="w-full rounded-lg shadow-kidoova"
            poster="/video-poster.jpg"
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </section>

      {/* How Kidoova Works */}
      <section className="py-20 bg-white px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">🏋️ How Kidoova Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div><h3 className="text-xl font-semibold text-kidoova-accent mb-2">Step 1: Pick a Training Zone</h3><p className="text-kidoova-green">Choose a skill area like Core Strength (independence) or Endurance (resilience).</p></div>
          <div><h3 className="text-xl font-semibold text-kidoova-accent mb-2">Step 2: Do a Confidence Workout</h3><p className="text-kidoova-green">Complete a short, research-backed activity together. No prep. No pressure.</p></div>
          <div><h3 className="text-xl font-semibold text-kidoova-accent mb-2">Step 3: Watch Strength Build</h3><p className="text-kidoova-green">Earn Training Points, hit streaks, and unlock milestone medals.</p></div>
        </div>
      </section>

      {/* What Makes Kidoova Different */}
      <section className="bg-kidoova-background py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">🧠 What Makes Kidoova Different?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div>
            <h3 className="text-xl font-semibold text-kidoova-accent mb-2">🧬 Trait Training System</h3>
            <p className="text-kidoova-green">Build confidence traits like grit, empathy, and self-direction through daily reps.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-kidoova-accent mb-2">📈 XP + Visual Progress</h3>
            <p className="text-kidoova-green">Earn Training Points and watch your child grow in each skill zone.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-kidoova-accent mb-2">⭐ Confidence Star</h3>
            <p className="text-kidoova-green">A visual tracker that fills up as your child trains across all five zones.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-kidoova-accent mb-2">🏅 Rewards & Streaks</h3>
            <p className="text-kidoova-green">Stay motivated with streaks, medals, and milestone achievements.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-kidoova-accent mb-2">🧑‍🏫 AI Parenting Coach</h3>
            <p className="text-kidoova-green">Ask questions, get coaching prompts, or troubleshoot tough moments with help from our built-in AI.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-kidoova-accent mb-2">💬 Reflection Built In</h3>
            <p className="text-kidoova-green">Simple micro-journaling helps your child cool down and reflect after each workout.</p>
          </div>
        </div>
      </section>

      {/* The 5 Confidence Training Zones */}
      <section className="py-20 px-6 text-center bg-white">
        <h2 className="text-4xl font-bold mb-10">🧱 The 5 Confidence Training Zones</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 mb-4 mx-auto">
            <thead>
              <tr>
                <th className="px-4 py-2 border-b">Zone</th>
                <th className="px-4 py-2 border-b">What It Builds</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-2 border-b">🧱 Core Strength</td>
                <td className="px-4 py-2 border-b">Independence, decision-making, and problem-solving</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">🏃 Endurance</td>
                <td className="px-4 py-2 border-b">Resilience, growth mindset, and emotional stamina</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">🤝 Social Mobility</td>
                <td className="px-4 py-2 border-b">Communication, connection, and social confidence</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">💡 Inner Strength</td>
                <td className="px-4 py-2 border-b">Personal strengths, curiosity, and intrinsic motivation</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border-b">🧘 Calm & Control</td>
                <td className="px-4 py-2 border-b">Fear management, emotional regulation, and bravery</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Progress Kids Can See (and Feel) */}
      <section className="bg-kidoova-background py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-10">🏆 Progress Kids Can See (and Feel)</h2>
        <p className="text-lg max-w-2xl mx-auto text-kidoova-green mb-6">Build streaks. Fill the Confidence Star. Earn medals. See real growth.</p>
        <img 
          src="/kidoova_rewards_collage.png" 
          alt="Confidence Tracker" 
          className="w-full max-w-[90%] sm:max-w-xl md:max-w-2xl mx-auto rounded-lg shadow-kidoova"
        />
      </section>

      {/* Testimonials */}
      <section className="bg-white py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-12">👨‍👩‍👧‍👦 What Parents Are Saying</h2>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          <div className="bg-kidoova-background p-6 rounded-lg shadow-kidoova max-w-md mx-auto">
            <p className="text-kidoova-green mb-2">“My daughter is more confident and excited to try new things thanks to Kidoova.”</p>
            <p className="text-sm text-kidoova-accent font-semibold">— Rachel, mom of 6-year-old</p>
          </div>
          <div className="bg-kidoova-background p-6 rounded-lg shadow-kidoova max-w-md mx-auto">
            <p className="text-kidoova-green mb-2">“This is what modern parenting tools should look like. Thoughtful, easy, and actually helpful.”</p>
            <p className="text-sm text-kidoova-accent font-semibold">— Marco, dad of two</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-kidoova-background py-20 px-6">
        <h2 className="text-4xl font-bold text-center mb-10">❓ Questions? We've Got Answers.</h2>
        <div className="max-w-3xl mx-auto space-y-6">
          <details className="bg-white p-4 rounded-lg shadow-kidoova">
            <summary className="cursor-pointer font-semibold text-kidoova-accent">What ages is Kidoova for?</summary>
            <p className="text-sm text-kidoova-green mt-2">Ages 3–13, with personalized experiences by age group.</p>
          </details>
          <details className="bg-white p-4 rounded-lg shadow-kidoova">
            <summary className="cursor-pointer font-semibold text-kidoova-accent">How long does it take each day?</summary>
            <p className="text-sm text-kidoova-green mt-2">Most workouts take 5–10 minutes. Easy to fit into your day.</p>
          </details>
          <details className="bg-white p-4 rounded-lg shadow-kidoova">
            <summary className="cursor-pointer font-semibold text-kidoova-accent">Can both parents use it?</summary>
            <p className="text-sm text-kidoova-green mt-2">Yes, you can share access and track together. Reflections and progress sync across devices for all caregivers.</p>
          </details>
          <details className="bg-white p-4 rounded-lg shadow-kidoova">
            <summary className="cursor-pointer font-semibold text-kidoova-accent">What research is Kidoova based on?</summary>
            <p className="text-sm text-kidoova-green mt-2">Kidoova is grounded in real developmental science and parenting psychology. Our five training zones draw from growth mindset research (Carol Dweck), social-emotional learning (CASEL), self-determination theory, and strengths-based development frameworks. We've also synthesized practices from child development experts and parenting literature to ensure the app supports real-world, confidence-building outcomes. All references used in building the playbook are listed in our research appendix.</p>
            <a href="/Kidoova_Kids_Confidence_Playbook.pdf" className="text-sm text-kidoova-accent mt-2 block">Kidoova Kid's Confidence Playbook →</a>
          </details>
        </div>
      </section>

      {/* Final CTA + Story */}
      <section className="bg-kidoova-accent text-white py-20 px-6 text-center">
        <h2 className="text-4xl font-bold mb-4">💛 Built by Parents, for Parents</h2>
        <p className="max-w-xl mx-auto mb-6 text-lg">Kidoova was inspired by our journey raising Jack and Emmy. We built the confidence training gym we wished we had — and now we hope it helps your family, too.</p>
        <div id="google-login-button-cta" className="mx-auto"></div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 px-6 text-center text-sm text-kidoova-green">
        <p>Kidoova © 2025. All rights reserved.</p>
        <div className="mt-4 space-x-4">
          <a onClick={() => setIsPrivacyModalOpen(true)} className="cursor-pointer text-kidoova-green hover:underline">Privacy Policy</a>
          <a onClick={() => setIsTermsModalOpen(true)} className="cursor-pointer text-kidoova-green hover:underline">Terms</a>
          <a onClick={() => setIsContactModalOpen(true)} className="cursor-pointer text-kidoova-green hover:underline">Contact</a>
        </div>
      </footer>

      {/* Modals */}
      <PrivacyPolicyModal 
        isOpen={isPrivacyModalOpen} 
        onClose={() => setIsPrivacyModalOpen(false)} 
      />
      <TermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
      <ContactModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </main>
  );
} 
