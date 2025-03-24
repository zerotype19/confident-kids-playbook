import { verify } from '@tsndr/cloudflare-worker-jwt'
import { sign } from '@tsndr/cloudflare-worker-jwt'

interface GoogleTokenPayload {
  email: string
  name?: string
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
    const decoded = await verify(credential, { complete: true })

    if (!decoded || typeof decoded.payload !== 'object') {
      return {
        success: false,
        error: 'Invalid token'
      }
    }

    const payload = decoded.payload as GoogleTokenPayload
    const email = payload.email
    const name = payload.name || ''

    if (!email) {
      return {
        success: false,
        error: 'Missing email in token'
      }
    }

    // Create our app's JWT
    const jwtPayload = {
      sub: email,
      name,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    }

    const jwt = await sign(jwtPayload, jwtSecret)

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