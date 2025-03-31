import { Router } from 'itty-router'
import { authGoogle } from './api/auth_google'
import { corsHeaders, handleOptions } from './lib/cors'
import { Env } from './types'
import { onRequest as onboardingStatus } from './api/onboarding_status'
import { onRequest as familyCreate } from './api/family_create'
import { onRequest as childrenCreate } from './api/children_create'
import { onRequest as onboardingComplete } from './api/onboarding_complete'
import { onRequest as userProfile } from './api/user_profile'
import { onRequest as children } from './api/children'
import { challenge } from './api/dashboard/challenge'
import { notes, createNote } from './api/notes'
import { onRequest as challengeLog } from './api/challenge_log'
import { onRequestGet as progress } from './api/progress'
import { onRequestGet as rewards } from './api/rewards/[childId]'
import { onRequestGet as allChallenges } from './api/challenges/all'

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
        ...Object.fromEntries(corsHeaders({}).entries())
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
      headers: corsHeaders({})
    })
  }
}

// Handle CORS preflight for all routes
router.options('*', handleOptions)

// Auth routes
router.post('/api/auth/google', (request, context) => authGoogle({ request, env: context.env }))

// User profile routes
router.get('/api/user/profile', (request, context) => userProfile({ request, env: context.env }))

// Onboarding routes
router.get('/api/onboarding/status', (request, context) => onboardingStatus({ request, env: context.env }))
router.post('/api/family/create', (request, context) => familyCreate({ request, env: context.env }))
router.post('/api/children/create', (request, context) => childrenCreate({ request, env: context.env }))
router.post('/api/onboarding/complete', (request, context) => onboardingComplete({ request, env: context.env }))

// Children routes
router.get('/api/children', (request, context) => children({ request, env: context.env }))

// Dashboard routes
router.get('/api/dashboard/challenge', (request, context) => challenge({ request, env: context.env }))
router.post('/api/challenge-log', (request, context) => challengeLog({ request, env: context.env }))
router.get('/api/progress', (request, context) => progress({ request, env: context.env }))
router.get('/api/rewards/:childId', (request, context) => rewards({ request, env: context.env }))

// Notes routes
router.get('/api/notes', (request, context) => notes({ request, env: context.env }))
router.post('/api/notes', (request, context) => createNote({ request, env: context.env }))

// All challenges route
router.get('/api/challenges/all', allChallenges)

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
