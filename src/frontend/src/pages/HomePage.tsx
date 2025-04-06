import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Modal from "../components/Modal"
import PageWrapper from "../components/PageWrapper"

interface GoogleCredentialResponse {
  credential: string
  select_by: string
  g_csrf_token: string
}

interface AuthResponse {
  status: 'ok' | 'error'
  jwt?: string
  user?: {
    id: string
    email: string
    name: string
    picture: string
  }
  message?: string
  details?: {
    type: string
    hasGoogleClientId: boolean
    hasCredential: boolean
  }
}

interface GoogleLoginError extends Error {
  code?: string
  message: string
}

interface GoogleIdentityServices {
  initialize: (config: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => Promise<void>;
    auto_select?: boolean;
    cancel_on_tap_outside?: boolean;
    context?: string;
    ux_mode?: "popup" | "redirect";
    prompt_parent_id?: string;
  }) => void;
  renderButton: (
    element: HTMLElement | null,
    options: {
      theme: "outline" | "filled";
      size: "large" | "medium" | "small";
      shape: "rectangular" | "pill" | "circle";
      width?: string;
      text?: string;
      type?: "standard" | "icon";
      logo_alignment?: "left" | "center";
    }
  ) => void;
  disableAutoSelect: () => Promise<void>;
  revoke: () => Promise<void>;
  prompt: () => void;
}

