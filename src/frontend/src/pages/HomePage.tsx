import React, { useEffect } from "react"

interface GoogleCredentialResponse {
  credential: string
  select_by: string
  g_csrf_token: string
}

interface AuthResponse {
  success: boolean
  jwt?: string
  error?: string
}

interface GoogleLoginError extends Error {
  code?: string
  message: string
}

// Declare Google Identity Services types
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => Promise<void>
          }) => void
          renderButton: (
            element: HTMLElement | null,
            options: {
              theme: "outline" | "filled"
              size: "large" | "medium" | "small"
              shape: "rectangular" | "pill" | "circle"
            }
          ) => void
        }
      }
    }
  }
}

export default function HomePage(): JSX.Element {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  console.log("✅ Using Google Client ID:", clientId)

  useEffect(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleLogin
      })
      window.google.accounts.id.renderButton(
        document.getElementById("google-signin-button"),
        {
          theme: "outline",
          size: "large",
          shape: "pill"
        }
      )
    }
  }, [clientId])

  const handleGoogleLogin = async (response: GoogleCredentialResponse) => {
    console.log("✅ Google login response", response)
    const token = response.credential

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json() as AuthResponse
      if (data.success && data.jwt) {
        localStorage.setItem("jwt", data.jwt)
        window.location.href = "/onboarding"
      } else {
        throw new Error(data.error || "Login failed")
      }
    } catch (error) {
      const loginError = error as GoogleLoginError
      console.error("Login error:", loginError.message)
      alert(loginError.message || "Login failed")
    }
  }

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center px-6">
      <header className="text-center py-12">
        <h1 className="text-4xl font-bold mb-4">Confident Kids Playbook</h1>
        <p className="text-lg text-gray-600">
          Build stronger, braver, more confident kids – one small daily step at a time.
        </p>
      </header>

      <section className="grid gap-6 max-w-xl text-center mb-12">
        <div className="bg-gray-50 p-4 rounded-xl shadow">
          🎯 Daily psychology-backed challenges
        </div>
        <div className="bg-gray-50 p-4 rounded-xl shadow">
          🧠 Practice modules for growth & resilience
        </div>
        <div className="bg-gray-50 p-4 rounded-xl shadow">
          📊 Progress tracking, rewards, and streaks
        </div>
        <div className="bg-gray-50 p-4 rounded-xl shadow">
          👪 Designed for real parent-child connection
        </div>
      </section>

      <div className="flex flex-col gap-4 mb-12">
        <div id="google-signin-button"></div>
      </div>

      <footer className="text-sm text-gray-400 pb-6">
        <p>© 2025 Confident Kids Playbook</p>
        <p>About | Contact | Terms</p>
      </footer>
    </div>
  )
} 