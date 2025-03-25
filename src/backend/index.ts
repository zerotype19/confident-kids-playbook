import { Router } from 'itty-router'
import { authGoogle } from './api/auth_google'
import { corsHeaders, handleOptions } from './lib/cors'
import { Env } from './types'
import { onRequest as onboardingStatus } from './api/onboarding_status'

const router = Router()

// Debug logging wrapper
const withLogging = async (request: Request, env: Env, ctx: ExecutionContext) => {
  const url = new URL(request.url)
  console.log('🧭 Request received:', {
    method: request.method,
    pathname: url.pathname,
    headers: Object.fromEntries(request.headers.entries())
  })
  
  try {
    // Create a context object with the environment
    const context = { request, env }
    
    // Pass context to router.handle
    const response = await router.handle(request, context)
    
    // Ensure CORS headers are present
    const corsResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...Object.fromEntries(response.headers.entries()),
        ...Object.fromEntries(corsHeaders().entries())
      }
    })
    
    console.log('📤 Response:', {
      status: corsResponse.status,
      headers: Object.fromEntries(corsResponse.headers.entries())
    })
    
    return corsResponse
  } catch (error) {
    console.error('❌ Router error:', error)
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders()
    })
  }
}

// Handle CORS preflight for all routes
router.options('*', handleOptions)

// Auth routes
router.post('/api/auth/google', (request, context) => authGoogle({ request, env: context.env }))

// Onboarding routes
router.get('/api/onboarding/status', (request, context) => onboardingStatus({ request, env: context.env }))

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
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: corsHeaders()
  })
})

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return withLogging(request, env, ctx)
  }
}
