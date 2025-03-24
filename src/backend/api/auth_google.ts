import { verifyGoogleTokenAndCreateJwt } from '../lib/googleAuth'
import { corsHeaders, handleOptions } from '../lib/cors'

interface Env {
  JWT_SECRET: string
}

interface GoogleAuthRequest {
  credential: string
}

export const authGoogle = async (request: Request, env: Env) => {
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

    // Process the credential
    console.log('🔐 Processing credential...')
    const result = await verifyGoogleTokenAndCreateJwt(body.credential, env.JWT_SECRET)
    
    if (!result.success) {
      console.error('❌ Failed to verify token:', result.error)
      return new Response(JSON.stringify({
        status: 'error',
        message: result.error || 'Failed to verify token'
      }), {
        status: 401,
        headers
      })
    }

    console.log('✅ Successfully authenticated')
    return new Response(JSON.stringify({
      status: 'success',
      jwt: result.jwt
    }), {
      headers
    })

  } catch (err: any) {
    // Log the full error details
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