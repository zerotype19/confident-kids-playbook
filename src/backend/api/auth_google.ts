import { verifyGoogleTokenAndCreateJwt } from '../lib/googleAuth'

interface Env {
  JWT_SECRET: string
}

interface GoogleAuthRequest {
  credential: string
}

export const authGoogle = async (request: Request, env: Env) => {
  // Ensure this is a POST request
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await request.json() as GoogleAuthRequest
    const { credential } = body

    if (!credential) {
      return new Response(JSON.stringify({ error: 'Missing credential' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const result = await verifyGoogleTokenAndCreateJwt(credential, env.JWT_SECRET)
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', details: `${err}` }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
} 