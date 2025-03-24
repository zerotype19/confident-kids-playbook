interface UserInfo {
  email: string
  name: string
  picture: string
}

export async function createOrUpdateUser({ email, name, picture }: UserInfo) {
  // Check if user exists
  const existing = await DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first()
  if (existing) return existing

  // Otherwise create
  await DB.prepare(`
    INSERT INTO users (email, name, picture)
    VALUES (?, ?, ?)
  `).bind(email, name, picture).run()

  return await DB.prepare(`SELECT * FROM users WHERE email = ?`).bind(email).first()
} 