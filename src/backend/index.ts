import { Router } from 'itty-router'
import { authGoogle } from './api/auth_google'

interface Env {
  JWT_SECRET: string
  DB: D1Database
}

const router = Router()

// Register Google auth route with POST method
router.post('/api/auth/google', authGoogle)

// Handle other routes
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
    console.log('📥 Incoming request:', {
      method: request.method,
      url: request.url,
      headers: Object.fromEntries(request.headers.entries())
    })
    
    const response = await router.handle(request)
    
    console.log('📤 Outgoing response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    })
    
    return response
  }
}
