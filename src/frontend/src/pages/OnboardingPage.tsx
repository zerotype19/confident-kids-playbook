import React from "react"

export default function OnboardingPage(): JSX.Element {
  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Confident Kids Playbook!</h1>
        <p className="text-xl text-green-600 mb-8">✅ You're successfully logged in.</p>
        <p className="text-gray-600">
          Let's get started with your journey to building confident kids.
        </p>
      </div>
    </div>
  )
} 