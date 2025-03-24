import { Router } from "itty-router"
import { verifyGoogleToken } from "../auth"
import { createOrUpdateUser } from "../db/users"

const router = Router()

router.post("/api/auth/google", async (request: Request) => {
  const { token } = await request.json()

  try {
    const userInfo = await verifyGoogleToken(token)
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