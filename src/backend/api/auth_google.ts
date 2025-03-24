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

  // Declare body variable at the top level
  let requestBody: GoogleAuthRequest | undefined

  try {
    // Ensure this is a POST request
    if (request.method !== 'POST') {
      return Response.json({ 
        status: 'error',
        message: 'Method not allowed'
      }, {
        status: 405,
        headers: {
          ...Object.fromEntries(headers.entries()),
          'Allow': 'POST, OPTIONS'
        }
      })
    }

    // Parse and validate request body
    try {
      requestBody = await request.json()
    } catch (err) {
      console.error('❌ Failed to parse request body:', err)
      return Response.json({
        status: 'error',
        message: 'Invalid request body'
      }, {
        status: 400,
        headers
      })
    }

    // Validate credential presence
    if (!requestBody.credential) {
      console.error('❌ Missing credential in request body')
      return Response.json({
        status: 'error',
        message: 'Missing credential'
      }, {
        status: 400,
        headers
      })
    }

    // Log environment variables (redacted for security)
    console.log('🔑 Environment variables:', {
      hasJwtSecret: !!env.JWT_SECRET,
      hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
      googleClientIdLength: env.GOOGLE_CLIENT_ID?.length,
      googleClientIdPreview: env.GOOGLE_CLIENT_ID ? `${env.GOOGLE_CLIENT_ID.slice(0, 10)}...${env.GOOGLE_CLIENT_ID.slice(-10)}` : undefined
    })

    // Check for required environment variables
    const jwtSecret = env.JWT_SECRET
    const googleClientId = env.GOOGLE_CLIENT_ID

    // Add diagnostic logging for environment variables
    console.log('🔍 Environment Variables:', {
      hasJwtSecret: !!jwtSecret,
      jwtSecretLength: jwtSecret?.length,
      hasGoogleClientId: !!googleClientId,
      googleClientIdLength: googleClientId?.length,
      googleClientIdPreview: googleClientId ? `${googleClientId.slice(0, 4)}...${googleClientId.slice(-4)}` : undefined,
      isEnvPlaceholder: googleClientId === 'ENV_GOOGLE_CLIENT_ID'
    })

    if (!jwtSecret || !googleClientId) {
      console.error('❌ Missing required environment variables:', {
        hasJwtSecret: !!jwtSecret,
        hasGoogleClientId: !!googleClientId
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
    const googleUser = await verifyGoogleToken(requestBody.credential, env.GOOGLE_CLIENT_ID)
    
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

    console.log('✅ Successfully authenticated user:', {
      sub: '***', // Redacted for privacy
      email: '***', // Redacted for privacy
      hasName: !!googleUser.name,
      hasPicture: !!googleUser.picture
    })

    // Return success response
    return Response.json({
      status: 'ok',
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
    // Log the error for debugging
    console.error('❌ Authentication failed:', {
      error: err.message,
      type: err.constructor.name,
      stack: err.stack,
      hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
      googleClientIdLength: env.GOOGLE_CLIENT_ID?.length,
      requestBody: {
        hasCredential: !!requestBody?.credential,
        credentialLength: requestBody?.credential?.length,
        credentialPreview: requestBody?.credential ? `${requestBody.credential.slice(0, 10)}...${requestBody.credential.slice(-10)}` : undefined
      }
    })

    // Return more detailed error response
    return Response.json({
      status: 'error',
      message: err.message || 'Authentication failed',
      details: {
        type: err.constructor.name,
        hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
        hasCredential: !!requestBody?.credential
      }
    }, {
      status: 401,
      headers
    })
  }
} 