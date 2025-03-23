// src/backend/api/challenges_complete.ts

export async function onRequestPost({ request }) {
  const body = await request.json()
  const { child_id, challenge_id } = body

  if (!child_id || !challenge_id) {
    return new Response(JSON.stringify({ error: "Missing child_id or challenge_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  // TODO: Insert log entry into D1 (challenge_logs), update coins/streak
  // This is just a placeholder response
  return new Response(JSON.stringify({
    success: true,
    message: "Challenge marked complete",
    new_streak: 4,
    new_coins: 120
  }), {
    headers: { "Content-Type": "application/json" }
  })
}
