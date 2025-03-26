import { D1Database } from '@cloudflare/workers-types'

interface UserInfo {
  email: string
  name: string
  picture: string
}

export async function createOrUpdateUser(db: D1Database, { email, name, picture }: UserInfo) {
  // Check if user exists
  const existing = await db.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first()
  if (existing) return existing

  // Otherwise create
  await db.prepare(`
    INSERT INTO users (email, name, picture)
    VALUES (?, ?, ?)
  `).bind(email, name, picture).run()

  return await db.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first()
} 