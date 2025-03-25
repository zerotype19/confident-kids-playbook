import { verify } from '@tsndr/cloudflare-worker-jwt'
import { sign } from '@tsndr/cloudflare-worker-jwt'

interface GoogleTokenPayload {
  email: string
  name?: string
  picture?: string
  [key: string]: unknown
}

interface JwtPayload {
  sub: string
  email: string
  name: string
  picture: string
  iat: number
  exp: number
  [key: string]: unknown
}

interface AuthResult {
  success: boolean
  jwt?: string
  error?: string
}

export async function verifyGoogleTokenAndCreateJwt(
  credential: string,
  jwtSecret: string
): Promise<AuthResult> {
  try {
    // Verify the Google token
    const decoded = await verify(credential, jwtSecret, { complete: true });

    if (!decoded || !decoded.payload || typeof decoded.payload !== 'object') {
      return {
        success: false,
        error: 'Invalid token'
      }
    }

    const payload = decoded.payload as GoogleTokenPayload;
    const email = payload.email;
    const name = payload.name || '';
    const picture = payload.picture || '';

    if (!email) {
      return {
        success: false,
        error: 'Missing email in token'
      }
    }

    // Create our app's JWT
    const jwtPayload: JwtPayload = {
      sub: email,
      email,
      name,
      picture,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    }

    const jwt = await sign(jwtPayload, jwtSecret);

    return {
      success: true,
      jwt
    }
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to process token'
    }
  }
} 