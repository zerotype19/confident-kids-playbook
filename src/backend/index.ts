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
import { onRequest as childrenUpdate } from './api/children_update'
import { challenge } from './api/dashboard/challenge'
import { notes, createNote } from './api/notes'
import { onRequest as challengeLog } from './api/challenge_log'
import { onRequestGet as progress } from './api/progress'
import { onRequestGet as rewards } from './api/rewards/[childId]'
import { onRequestGet as allChallenges } from './api/challenges/all'
import { onRequestGet as getChallenge } from './api/challenges'
import { onRequestGet as pillars } from './api/pillars/index'
import { onRequestGet as pillarProgress } from './api/pillars/[id]/progress'
import { onRequestGet as pillar } from './api/pillars/[id]'
import { onRequestGet as pillarChallenges } from './api/pillars/[id]/challenges'
import { onRequestPost as challengesComplete } from './api/challenges_complete'
import { onRequest as userSelectedChild } from './api/user_selected_child'
import { onRequestGet as billingStatus } from './api/billing_status'
import { onRequestPost as billingCreatePortal } from './api/billing_create_portal'
import { onRequestPost as billingWebhook } from './api/billing_webhook'
import { onRequestPost as billingCreateCheckout } from './api/billing_create_checkout'
import { onRequestGet as billingPrices } from './api/billing_prices'
import { onRequestPost as chatbot } from './api/chatbot'
import { onRequestGet as theme } from './api/dashboard/theme'
import { onRequestPost as reflection } from './api/reflection'
import { onRequestGet as getConfidenceTrend } from './api/confidence-trend'
import { onRequestPost as familyInvite } from './api/family_invite'
import { onRequestPost as familyJoin } from './api/family_join'
import { onRequestPost as verifyInvite } from './api/verify_invite'
import { onRequestGet as traitScores } from './api/trait-scores'
import { onRequestGet as challengeXpSummary } from './api/challenge-xp-summary'

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

// User profile routes
router.get('/api/user/profile', (request, context) => userProfile({ request, env: context.env }))
router.put('/api/user/selected-child', (request, context) => userSelectedChild({ request, env: context.env }))

// Billing routes
router.get('/api/billing_status', (request, context) => billingStatus({ request, env: context.env }))
router.post('/api/billing_create_portal', (request, context) => billingCreatePortal({ request, env: context.env }))
router.post('/api/billing_webhook', (request, context) => billingWebhook({ request, env: context.env }))
router.post('/api/billing_create_checkout', (request, context) => billingCreateCheckout({ request, env: context.env }))
router.get('/api/prices', (request, context) => billingPrices({ request, env: context.env }))

// Onboarding routes
router.get('/api/onboarding/status', (request, context) => onboardingStatus({ request, env: context.env }))
router.post('/api/family/create', (request, context) => familyCreate({ request, env: context.env }))
router.post('/api/children/create', (request, context) => childrenCreate({ request, env: context.env }))
router.post('/api/onboarding/complete', (request, context) => onboardingComplete({ request, env: context.env }))

// Children routes
router.get('/api/children', (request, context) => children({ request, env: context.env }))
router.put('/api/children/:id', (request, context) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing child ID' }), {
      status: 400,
      headers: corsHeaders()
    });
  }
  return childrenUpdate({ request, env: context.env, id });
})

// Trait scores route
router.get('/api/trait-scores/:childId', (request, context) => {
  const url = new URL(request.url);
  const childId = url.pathname.split('/').pop();
  if (!childId) {
    return new Response(JSON.stringify({ error: 'Missing child ID' }), {
      status: 400,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
    });
  }
  return traitScores({ request, env: context.env, params: { childId } });
})

// Dashboard routes
router.get('/api/dashboard/challenge', (request, context) => challenge({ request, env: context.env }))
router.get('/api/dashboard/theme', (request, context) => theme({ request, env: context.env }))
router.get('/api/confidence-trend', (request, context) => getConfidenceTrend({ request, env: context.env }))
router.post('/api/challenge-log', (request, context) => challengeLog({ request, env: context.env }))
router.get('/api/progress', (request, context) => progress({ request, env: context.env }))
router.get('/api/rewards/:childId', (request, context) => rewards({ request, env: context.env }))

// Notes routes
router.get('/api/notes', (request, context) => notes({ request, env: context.env }))
router.post('/api/notes', (request, context) => createNote({ request, env: context.env }))

// All challenges route
router.get('/api/challenges/all', (request, context) => allChallenges({ request, env: context.env }))
router.get('/api/challenges/:id', (request, context) => {
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();
  if (!id) {
    return new Response(JSON.stringify({ error: 'Missing challenge ID' }), {
      status: 400,
      headers: corsHeaders()
    });
  }
  return getChallenge({ request, env: context.env, params: { id } });
})

// Pillars route
router.get('/api/pillars', (request, context) => pillars({ request, env: context.env }))
router.get('/api/pillars/:id', (request, context) => pillar({ request, env: context.env }))
router.get('/api/pillars/:id/progress', (request, context) => pillarProgress({ request, env: context.env }))
router.get('/api/pillars/:id/challenges', (request, context) => pillarChallenges({ request, env: context.env }))

// Chatbot route
console.log('🔧 Registering chatbot route: POST /api/chatbot');
router.post('/api/chatbot', (request, context) => {
  console.log('📥 Chatbot route handler called:', {
    method: request.method,
    url: request.url
  });
  return chatbot({ request, env: context.env });
});

// Reflection route
console.log('🔧 Registering reflection route: POST /api/reflection');
router.post('/api/reflection', (request, context) => {
  console.log('📥 Reflection route handler called:', {
    method: request.method,
    url: request.url
  });
  return reflection({ request, env: context.env });
});

// Family routes
router.post('/api/family/invite', (request, context) => familyInvite({ request, env: context.env }))
router.post('/api/family_join', (request, context) => familyJoin({ request, env: context.env }))
router.post('/api/verify_invite', (request, context) => verifyInvite({ request, env: context.env }))

// Challenge XP Summary route
router.get('/api/challenge-xp-summary/:childId/:challengeId', (request, context) => {
  const url = new URL(request.url);
  const parts = url.pathname.split('/');
  const childId = parts[parts.length - 2];
  const challengeId = parts[parts.length - 1];
  return challengeXpSummary({ request, env: context.env, params: { childId, challengeId } });
});

// Add catch-all route for debugging
router.all('*', (request) => {
  console.log('⚠️ Unmatched route:', {
    method: request.method,
    url: request.url,
    pathname: new URL(request.url).pathname
  });
  return new Response(JSON.stringify({ 
    error: 'Not found',
    method: request.method,
    path: new URL(request.url).pathname
  }), { 
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders('*')
    }
  });
});

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return withLogging(request, env, ctx)
  }
}
