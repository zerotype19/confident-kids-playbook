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
  try {
    const { token } = await request.json() as GoogleAuthRequest
    console.log('✅ Received Google token:', token)

    // For testing, return a dummy success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        jwt: 'dummy-jwt-for-testing',
        message: 'Google auth endpoint working' 
      }),
      { 
        headers: { 'Content-Type': 'application/json' }
      }
    )
  } catch (err) {
    console.error('❌ Google auth error:', err)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: err instanceof Error ? err.message : 'Authentication failed' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
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
