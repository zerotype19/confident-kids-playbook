import React from "react"
import { useAuth } from "../contexts/AuthContext"

export default function Team(): JSX.Element {
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
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Our Team</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              We're a team of parents, educators, child development researchers, and creators—united by one belief: Confidence is not something kids are born with. It's something they build.
            </p>

            <p className="text-gray-600 mb-6">
              We design every part of Kidoova to make that journey easier and more joyful for families.
            </p>

            <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Who we are:</h2>

            <ul className="list-disc pl-5 space-y-4 text-gray-600">
              <li>Parents first—we live this stuff daily.</li>
              <li>Researchers and educators—grounded in developmental psychology and social-emotional learning.</li>
              <li>Builders and designers—committed to creating a warm, modern experience that supports real family life.</li>
            </ul>

            <p className="text-gray-600 mt-8">
              We're small, independent, and purpose-driven—and we're here to grow with you.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
} 