import React from "react"
import { useAuth } from "../contexts/AuthContext"

export default function PrivacyPolicy(): JSX.Element {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              We care about your family's safety—and your trust. That's why:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
              <li>We don't sell or share your personal data.</li>
              <li>We only collect information that helps improve your experience.</li>
              <li>We store your data securely and give you full control.</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">What we collect:</h2>

            <ul className="list-disc pl-5 space-y-2 text-gray-600 mb-6">
              <li>Name and email (for login and account communication)</li>
              <li>Child profile info (only what you choose to share)</li>
              <li>App activity (so we can help improve features)</li>
            </ul>

            <p className="text-gray-600 mb-6">
              We never collect or store sensitive personal data. Your child's notes, photos, and progress are private and protected.
            </p>

            <p className="text-gray-600">
              For more, please see our full Privacy Policy Document.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 