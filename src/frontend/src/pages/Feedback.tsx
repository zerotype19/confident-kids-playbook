import React from "react"
import { useAuth } from "../contexts/AuthContext"

export default function Feedback(): JSX.Element {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Feedback</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Kidoova is built with input from real parents, every step of the way.
            </p>

            <p className="text-gray-600 mb-6">
              We'd love your feedback—what's working, what's missing, what your family needs next.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-start">
                <span className="text-2xl mr-3">💬</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Got a feature idea?</h3>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">🧒</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Want more content for a specific age?</h3>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">📣</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Have a story to share?</h3>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mt-8">
              Send us a message at feedback@kidoova.com. Every response is read. Your voice shapes how we grow.
            </p>

            <p className="text-gray-600 mt-4">
              Together, we're building something better—for our kids, and for ourselves.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 