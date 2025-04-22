import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"
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
  cancel: () => void;
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
          // Retry loading the script after a delay
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

        // Initialize Google Identity Services
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLogin,
          auto_select: false
        });

        // Render the sign-in button
        const button = document.getElementById('google-login-button-hero');
        if (button) {
          window.google.accounts.id.renderButton(button, {
            theme: 'outline',
            size: 'large',
            shape: 'rectangular',
            width: '300'
          });
          
          // Add a click handler to the button container
          button.addEventListener('click', (e) => {
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
      <div className="min-h-screen bg-white text-gray-800 p-4 md:p-8">
      {/* Hero Section */}
      <section className="text-center py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Raising Confident Kids Starts Here</h1>
        <p className="text-lg md:text-xl mb-6 max-w-2xl mx-auto">
          A research-backed app that helps parents build independence, resilience, and purpose—one daily challenge at a time.
        </p>
        <center>
              <div 
                id="google-login-button-hero" 
                className="w-full max-w-md transform scale-125 md:scale-150"
              ></div></center>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Built on Science</h3>
            <p>Proven techniques from child psychology to help kids grow strong inside and out.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Easy for Parents</h3>
            <p>Daily, snackable challenges that fit into real life—no parenting perfection required.</p>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-2">Real Growth for Kids</h3>
            <p>Boost independence, social skills, and self-belief in just a few minutes a day.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-2">1. Choose a Pillar</h4>
              <p>Select one of five proven confidence-building areas tailored by age.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">2. Get a Daily Challenge</h4>
              <p>Simple, actionable exercises to practice with your child—no prep required.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">3. Celebrate Growth</h4>
              <p>Track your child’s progress and reinforce their wins with encouragement and reflection.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">What Parents Are Saying</h2>
          <div className="space-y-8">
            <blockquote className="text-lg italic">“I saw my daughter speak up for herself at school after just one week. This works.”<br /><span className="block mt-2 font-semibold">– Emily, Parent of 7-year-old</span></blockquote>
            <blockquote className="text-lg italic">“We finally have a tool that’s both fun and meaningful. The daily challenges are a game-changer.”<br /><span className="block mt-2 font-semibold">– Jason, Dad of 2</span></blockquote>
          </div>
        </div>
      </section>

      {/* Scientific Credibility */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Why It Works</h2>
          <p className="text-lg mb-6">
            Based on research by child psychologists like Carol Dweck (Growth Mindset), Albert Bandura (Self-Efficacy), and studies from Harvard's SEL framework.
          </p>
          <p className="text-md text-gray-600">View sources and references in our parent guide.</p>
        </div>
      </section>

      {/* Email Lead Capture */}
      <section className="py-16 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-4">Download Our Free 30-Day Confidence Challenge</h2>
        <p className="text-lg mb-6">Get a daily calendar of confidence-building prompts to start using today.</p>
        <form className="max-w-md mx-auto flex flex-col md:flex-row gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-grow p-3 rounded-lg border border-gray-300"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Send Me the Calendar
          </button>
        </form>
      </section>

      {/* Final Call to Action */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Try the 30-Day Confidence Challenge</h2>
        <p className="text-lg mb-6">Join thousands of parents building lifelong confidence one day at a time.</p>
       <center>
              <div 
                id="google-login-button-hero" 
                className="w-full max-w-md transform scale-125 md:scale-150"
              ></div></center>
      </section>
    </div>
    </PageWrapper>
  )
} 
