import { Router } from 'itty-router'
import { getUserFromToken } from './auth'
import googleAuthRouter from './api/auth_google'

interface Env {
  GOOGLE_CLIENT_ID: string
  JWT_SECRET: string
  DB: D1Database
}

const router = Router()

// Mount the Google auth routes
router.all('/api/auth/google/*', googleAuthRouter.handle.bind(googleAuthRouter))

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
