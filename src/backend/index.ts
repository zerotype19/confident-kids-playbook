import { Router } from 'itty-router'
import { handleGoogleAuth } from './api/auth_google'

interface Env {
  JWT_SECRET: string
  DB: D1Database
}

const router = Router()

// Register Google auth route
router.post('/api/auth/google', handleGoogleAuth)

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

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Handle the hello endpoint
  if (request.method === 'GET' && new URL(request.url).pathname === '/api/hello') {
    return new Response(JSON.stringify({ message: 'hello world!!!' }), {
      headers: { 'Content-Type': 'application/json' }
    })
  }

  // Return 404 for all other routes
  return new Response(JSON.stringify({ error: 'Not Found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  })
}
