import React from "react"
import { useAuth } from "../contexts/AuthContext"
import PageWrapper from "../components/PageWrapper"

export default function Support(): JSX.Element {
  const { isAuthenticated } = useAuth()

  return (
    <PageWrapper>
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Support</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              We're here to help! Choose from the options below to get the support you need.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Help Center</h2>
                <p className="text-gray-600 mb-4">
                  Browse our comprehensive help articles and guides.
                </p>
                <a href="/help" className="text-green-600 hover:text-green-700">
                  Visit Help Center →
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
                <p className="text-gray-600 mb-4">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <a href="mailto:support@kidoova.com" className="text-green-600 hover:text-green-700">
                  Email Support →
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQs</h2>
                <p className="text-gray-600 mb-4">
                  Find quick answers to common questions.
                </p>
                <a href="/faq" className="text-green-600 hover:text-green-700">
                  View FAQs →
                </a>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Feedback</h2>
                <p className="text-gray-600 mb-4">
                  Share your thoughts and suggestions with us.
                </p>
                <a href="/feedback" className="text-green-600 hover:text-green-700">
                  Submit Feedback →
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  )
} 