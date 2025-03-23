// src/backend/api/challenges_today.ts

export async function onRequestGet({ params, env, request }) {
  const url = new URL(request.url)
  const childId = url.searchParams.get("child_id")

  if (!childId) {
    return new Response(JSON.stringify({ error: "Missing child_id" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    })
  }

  // TODO: replace with D1 query to select challenge of the day
  return new Response(JSON.stringify({
    id: "chal42",
    title: "Ask a Thinking Question",
    description: "Instead of solving a problem for your child, ask them a question that helps them think it through.",
    goal: "Foster independence and problem-solving",
    steps: "Ask: 'What do you think might work?', Reflect after.",
    example_dialogue: "What have you tried so far?",
    tip: "Keep it open-ended!",
    pillar_id: 1,
    age_range: "7-10",
    difficulty_level: 2
  }), {
    headers: { "Content-Type": "application/json" }
  })
}
