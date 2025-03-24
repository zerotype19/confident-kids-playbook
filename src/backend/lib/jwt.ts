import { jwtVerify, createRemoteJWKSet } from 'jose'

interface JWTHeader {
  kid: string
  alg: string
  typ?: string
}

interface GoogleTokenPayload {
  iss: string
  azp: string
  aud: string
  sub: string
  email: string
  email_verified: boolean
  name?: string
  picture?: string
  given_name?: string
  family_name?: string
  locale?: string
  iat: number
  exp: number
  nbf?: number
}

interface GoogleKey {
  kid: string
  n: string
  e: string
  alg: string
  use: string
  kty: string
}

interface GoogleCertsResponse {
  keys: GoogleKey[]
}

// Base64URL decode (handle URL-safe characters and padding)
function base64UrlDecode(input: string): string {
  // Convert URL-safe characters back to regular base64
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  // Add padding if needed
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
  return atob(padded)
}

// Decodes a JWT without verification
function decodeJwt(token: string): { header: JWTHeader; payload: any } {
  const [headerB64, payloadB64] = token.split('.')
  const header = JSON.parse(base64UrlDecode(headerB64))
  const payload = JSON.parse(base64UrlDecode(payloadB64))
  return { header, payload }
}

// Cache Google certs to avoid fetching them too often
let certsCache: { certs: jose.JWKS; expires: number } | null = null

async function fetchGoogleCerts(): Promise<jose.JWKS> {
  // Check cache first
  if (certsCache && certsCache.expires > Date.now()) {
    return certsCache.certs
  }

  console.log('🔑 Fetching Google certificates...')
  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  if (!response.ok) {
    throw new Error('Failed to fetch Google certificates')
  }

  // Get cache expiry from headers
  const cacheControl = response.headers.get('cache-control')
  const maxAge = cacheControl?.match(/max-age=(\d+)/)?.[1]
  const expires = Date.now() + (maxAge ? parseInt(maxAge) * 1000 : 3600 * 1000)

  const data = await response.json() as GoogleCertsResponse
  console.log('✅ Fetched certificates:', {
    numKeys: data.keys.length,
    kids: data.keys.map(k => k.kid),
    expires: new Date(expires).toISOString()
  })

  // Update cache
  certsCache = { certs: data as unknown as jose.JWKS, expires }
  return data as unknown as jose.JWKS
}

export async function verifyGoogleToken(token: string, clientId: string): Promise<GoogleTokenPayload> {
  try {
    // Log incoming token and client ID for debugging
    console.log('📥 Received Google token:', {
      length: token.length,
      preview: `${token.slice(0, 10)}...${token.slice(-10)}`,
      clientId: clientId
    })

    // Create JWKS client for Google's public keys
    const jwks = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'))

    // First decode the token without verification to check the audience
    const [headerB64, payloadB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
    
    // Log the audience claims for debugging
    console.log('🔍 Token audience claims:', {
      aud: payload.aud,
      azp: payload.azp,
      expectedClientId: clientId,
      matchesAud: payload.aud === clientId,
      matchesAzp: payload.azp === clientId
    })

    // Verify the token
    const { payload: verifiedPayload } = await jwtVerify(token, jwks, {
      issuer: 'https://accounts.google.com',
      audience: clientId,
      algorithms: ['RS256']
    })

    // Log decoded payload (with sensitive data redacted)
    console.log('🔍 Decoded token payload:', {
      ...verifiedPayload,
      email: verifiedPayload.email ? '***' : undefined,
      sub: verifiedPayload.sub ? '***' : undefined
    })

    // Type check the payload
    const googlePayload = verifiedPayload as GoogleTokenPayload

    // Verify audience (check both aud and azp)
    const validAudience = googlePayload.aud === clientId || googlePayload.azp === clientId
    if (!validAudience) {
      console.error('❌ Invalid audience:', {
        expectedClientId: clientId,
        receivedAud: googlePayload.aud,
        receivedAzp: googlePayload.azp,
        fullToken: token // Log full token for debugging
      })
      throw new Error(`Invalid audience. Expected: ${clientId}, Received: ${googlePayload.aud}`)
    }

    // Verify email is verified (Google specific)
    if (googlePayload.email && !googlePayload.email_verified) {
      throw new Error('Email not verified')
    }

    console.log('✅ Token verified successfully')
    return googlePayload
  } catch (err: any) {
    console.error('❌ Failed to verify token:', {
      error: err.message,
      type: err.constructor.name,
      stack: err.stack,
      clientId: clientId // Log the client ID that was used
    })
    throw new Error(`Token verification failed: ${err.message}`)
  }
} 