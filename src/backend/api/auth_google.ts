import { verifyGoogleTokenAndCreateJwt } from '../lib/googleAuth'

interface Env {
  JWT_SECRET: string
}

interface GoogleAuthRequest {
  credential: string
}

export const authGoogle = async (request: Request, env: Env) => {
  console.log('🚀 authGoogle handler invoked:', {
    method: request.method,
    url: request.url,
    pathname: new URL(request.url).pathname,
    headers: Object.fromEntries(request.headers.entries())
  })

  try {
    // Ensure this is a POST request
    if (request.method !== 'POST') {
      console.log('❌ Wrong method:', {
        received: request.method,
        expected: 'POST',
        url: request.url
      })
      return new Response(JSON.stringify({ 
        error: 'Method Not Allowed',
        method: request.method,
        allowed: 'POST',
        path: new URL(request.url).pathname
      }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const body = await request.json() as GoogleAuthRequest
    console.log('📥 Received POST body:', { 
      ...body, 
      credential: body.credential ? '***' : undefined,
      bodyKeys: Object.keys(body)
    })

    const { credential } = body
    if (!credential) {
      console.log('❌ No credential found in body:', {
        receivedKeys: Object.keys(body),
        bodyType: typeof body
      })
      return new Response(JSON.stringify({ 
        error: 'Missing credential',
        received: Object.keys(body),
        bodyType: typeof body
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    console.log('🔐 Processing credential:', {
      length: credential.length,
      preview: credential.slice(0, 30) + '...'
    })
    
    const result = await verifyGoogleTokenAndCreateJwt(credential, env.JWT_SECRET)
    
    console.log('✅ Successfully processed Google auth')
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error('❌ Error in authGoogle:', {
      error: err.message,
      stack: err.stack,
      type: err.constructor.name,
      url: request.url,
      method: request.method
    })
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error',
      details: err.message,
      type: err.constructor.name
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 