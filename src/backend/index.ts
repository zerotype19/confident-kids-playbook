import { Router } from 'itty-router'
import { authGoogle } from './api/auth_google'

interface Env {
  JWT_SECRET: string
  DB: D1Database
}

const router = Router()

// Debug logging wrapper
const withLogging = async (request: Request) => {
  const url = new URL(request.url)
  console.log('🧭 Request received:', {
    method: request.method,
    pathname: url.pathname,
    headers: Object.fromEntries(request.headers.entries())
  })
  
  const response = await router.handle(request)
  
  console.log('📤 Response:', {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries())
  })
  
  return response
}

// Register Google auth route with POST method
router.post('/api/auth/google', authGoogle)

// Handle other routes
router.get('/api/hello', async () => {
  return new Response(JSON.stringify({ message: 'hello world!!!' }), {
    headers: { 'Content-Type': 'application/json' }
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
    headers: { 'Content-Type': 'application/json' }
  })
})

export default {
  fetch: withLogging
}
