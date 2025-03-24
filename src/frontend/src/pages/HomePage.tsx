import React, { useEffect } from "react"

interface GoogleCredentialResponse {
  credential: string
  select_by: string
  g_csrf_token: string
}

interface GoogleLoginResponse {
  clientId: string
  credential: string
  select_by: string
  g_csrf_token: string
}

// Declare global callback function with proper types
declare global {
  interface Window {
    handleGoogleLogin: (response: GoogleCredentialResponse) => Promise<void>;
  }
}

export default function HomePage(): JSX.Element {
  useEffect(() => {
    // Define the callback function with proper types
    window.handleGoogleLogin = async (response: GoogleCredentialResponse) => {
      console.log("✅ Google login response", response)
      const token = response.credential

      try {
        const res = await fetch("/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        })

        const data = await res.json()
        if (data.success) {
          localStorage.setItem("jwt", data.jwt)
          window.location.href = "/dashboard"
        } else {
          alert("Login failed")
        }
      } catch (error) {
        console.error("Login error:", error)
        alert("Login failed")
      }
    }
  }, [])

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
        <div id="g_id_onload"
          data-client_id="GOOGLE_CLIENT_ID"
          data-callback="handleGoogleLogin"
          data-auto_prompt="false">
        </div>
        <div className="g_id_signin"
          data-type="standard"
          data-shape="pill"
          data-theme="outline"
          data-text="sign_in_with"
          data-size="large">
        </div>
      </div>

      <footer className="text-sm text-gray-400 pb-6">
        <p>© 2025 Confident Kids Playbook</p>
        <p>About | Contact | Terms</p>
      </footer>
    </div>
  )
} 