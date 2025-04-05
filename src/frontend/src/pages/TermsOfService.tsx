import React from "react"
import { useAuth } from "../contexts/AuthContext"
import PageWrapper from "../components/PageWrapper"

export default function TermsOfService(): JSX.Element {
  const { isAuthenticated } = useAuth()

  return (
    <PageWrapper>
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Welcome to Kidoova! By using our website and app, you agree to the following terms:
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Content Use</h2>
            <p className="text-gray-600 mb-6">
              All content (challenges, exercises, stories) is for personal, non-commercial use only.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Account Responsibility</h2>
            <p className="text-gray-600 mb-6">
              You're responsible for the activity that occurs under your account and for keeping your login credentials secure.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">User Content</h2>
            <p className="text-gray-600 mb-6">
              You retain ownership of any content you submit (notes, photos, etc.), but grant us permission to store it securely on your behalf.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Privacy</h2>
            <p className="text-gray-600 mb-6">
              Your privacy is extremely important to us. Please read our Privacy Policy to understand how we handle your data.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">No Professional Advice</h2>
            <p className="text-gray-600 mb-6">
              Kidoova is not a substitute for professional psychological, medical, or legal advice.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Changes to Terms</h2>
            <p className="text-gray-600 mb-6">
              We may update these terms as needed. Continued use of Kidoova means you accept any updates.
            </p>

            <p className="text-gray-600">
              If you have questions about these terms, please contact legal@kidoova.com.
            </p>
          </div>
        </div>
      </main>
    </PageWrapper>
  )
} 