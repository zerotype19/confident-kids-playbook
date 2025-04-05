import React from "react"
import { useAuth } from "../contexts/AuthContext"
import PageWrapper from "../components/PageWrapper"

export default function Team(): JSX.Element {
  const { isAuthenticated } = useAuth()

  return (
    <PageWrapper>
      <main className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Team</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Dr. Sarah Chen</h2>
              <p className="text-gray-600 mb-4">Founder & Child Psychologist</p>
              <p className="text-gray-600">
                With over 15 years of experience in child psychology, Dr. Chen leads our team in developing evidence-based confidence-building activities.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Michael Rodriguez</h2>
              <p className="text-gray-600 mb-4">Head of Product</p>
              <p className="text-gray-600">
                Michael brings his expertise in educational technology to ensure Kidoova delivers an engaging and effective experience for children.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Lisa Thompson</h2>
              <p className="text-gray-600 mb-4">Content Director</p>
              <p className="text-gray-600">
                Lisa oversees the creation of all challenges and activities, ensuring they're both fun and developmentally appropriate.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">David Kim</h2>
              <p className="text-gray-600 mb-4">Engineering Lead</p>
              <p className="text-gray-600">
                David leads our technical team in building a secure and reliable platform that families can trust.
              </p>
            </div>
          </div>
        </div>
      </main>
    </PageWrapper>
  )
} 