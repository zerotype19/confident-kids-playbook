import React, { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import PageWrapper from "../components/PageWrapper"

export default function Feedback(): JSX.Element {
  const { isAuthenticated } = useAuth()
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement feedback submission
    setSubmitted(true)
    setFeedback("")
  }

  return (
    <PageWrapper>
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Feedback</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              We'd love to hear your thoughts about Kidoova! Your feedback helps us improve the experience for all families.
            </p>

            {submitted ? (
              <div className="bg-green-50 p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-green-900 mb-4">Thank You!</h2>
                <p className="text-green-700">
                  Your feedback has been submitted. We appreciate you taking the time to help us improve Kidoova.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <textarea
                    id="feedback"
                    name="feedback"
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-3 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </PageWrapper>
  )
} 