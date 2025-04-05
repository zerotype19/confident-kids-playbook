import React, { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Modal from "../components/Modal"

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
      console.log("🔑 Received Google credential");
      // Store credential temporarily for cleanup
      localStorage.setItem('google_credential', response.credential);
      
      // Exchange Google credential for JWT
      const apiUrl = import.meta.env.VITE_API_URL;
      const authResponse = await fetch(`${apiUrl}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          credential: response.credential 
        })
      });

      if (!authResponse.ok) {
        const errorData = await authResponse.json();
        console.error("❌ Auth response error:", errorData);
        throw new Error('Failed to exchange Google credential for JWT');
      }

      const { jwt } = await authResponse.json();
      console.log("✅ Received JWT, logging in");
      await login(jwt);
      // Clear the temporary credential after successful login
      localStorage.removeItem('google_credential');
      
      // Fetch user data to check onboarding status
      const userResponse = await fetch(`${apiUrl}/api/user/profile`, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user profile');
      }
      
      const userData = await userResponse.json();
      
      // Redirect based on onboarding status
      if (userData.has_completed_onboarding) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Clear the temporary credential on error
      localStorage.removeItem('google_credential');
    }
  }

  useEffect(() => {
    const scriptId = "google-oauth-script"

    const initializeGoogle = () => {
      if (
        window.google &&
        window.google.accounts &&
        window.google.accounts.id
      ) {
        console.log("✅ Google Identity Services loaded")
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleLogin
        })
        window.google.accounts.id.renderButton(
          document.getElementById("google-login-button"),
          { theme: "filled", size: "large", shape: "pill" }
        )
        // Also render the hero button with extra large size
        window.google.accounts.id.renderButton(
          document.getElementById("google-login-button-hero"),
          { theme: "filled", size: "large", shape: "pill" }
        )
        console.log("✅ Google sign-in buttons rendered")
      }
    }

    // Load Google Identity Services script
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script")
      script.src = "https://accounts.google.com/gsi/client"
      script.async = true
      script.defer = true
      script.id = scriptId
      script.onload = initializeGoogle
      document.head.appendChild(script)
    } else {
      initializeGoogle()
    }

    // Cleanup function
    return () => {
      const script = document.getElementById(scriptId)
      if (script) {
        script.remove()
      }
      // Clear Google auth state
      if (window.google?.accounts?.id) {
        try {
          // Disable auto-select to prevent automatic sign-in
          window.google.accounts.id.disableAutoSelect();
        } catch (error) {
          console.error('Error disabling Google auto-select:', error);
        }
      }
    }
  }, [googleClientId])

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src="/logo.png" alt="Kidoova Logo" className="h-8 md:h-10" />
          <div id="google-login-button"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Empowering children to build confidence through play and practice
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Kidoova helps kids build self-esteem with fun daily challenges and progress tracking!
          </p>
          <div className="flex justify-center"><center>
            <div 
              id="google-login-button-hero" 
              className="w-full max-w-md transform scale-125 md:scale-150"
            ></div></center>
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
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
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
    </div>
  )
} 