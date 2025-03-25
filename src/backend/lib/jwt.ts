import * as jose from 'jose'

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

// Helper to decode JWT without verification
function decodeJwt(token: string): any {
  const [headerB64, payloadB64] = token.split('.')
  const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
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

const GOOGLE_CERTS_URL = 'https://www.googleapis.com/oauth2/v3/certs'
const JWKS = jose.createRemoteJWKSet(new URL(GOOGLE_CERTS_URL))

export async function verifyGoogleToken(token: string, clientId: string) {
  try {
    // Log the token and client ID for debugging
    console.log('🔍 Verifying token with:', {
      clientIdLength: clientId.length,
      clientIdPreview: `${clientId.slice(0, 10)}...${clientId.slice(-10)}`,
      tokenLength: token.length,
      tokenPreview: `${token.slice(0, 10)}...${token.slice(-10)}`
    })

    const { payload } = await jose.jwtVerify(token, JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: clientId,
      algorithms: ['RS256']
    })

    // Verify required claims
    if (!payload.sub || !payload.email || !payload.email_verified) {
      throw new Error('Missing required claims in token')
    }

    // Return user info
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      picture: payload.picture as string
    }
  } catch (err: any) {
    console.error('❌ Token verification failed:', {
      error: err.message,
      type: err.constructor.name,
      stack: err.stack,
      clientId: {
        length: clientId.length,
        preview: `${clientId.slice(0, 10)}...${clientId.slice(-10)}`
      }
    })
    throw new Error(`Token verification failed: ${err.message}`)
  }
} 