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
          A research-backed app that helps your child build independence, resilience, and purpose—one rewarding day at a time.
        </p>
         <center>
              <div 
                id="google-login-button-hero" 
                className="w-full max-w-md transform scale-125 md:scale-150"
              ></div></center>
      </section>

      {/* App Preview Section */}
      <section className="py-16 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-4">See Kidoova In Action</h2>
        <p className="text-lg mb-6">Scroll through a real walkthrough of how your child tracks progress, earns rewards, and builds confidence.</p>
        <div className="flex justify-center">
          <div className="w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-lg">
            {/* Placeholder for demo video */}
            <video
              controls
              autoPlay
              muted
              loop
              className="w-full h-full object-cover"
            >
              <source src="/demo.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </section>

      {/* Rewards & Tracking */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Track Growth. Celebrate Wins. Earn Rewards.</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition-shadow">
              <div className="text-green-500 mb-4 text-4xl">🎯</div>
              <h3 className="text-xl font-semibold mb-2">Daily Progress</h3>
              <p>See how your child improves every day across five key areas of confidence.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition-shadow">
              <div className="text-yellow-500 mb-4 text-4xl">🏆</div>
              <h3 className="text-xl font-semibold mb-2">Confidence Rewards</h3>
              <p>Earn points and unlock milestone badges as your child completes challenges and hits streaks.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow hover:shadow-xl transition-shadow">
              <div className="text-blue-500 mb-4 text-4xl">📊</div>
              <h3 className="text-xl font-semibold mb-2">Visual Trackers</h3>
              <p>Motivate your child with visual charts that highlight progress, consistency, and streaks.</p>
            </div>
          </div>
        </div>
      </section>

{/* Testimonials */}
<section className="py-16 bg-white text-center">
  <h2 className="text-3xl font-bold mb-8">What Parents Are Saying</h2>
  <div className="max-w-4xl mx-auto space-y-12">
    <blockquote className="text-lg italic relative">
      “My son asks for his challenge every morning. It’s become part of our rhythm.”
      <span className="block mt-4 font-semibold text-gray-700">— Amanda R., Mom of 6-year-old</span>
    </blockquote>
    <blockquote className="text-lg italic relative">
      “I love how simple it is, and how much better my daughter handles setbacks now.”
      <span className="block mt-4 font-semibold text-gray-700">— Jacob T., Dad of 8-year-old</span>
    </blockquote>
    <blockquote className="text-lg italic relative">
      “We used to struggle with confidence. Now we celebrate progress every night.”
      <span className="block mt-4 font-semibold text-gray-700">— Priya M., Parent of 5-year-old twins</span>
    </blockquote>
  </div>
</section>


{/* Research Section */}
<section className="py-16 bg-gray-50 text-center">
  <h2 className="text-3xl font-bold mb-6">Backed by Research. Built for Real Life.</h2>
  <p className="text-lg mb-10 max-w-3xl mx-auto">
    Kidoova is grounded in decades of child development research, combining key principles from the world’s top developmental psychologists into a daily, approachable format for parents.
  </p>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
    <div>
      <h3 className="font-semibold text-lg mb-2">Growth Mindset</h3>
      <p>Based on the work of Dr. Carol Dweck, we teach kids that effort builds ability, helping them embrace challenges and learn from mistakes.</p>
    </div>
    <div>
      <h3 className="font-semibold text-lg mb-2">Self-Efficacy & Confidence</h3>
      <p>Following Albert Bandura’s research, our challenges are designed to build belief in one’s own abilities through mastery and encouragement.</p>
    </div>
    <div>
      <h3 className="font-semibold text-lg mb-2">Social & Emotional Learning</h3>
      <p>Influenced by Harvard’s SEL framework and the Child Mind Institute, Kidoova supports emotional growth and communication skills in daily life.</p>
    </div>
  </div>
  <p className="text-sm mt-8 text-gray-500">Sources: Dweck (2006), Bandura (1997), Denham (1998), Duckworth (2005), SEL in Schools (HGSE)</p>
</section>


      {/* CTA */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Your Journey Starts Today</h2>
        <p className="text-lg mb-6">Join thousands of parents helping kids build confidence through practice, tracking, and rewards.</p>
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
