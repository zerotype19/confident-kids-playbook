import { OAuth2Client } from "google-auth-library"
import { sign } from '@tsndr/cloudflare-worker-jwt'

interface Env {
  GOOGLE_CLIENT_ID: string
  JWT_SECRET: string
}

interface UserInfo {
  email: string
  name: string
  picture: string
}

interface User {
  id: string
  email: string
  name: string
  picture: string
}

const client = new OAuth2Client("GOOGLE_CLIENT_ID")

export async function getUserFromToken(request) {
  // Placeholder: implement real token logic later
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) return null
  const token = authHeader.replace('Bearer ', '')
  return { id: 'user_1', token }
}

export async function verifyGoogleToken(idToken: string, env: Env): Promise<UserInfo> {
  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID)
  console.log("✅ Using Google Client ID:", env.GOOGLE_CLIENT_ID)

  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID
  })
  const payload = ticket.getPayload()
  if (!payload) throw new Error("Invalid token")
  return {
    email: payload.email!,
    name: payload.name!,
    picture: payload.picture!
  }
}

export function generateJWT(userId: string): string {
  // TODO: Implement JWT generation
  return "dummy-jwt"
}

export async function createJWT(userId: string, env: Env) {
  const payload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
  }

  return await sign(payload, env.JWT_SECRET)
}
