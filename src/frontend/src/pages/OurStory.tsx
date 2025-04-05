import React from "react"
import { useAuth } from "../contexts/AuthContext"

export default function OurStory(): JSX.Element {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <img src="/logo.png" alt="Kidoova Logo" className="h-8 md:h-10" />
          {!isAuthenticated && <div id="google-login-button"></div>}
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Story</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              It started with two kids—and two parents who wanted to do better.
            </p>

            <p className="text-gray-600 mb-6">
              When Emmy started doubting herself at just seven years old, and Jack became afraid to speak up in class, we knew something had to change. As parents, we wanted to raise confident kids—not just ones who followed rules or got good grades, but kids who truly believed in themselves.
            </p>

            <p className="text-gray-600 mb-6">
              We dove into research, parenting books, expert interviews, and developmental psychology. We took notes, tested scripts, created role-play games—and slowly, something powerful emerged: a simple, daily approach to raising confident, resilient, purpose-driven kids.
            </p>

            <p className="text-gray-600 mb-6">
              That approach became the foundation of Kidoova.
            </p>

            <p className="text-gray-600 mb-6">
              We're not perfect parents. We're practicing parents—just like you. And we built Kidoova for families like ours: busy, thoughtful, and determined to raise kids who feel strong from the inside out.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 