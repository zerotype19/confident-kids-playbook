import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

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
      navigate('/dashboard');
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
          { theme: "outline", size: "large", shape: "pill" }
        )
        console.log("✅ Google sign-in button rendered")
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
          // First disable auto-select
          window.google.accounts.id.disableAutoSelect();
          // Then revoke the current session
          window.google.accounts.id.revoke();
        } catch (error) {
          console.error('Error cleaning up Google auth state:', error);
        }
      }
    }
  }, [googleClientId])

  return (
    <div className="min-h-screen bg-kidoova-background">
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] text-center">
        <img 
          src="/logo.png" 
          alt="Kidoova Logo" 
          className="h-16 md:h-20 mb-8"
        />
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading mb-6">
          Welcome to Confident Kids Playbook
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl">
          Empowering children to build confidence through play and practice
        </p>
        <div id="google-login-button" className="mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-heading mb-4">Daily Challenges</h2>
            <p className="text-gray-600">Fun, engaging activities that build self-esteem</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-heading mb-4">Progress Tracking</h2>
            <p className="text-gray-600">Monitor your child's growth and achievements</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-heading mb-4">Parent Resources</h2>
            <p className="text-gray-600">Tools and tips to support your child's journey</p>
          </div>
        </div>
      </div>
    </div>
  )
} 