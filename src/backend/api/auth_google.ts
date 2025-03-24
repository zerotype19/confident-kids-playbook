import { sign } from '@tsndr/cloudflare-worker-jwt'
import { corsHeaders, handleOptions } from '../lib/cors'
import { Env, GoogleAuthRequest } from '../types'
import { verifyGoogleToken } from '../lib/jwt'

export const authGoogle = async (request: Request, env: Env): Promise<Response> => {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleOptions(request)
  }

  // Get base CORS headers
  const headers = corsHeaders({
    allowedMethods: ['POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type']
  })

  try {
    // Ensure this is a POST request
    if (request.method !== 'POST') {
      return Response.json({ 
        status: 'error',
        message: 'Method not allowed',
        details: {
          method: request.method,
          allowed: ['POST']
        }
      }, {
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
    } catch (err) {
      return Response.json({
        status: 'error',
        message: 'Invalid request body',
        details: err instanceof Error ? err.message : 'Could not parse JSON'
      }, {
        status: 400,
        headers
      })
    }

    // Validate credential presence
    if (!body.credential) {
      return Response.json({
        status: 'error',
        message: 'Missing credential',
        details: {
          required: ['credential'],
          received: Object.keys(body)
        }
      }, {
        status: 400,
        headers
      })
    }

    // Validate environment variables
    if (!env.JWT_SECRET || !env.GOOGLE_CLIENT_ID) {
      console.error('Missing required environment variables:', {
        hasJwtSecret: !!env.JWT_SECRET,
        hasGoogleClientId: !!env.GOOGLE_CLIENT_ID
      })
      return Response.json({
        status: 'error',
        message: 'Server configuration error'
      }, {
        status: 500,
        headers
      })
    }

    // Verify the Google token
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

    // Return success response
    return Response.json({
      status: 'success',
      jwt,
      user: {
        id: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture
      }
    }, {
      headers
    })

  } catch (err: any) {
    // Handle token verification errors
    if (err.message === 'Invalid token' || 
        err.message === 'Token has expired' ||
        err.message === 'Invalid audience' ||
        err.message === 'Invalid issuer' ||
        err.message === 'Token not yet valid' ||
        err.message === 'Email not verified') {
      return Response.json({
        status: 'error',
        message: err.message
      }, {
        status: 401,
        headers
      })
    }

    // Log unexpected errors
    console.error('Unexpected error:', {
      message: err.message,
      stack: err.stack,
      type: err.constructor.name
    })
    
    // Return generic error for unexpected errors
    return Response.json({
      status: 'error',
      message: 'Internal server error'
    }, {
      status: 500,
      headers
    })
  }
} 