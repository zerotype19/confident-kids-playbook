import React from "react"

export default function HomePage(): JSX.Element {
  console.log("✅ HomePage mounted (landing)")
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
        <button className="bg-blue-600 text-white py-2 px-6 rounded-xl shadow hover:bg-blue-700">
          Sign in with Google
        </button>
        <button className="bg-black text-white py-2 px-6 rounded-xl shadow hover:bg-gray-900">
          Continue with Apple
        </button>
      </div>

      <footer className="text-sm text-gray-400 pb-6">
        <p>© 2025 Confident Kids Playbook</p>
        <p>About | Contact | Terms</p>
      </footer>
    </div>
  )
} 