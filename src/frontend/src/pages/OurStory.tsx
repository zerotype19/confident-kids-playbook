import React from "react"
import { useAuth } from "../contexts/AuthContext"
import PageWrapper from "../components/PageWrapper"

export default function OurStory(): JSX.Element {
  const { isAuthenticated } = useAuth()

  return (
    <PageWrapper>
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Story</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Kidoova was born from a simple observation: children today face unprecedented challenges in developing confidence and social skills.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Beginning</h2>
            <p className="text-gray-600 mb-6">
              Our journey started when our founder, a child psychologist, noticed that traditional methods of building confidence weren't resonating with today's digital-native children.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Mission</h2>
            <p className="text-gray-600 mb-6">
              We set out to create a platform that would make confidence-building fun, engaging, and accessible to all children, regardless of their background or circumstances.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Approach</h2>
            <p className="text-gray-600 mb-6">
              Kidoova combines evidence-based psychology with gamification and technology to create an experience that children love and parents trust.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Impact</h2>
            <p className="text-gray-600 mb-6">
              Today, thousands of children across the world are building their confidence through Kidoova's daily challenges and activities.
            </p>

            <p className="text-gray-600">
              Join us in our mission to help every child develop the confidence they need to thrive in today's world.
            </p>
          </div>
        </div>
      </main>
    </PageWrapper>
  )
} 