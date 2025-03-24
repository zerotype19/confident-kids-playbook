import { verify } from '@tsndr/cloudflare-worker-jwt'
import { DB } from '../db'
import { createJWT } from '../auth'

interface Env {
  GOOGLE_CLIENT_ID: string
  JWT_SECRET: string
  DB: D1Database
}

interface GoogleAuthRequest {
  credential: string
}

interface DecodedToken {
  email: string
  name?: string
  [key: string]: unknown
}

export async function handleGoogleAuth(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json() as GoogleAuthRequest
    const { credential } = body

    if (!credential) {
      return new Response('Missing credential', { status: 400 })
    }

    const decoded = await verify(credential, { complete: true })

    if (!decoded || typeof decoded.payload !== 'object') {
      return new Response('Invalid token', { status: 401 })
    }

    const payload = decoded.payload as DecodedToken
    const email = payload.email
    const name = payload.name || ''

    if (!email) {
      return new Response('Missing email in credential', { status: 400 })
    }

    // Get or create user in DB
    const user = await DB.getOrCreateUserByEmail(email, name, env)

    // Sign our app's JWT
    const token = await createJWT(user.id, env)

    return Response.json({ token })
  } catch (err) {
    return new Response('Auth failed', { status: 500 })
  }
} 