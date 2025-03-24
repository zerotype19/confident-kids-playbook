import { Router } from "itty-router"
import { verifyGoogleToken } from "../auth"
import { createOrUpdateUser } from "../db/users"
import { generateJWT } from "../auth"

interface Env {
  GOOGLE_CLIENT_ID: string
  JWT_SECRET: string
}

interface GoogleAuthRequest {
  token: string
}

interface AuthResponse {
  success: boolean
  jwt?: string
  error?: string
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

    const userInfo = await verifyGoogleToken(token, env)
    const user = await createOrUpdateUser(userInfo)
    const jwt = generateJWT(user.id, env.JWT_SECRET)

    return new Response(
      JSON.stringify({ success: true, jwt }),
      { headers: { "Content-Type": "application/json" } }
    )
  } catch (err) {
    console.error("Login failed:", err)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : "Authentication failed" 
      }),
      { status: 401 }
    )
  }
})

export default router 