import { Router } from 'itty-router'
import { getUserFromToken } from './auth'
import { generateJWT } from './auth'

interface Env {
  GOOGLE_CLIENT_ID: string
  JWT_SECRET: string
  DB: D1Database
}

interface GoogleAuthRequest {
  token: string
}

const router = Router()

// Google Auth Route
router.post('/api/auth/google', async (request: Request, env: Env) => {
  const body = await request.json()
  console.log("✅ Received Google login payload:", body)

  return new Response(
    JSON.stringify({ 
      success: true, 
      message: 'Token received' 
    }), 
    { 
      headers: { 'Content-Type': 'application/json' }
    }
  )
})

router.get('/api/hello', async () => {
  return new Response(JSON.stringify({ message: 'hello world!!!' }), {
    headers: { 'Content-Type': 'application/json' }
  })
})

router.all('*', () =>
  new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  })
)

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    return router.handle(request, env, ctx)
  }
}
