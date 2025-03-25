interface Env {
  DB: D1Database
}

interface User {
  id: string
  email: string
  name: string
  created_at: string
  has_completed_onboarding: boolean
}

export const DB = {
  async getUserById(db: D1Database, id: string): Promise<User | null> {
    return await db.prepare(
      "SELECT * FROM users WHERE id = ?"
    )
      .bind(id)
      .first<User>();
  },

  async getOrCreateUserByEmail(email: string, name: string, env: Env): Promise<User> {
    // Check for existing user
    const existingUser = await env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    )
      .bind(email)
      .first<User>()

    if (existingUser) {
      return existingUser
    }

    // Create new user
    const result = await env.DB.prepare(`
      INSERT INTO users (email, name, created_at)
      VALUES (?, ?, datetime('now'))
    `)
      .bind(email, name)
      .run()

    if (!result.success) {
      throw new Error("Failed to create user")
    }

    const newUser = await env.DB.prepare(
      "SELECT * FROM users WHERE email = ?"
    )
      .bind(email)
      .first<User>()

    if (!newUser) {
      throw new Error("Failed to retrieve created user")
    }

    return newUser
  }
} 