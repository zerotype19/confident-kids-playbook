import React from "react"
import { useAuth } from "../contexts/AuthContext"

export default function Support(): JSX.Element {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Support</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Need help with your account? Not sure how to start the playbook? Wondering which pillar to focus on first?
            </p>

            <p className="text-gray-600 mb-6">
              We've got you.
            </p>

            <div className="space-y-4 mt-8">
              <div className="flex items-start">
                <span className="text-2xl mr-3">📧</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Email us</h3>
                  <p className="text-gray-600">support@kidoova.com</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">📘</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Browse FAQs</h3>
                  <p className="text-gray-600">Coming soon</p>
                </div>
              </div>

              <div className="flex items-start">
                <span className="text-2xl mr-3">📆</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Office hours</h3>
                  <p className="text-gray-600">We respond to all messages within 1–2 business days.</p>
                </div>
              </div>
            </div>

            <p className="text-gray-600 mt-8">
              Whether it's a bug, a question, or a parenting win you want to share—we're always happy to hear from you.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 