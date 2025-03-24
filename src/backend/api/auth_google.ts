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

export async function handleGoogleAuth(request: Request): Promise<Response> {
  try {
    const body = await request.json() as GoogleAuthRequest
    const { credential } = body

    if (!credential) {
      return new Response('Missing credential', { status: 400 })
    }

    // For now, just echo back the decoded payload
    const parts = credential.split('.')
    const payload = JSON.parse(atob(parts[1]))

    return Response.json({ payload })
  } catch (err) {
    return new Response('Failed to process auth', { status: 500 })
  }
} 