import { sign } from '@tsndr/cloudflare-worker-jwt'
import { corsHeaders, handleOptions } from '../lib/cors'
import { Env, GoogleAuthRequest } from '../types'
import { verifyGoogleToken } from '../lib/jwt'

export const authGoogle = async (request: Request, env: Env): Promise<Response> => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleOptions(request)
  }

  // Log incoming request details
  const url = new URL(request.url)
  console.log('🔍 Incoming request:', {
    method: request.method,
    pathname: url.pathname,
    headers: Object.fromEntries(request.headers.entries())
  })

  // Get base CORS headers
  const headers = corsHeaders({
    allowedMethods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  })

  try {
    // Ensure this is a POST request
    if (request.method !== 'POST') {
      console.warn('❌ Method not allowed:', {
        received: request.method,
        expected: 'POST',
        path: url.pathname
      })
      return new Response(JSON.stringify({ 
        status: 'error',
        message: 'Method not allowed',
        details: {
          method: request.method,
          allowed: ['POST'],
          path: url.pathname
        }
      }), {
        status: 405,
        headers: {
          ...Object.fromEntries(headers.entries()),
          'Allow': 'POST, OPTIONS'
        }
      })
    }

    // Parse and validate request body
    let body: GoogleAuthRequest
    try {
      body = await request.json()
      console.log('📦 Received body:', {
        hasCredential: !!body.credential,
        credentialLength: body.credential?.length,
        keys: Object.keys(body)
      })
    } catch (err) {
      console.error('❌ Failed to parse request body:', err)
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Invalid request body',
        details: err instanceof Error ? err.message : 'Could not parse JSON'
      }), {
        status: 400,
        headers
      })
    }

    // Validate credential presence
    if (!body.credential) {
      console.warn('❌ Missing credential in request:', {
        receivedKeys: Object.keys(body)
      })
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Missing credential',
        details: {
          required: ['credential'],
          received: Object.keys(body)
        }
      }), {
        status: 400,
        headers
      })
    }

    // Validate environment variables
    if (!env.JWT_SECRET || !env.GOOGLE_CLIENT_ID) {
      console.error('❌ Missing required environment variables:', {
        hasJwtSecret: !!env.JWT_SECRET,
        hasGoogleClientId: !!env.GOOGLE_CLIENT_ID
      })
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Server configuration error'
      }), {
        status: 500,
        headers
      })
    }

    // Verify the Google token
    console.log('🔐 Verifying Google token...')
    const googleUser = await verifyGoogleToken(body.credential, env.GOOGLE_CLIENT_ID)
    
    // Create our app's JWT
    const jwtPayload = {
      sub: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    }

    const jwt = await sign(jwtPayload, env.JWT_SECRET)

    console.log('✅ Successfully authenticated:', {
      sub: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name
    })

    return new Response(JSON.stringify({
      status: 'success',
      jwt,
      user: {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture
      }
    }), {
      headers
    })

  } catch (err: any) {
    // Handle token verification errors
    if (err.message === 'Invalid token') {
      return new Response(JSON.stringify({
        status: 'error',
        message: 'Invalid token'
      }), {
        status: 401,
        headers
      })
    }

    // Log other errors
    console.error('❌ Unhandled error:', {
      message: err.message,
      stack: err.stack,
      type: err.constructor.name,
      url: request.url,
      method: request.method
    })
    
    // Return a sanitized error response
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Internal server error',
      details: err.message
    }), {
      status: 500,
      headers
    })
  }
} 