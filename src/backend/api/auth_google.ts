import { Router } from "itty-router"
import { verifyGoogleToken, generateJWT } from "../auth"
import { createOrUpdateUser } from "../db/users"

interface GoogleAuthRequest {
  token: string
}

interface Env {
  GOOGLE_CLIENT_ID: string
}

const router = Router()

router.post("/api/auth/google", async (request: Request, env: Env) => {
  const body = await request.json() as GoogleAuthRequest
  const { token } = body

  try {
    const userInfo = await verifyGoogleToken(token, env)
    const user = await createOrUpdateUser(userInfo)
    const jwt = generateJWT(user.id)
    return new Response(JSON.stringify({ success: true, jwt }), {
      headers: { "Content-Type": "application/json" }
    })
  } catch (err) {
    console.error("Login failed", err)
    return new Response(JSON.stringify({ success: false }), { status: 401 })
  }
})

export default router 