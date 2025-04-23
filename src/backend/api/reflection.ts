import { Request, Response } from 'express'
import { D1Database } from '@cloudflare/workers-types'

interface ReflectionData {
  child_id: string
  challenge_id: string
  feeling: number
  reflection: string
}

export async function saveReflection(req: Request, res: Response) {
  try {
    const data = req.body as ReflectionData
    
    // Validate feeling is between 1 and 5
    if (data.feeling < 1 || data.feeling > 5) {
      return res.status(400).json({ error: 'Feeling must be between 1 and 5' })
    }

    const db = req.app.locals.db as D1Database
    
    // Insert the reflection
    const result = await db.prepare(
      `INSERT INTO reflections (child_id, challenge_id, feeling, reflection, created_at)
       VALUES (?, ?, ?, ?, datetime('now'))`
    ).bind(data.child_id, data.challenge_id, data.feeling, data.reflection).run()

    if (!result.success) {
      throw new Error('Failed to insert reflection')
    }

    return res.json({ success: true })
  } catch (error) {
    console.error('Error saving reflection:', error)
    return res.status(500).json({ error: 'Failed to save reflection' })
  }
} 