import { Env } from '../types'
import { D1Database } from '@cloudflare/workers-types'

interface ReflectionData {
  child_id: string
  challenge_id: string
  feeling: number
  reflection: string
}

export async function onRequest(request: Request, env: Env) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const data = await request.json<ReflectionData>()
    
    // Validate feeling is between 1 and 5
    if (data.feeling < 1 || data.feeling > 5) {
      return new Response('Feeling must be between 1 and 5', { status: 400 })
    }

    const db = env.DB as D1Database
    
    // Insert the reflection
    const result = await db.prepare(
      `INSERT INTO reflections (child_id, challenge_id, feeling, reflection, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(data.child_id, data.challenge_id, data.feeling, data.reflection).run()

    if (!result.success) {
      throw new Error('Failed to insert reflection')
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    console.error('Error saving reflection:', error)
    return new Response('Failed to save reflection', { status: 500 })
  }
} 