// src/pages/DashboardPage.tsx
import React, { useEffect, useState } from 'react'

export function DashboardPage() {
  const [challenge, setChallenge] = useState(null)

  useEffect(() => {
    fetch('/api/challenges/today?child_id=abc123')
      .then(res => res.json())
      .then(setChallenge)
  }, [])

  if (!challenge) return <p>Loading challenge...</p>

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Today's Challenge</h2>
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold">{challenge.title}</h3>
        <p className="text-sm text-gray-700 mb-2">{challenge.description}</p>
        <p><strong>Goal:</strong> {challenge.goal}</p>
        <p><strong>Steps:</strong> {challenge.steps}</p>
        <p><strong>Example:</strong> {challenge.example_dialogue}</p>
      </div>
    </div>
  )
}