// Declare Google Identity Services types
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
  const [activeModal, setActiveModal] = useState<string | null>(null)

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Safety check for environment variable
  if (!googleClientId) {
    console.error("❌ VITE_GOOGLE_CLIENT_ID is missing in environment variables")
    return (
      <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center px-6">
        <div className="text-red-600">Error: Google Sign-In is not configured</div>
      </div>
    )
  }

  console.log("✅ Using Google Client ID:", googleClientId)

  const handleGoogleLogin = async (response: GoogleCredentialResponse) => {
    try {
      console.log("🔑 Received Google credential")
      // Store credential temporarily for cleanup
      localStorage.setItem('google_credential', response.credential)
      
      // Exchange Google credential for JWT
      const apiUrl = import.meta.env.VITE_API_URL
      const authResponse = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          credential: response.credential 
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
      // Clear the temporary credential after successful login
      localStorage.removeItem('google_credential')
      
      // Fetch user data to check onboarding status
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
      
      // Redirect based on onboarding status
      if (userData.has_completed_onboarding) {
        window.location.href = '/dashboard'
      } else {
        window.location.href = '/onboarding'
      }
    } catch (error) {
      console.error('Login error:', error)
      // Clear the temporary credential on error
      localStorage.removeItem('google_credential')
    }
  }

  useEffect(() => {
    const loadGoogleScript = async () => {
      try {
        // Check if script is already loaded
        if (window.google) {
          console.log('Google script already loaded');
          initializeGoogleSignIn();
          return;
        }

        // Load the Google Identity Services script
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

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLogin,
          ux_mode: 'popup',
          prompt_parent_id: 'google-login-button-hero',
          auto_select: false,
          cancel_on_tap_outside: true
        });

        // Render the sign-in button
        const button = document.getElementById('google-login-button-hero');
        if (button) {
          window.google.accounts.id.renderButton(button, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: '300',
            logo_alignment: 'left',
            text: 'signin_with'
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
      // Cleanup function
      const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (script) {
        script.remove();
      }
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          console.error('Error canceling Google sign-in:', error);
        }
      }
    };
  }, [googleClientId]);

  const openModal = (modalName: string) => {
    setActiveModal(modalName)
  }

  const closeModal = () => {
    setActiveModal(null)
  }

  const handleGetStarted = () => {
    // Create a temporary button element
    const tempButton = document.createElement('div');
    tempButton.id = 'temp-google-button';
    tempButton.style.display = 'none';
    document.body.appendChild(tempButton);
    
    // Render the Google button on this temporary element
    if (window.google?.accounts?.id) {
      window.google.accounts.id.renderButton(
        tempButton,
        { theme: "filled", size: "large", shape: "pill" }
      );
      
      // Trigger a click on the button
      const googleButton = document.querySelector('#temp-google-button > div');
      if (googleButton) {
        (googleButton as HTMLElement).click();
      }
      
      // Clean up after a short delay
      setTimeout(() => {
        document.body.removeChild(tempButton);
      }, 1000);
    } else {
      console.error('Google Identity Services not loaded');
    }
  };

  return (
    <PageWrapper>
      {/* Main content */}
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="pt-16 pb-16 px-4 bg-gradient-to-b from-green-50 to-white">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Empowering children to build confidence through play and practice
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Kidoova helps kids build self-esteem with fun daily challenges and progress tracking!
            </p>
            <div className="flex justify-center">
              <div 
                id="google-login-button-hero" 
                className="w-full max-w-md transform scale-125 md:scale-150"
              ></div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Daily Challenges Card */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-green-500 mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Daily Challenges</h2>
                <p className="text-gray-600 mb-6">
                  Help your child build confidence with bite-sized, daily tasks designed to improve problem-solving, social skills, and emotional growth.
                </p>
                <button 
                  onClick={() => openModal('daily-challenges')}
                  className="text-green-500 font-semibold hover:text-green-600 transition-colors"
                >
                  Learn More →
                </button>
              </div>

              {/* Progress Tracking Card */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-blue-500 mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Progress Tracking</h2>
                <p className="text-gray-600 mb-6">
                  Stay motivated by seeing your child's progress and achievements in real-time!
                </p>
                <button 
                  onClick={() => openModal('progress-tracking')}
                  className="text-blue-500 font-semibold hover:text-blue-600 transition-colors"
                >
                  Learn More →
                </button>
              </div>

              {/* Parent Resources Card */}
              <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
                <div className="text-yellow-500 mb-4">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-4">Parent Resources</h2>
                <p className="text-gray-600 mb-6">
                  Get expert tips, activities, and resources to make parenting easier while building your child's confidence.
                </p>
                <button 
                  onClick={() => openModal('parent-resources')}
                  className="text-yellow-500 font-semibold hover:text-yellow-600 transition-colors"
                >
                  Learn More →
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-16 px-4 bg-gray-50">
          {/* Testimonials content */}
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4">
          {/* CTA content */}
        </section>
      </div>

      {/* Modals */}
      <Modal 
        isOpen={activeModal === 'daily-challenges'} 
        onClose={closeModal} 
        title="Daily Challenges"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Purpose</h3>
            <p>Help your child grow their confidence through bite-sized, interactive tasks.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Benefits</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Focus on problem-solving, social skills, and emotional growth.</li>
              <li>Challenges are designed to be engaging and fun, keeping your child excited to learn every day.</li>
              <li>Simple, actionable steps to build skills and self-esteem, one task at a time.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Example Challenge</h3>
            <p className="italic">"Lead a group discussion and encourage others to participate."</p>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'progress-tracking'} 
        onClose={closeModal} 
        title="Progress Tracking"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Purpose</h3>
            <p>Keep track of your child's growth and development.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Features</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>See real-time updates on your child's achievements and completed challenges.</li>
              <li>Track streaks to encourage consistent progress.</li>
              <li>Visual progress bars and milestones to make learning feel rewarding and fun.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Benefits</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Helps you stay motivated with clear visual tracking of your child's improvement.</li>
              <li>Celebrate small wins and reward progress as your child moves toward their goals.</li>
            </ul>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'parent-resources'} 
        onClose={closeModal} 
        title="Parent Resources"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Purpose</h3>
            <p>Access helpful tools, tips, and expert advice to support your child's journey.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">What You'll Find</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Guides and articles on positive reinforcement, growth mindset, and confidence-building.</li>
              <li>Expert parenting tips to help manage challenging situations and nurture a confident child.</li>
              <li>Fun, interactive activities to enhance your parenting experience.</li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Benefits</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Get actionable tips you can start using today.</li>
              <li>Learn how to build a strong emotional connection with your child while fostering independence and self-esteem.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </PageWrapper>
  )
} 