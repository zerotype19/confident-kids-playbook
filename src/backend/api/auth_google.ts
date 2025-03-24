import { Router } from "itty-router"
import { generateJWT } from "../auth"

interface Env {
  GOOGLE_CLIENT_ID: string
  JWT_SECRET: string
  DB: D1Database
}

interface GoogleAuthRequest {
  token: string
}

interface GoogleTokenInfo {
  sub: string
  email: string
  name: string
  picture?: string
}

interface AuthResponse {
  success: boolean
  jwt?: string
  error?: string
}

interface User {
  id: string
  email: string
  name: string
  oauth_provider: string
  oauth_id: string
  created_at: string
}

const router = Router()

router.post("/api/auth/google", async (request: Request, env: Env) => {
  try {
    const { token } = await request.json() as GoogleAuthRequest

    if (!token) {
      return new Response(
        JSON.stringify({ success: false, error: "No token provided" }),
        { status: 400 }
      )
    }

    // Verify token with Google
    const tokenResponse = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    )

    if (!tokenResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid Google token" }),
        { status: 401 }
      )
    }

    const tokenInfo = await tokenResponse.json() as GoogleTokenInfo

    // Check for existing user
    const existingUser = await env.DB.prepare(
      "SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?"
    )
      .bind("google", tokenInfo.sub)
      .first<User>()

    let userId: string

    if (existingUser) {
      userId = existingUser.id
    } else {
      // Create new user
      const result = await env.DB.prepare(`
        INSERT INTO users (email, name, oauth_provider, oauth_id, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))
      `)
        .bind(
          tokenInfo.email,
          tokenInfo.name,
          "google",
          tokenInfo.sub
        )
        .run()

      if (!result.success) {
        throw new Error("Failed to create user")
      }

      const newUser = await env.DB.prepare(
        "SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?"
      )
        .bind("google", tokenInfo.sub)
        .first<User>()

      if (!newUser) {
        throw new Error("Failed to retrieve created user")
      }

      userId = newUser.id
    }

    // Generate JWT
    const jwt = generateJWT(userId)

    return new Response(
      JSON.stringify({ success: true, jwt }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Google auth error:", err)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : "Authentication failed" 
      }),
      { status: 500 }
    )
  }
})

export default router 