import { verifyGoogleTokenAndCreateJwt } from '../lib/googleAuth'

interface Env {
  JWT_SECRET: string
}

interface GoogleAuthRequest {
  credential: string
}

export const authGoogle = async (request: Request, env: Env) => {
  console.log('🔐 Processing Google auth request:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  })

  try {
    // Ensure this is a POST request
    if (request.method !== 'POST') {
      console.log('❌ Wrong method:', request.method)
      return new Response(JSON.stringify({ 
        error: 'Method Not Allowed',
        method: request.method,
        allowed: 'POST'
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json() as GoogleAuthRequest
    console.log('📥 Received POST body:', { ...body, credential: body.credential ? '***' : undefined })

    const { credential } = body
    if (!credential) {
      console.log('❌ No credential found in body')
      return new Response(JSON.stringify({ 
        error: 'Missing credential',
        received: Object.keys(body)
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('🔐 Processing credential:', credential.slice(0, 30) + '...')
    const result = await verifyGoogleTokenAndCreateJwt(credential, env.JWT_SECRET)
    
    console.log('✅ Successfully processed Google auth')
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error('❌ Error in authGoogle:', {
      error: err.message,
      stack: err.stack,
      type: err.constructor.name
    })
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: err.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 