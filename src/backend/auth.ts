import { OAuth2Client } from "google-auth-library"
import { sign, verify } from '@tsndr/cloudflare-worker-jwt'

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

interface JwtPayload {
  sub: string
  iat: number
  exp: number
  name?: string
  [key: string]: unknown
}

const client = new OAuth2Client("GOOGLE_CLIENT_ID")

export async function getUserFromToken(request: Request) {
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

export async function generateJWT(userId: string): Promise<string> {
  return sign({ sub: userId }, 'your-secret-key')
}

export async function createJWT(userId: string, env: Env): Promise<string> {
  console.log('🔑 Creating JWT for user:', userId)
  const token = await sign(
    { sub: userId },
    env.JWT_SECRET
  )
  console.log('✅ JWT created successfully')
  return token
}

export async function verifyJWT(token: string, env: Env): Promise<JwtPayload | null> {
  console.log('🔑 Verifying JWT token:', {
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 20) + '...'
  })

  try {
    // Try verifying with the JWT secret
    const decoded = await verify(token, env.JWT_SECRET, { complete: true })
    console.log('✅ JWT verification successful:', {
      hasPayload: !!decoded,
      payloadType: typeof decoded,
      hasSub: decoded.payload && typeof decoded.payload === 'object' && 'sub' in decoded.payload
    })

    if (!decoded || !decoded.payload || typeof decoded.payload !== 'object') {
      console.error('❌ Invalid JWT payload:', decoded)
      return null
    }

    const payload = decoded.payload as JwtPayload
    console.log('✅ JWT payload:', {
      sub: payload.sub,
      iat: payload.iat,
      exp: payload.exp,
      name: payload.name
    })

    // Check if the token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('❌ JWT token has expired')
      return null
    }

    return payload
  } catch (err) {
    console.error('❌ JWT verification failed:', err)
    if (err instanceof Error) {
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      })
    }
    return null
  }
}
