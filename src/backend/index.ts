import { Router } from 'itty-router'
import { authGoogle } from './api/auth_google'
import { corsHeaders, handleOptions } from './lib/cors'
import { Env } from './types'

const router = Router()

// Debug logging wrapper
const withLogging = async (request: Request, env: Env, ctx: ExecutionContext) => {
  const url = new URL(request.url)
  console.log('🧭 Request received:', {
    method: request.method,
    pathname: url.pathname,
    headers: Object.fromEntries(request.headers.entries())
  })
  
  // Pass env to router.handle
  const response = await router.handle(request, env, ctx)
  
  console.log('📤 Response:', {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries())
  })
  
  return response
}

// Handle CORS preflight for all routes
router.options('*', handleOptions)

// Register Google auth route with POST method
router.post('/api/auth/google', (request: Request, env: Env) => authGoogle(request, env))

// Handle other routes
router.get('/api/hello', async () => {
  return new Response(JSON.stringify({ message: 'hello world!!!' }), {
    headers: corsHeaders()
  })
})

// Catch-all handler for unmatched routes
router.all('*', (req) => {
  console.warn('⚠️ Unmatched request:', {
    method: req.method,
    url: req.url,
    pathname: new URL(req.url).pathname
  })
  return new Response(JSON.stringify({ 
    error: 'Not Found',
    path: new URL(req.url).pathname,
    method: req.method
  }), {
    status: 404,
    headers: corsHeaders()
  })
})

export default {
  fetch: async (request: Request, env: Env, ctx: ExecutionContext) => {
    return withLogging(request, env, ctx)
  }
}
