interface JWTHeader {
  kid: string
  alg: string
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

interface GoogleCertificate {
  kid: string
  n: string
  e: string
  alg: string
  use: string
  kty: string
}

interface GoogleCertsResponse {
  keys: GoogleCertificate[]
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
let certsCache: { certs: Record<string, GoogleCertificate>; expires: number } | null = null

async function fetchGoogleCerts(): Promise<Record<string, GoogleCertificate>> {
  // Check cache first
  if (certsCache && certsCache.expires > Date.now()) {
    return certsCache.certs
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  if (!response.ok) {
    throw new Error('Failed to fetch Google certificates')
  }

  // Get cache expiry from headers
  const cacheControl = response.headers.get('cache-control')
  const maxAge = cacheControl?.match(/max-age=(\d+)/)?.[1]
  const expires = Date.now() + (maxAge ? parseInt(maxAge) * 1000 : 3600 * 1000)

  const data = await response.json() as GoogleCertsResponse
  const certs = data.keys.reduce((acc: Record<string, GoogleCertificate>, key: GoogleCertificate) => {
    acc[key.kid] = key
    return acc
  }, {})

  // Update cache
  certsCache = { certs, expires }
  return certs
}

export async function verifyGoogleToken(token: string, clientId: string): Promise<GoogleTokenPayload> {
  try {
    // Decode the token (without verification) to get the key ID and check algorithm
    const decoded = decodeJwt(token)
    const { kid, alg } = decoded.header

    if (alg !== 'RS256') {
      throw new Error('Invalid algorithm. Expected RS256')
    }

    // Fetch Google's public keys
    const certs = await fetchGoogleCerts()
    const jwk = certs[kid]
    
    if (!jwk) {
      throw new Error('No matching key found')
    }

    // Import the public key
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' },
      },
      false, // not extractable
      ['verify']
    )

    // Split token and prepare for verification
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    const signedData = `${headerB64}.${payloadB64}`
    
    // Convert base64url signature to ArrayBuffer
    const signatureBytes = new Uint8Array(
      base64UrlDecode(signatureB64)
        .split('')
        .map(c => c.charCodeAt(0))
    )

    // Verify the signature
    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureBytes,
      new TextEncoder().encode(signedData)
    )

    if (!verified) {
      throw new Error('Invalid signature')
    }

    // Verify token claims
    const payload = decoded.payload as GoogleTokenPayload
    const now = Math.floor(Date.now() / 1000)

    // Check required claims
    if (!payload.iss || !payload.sub || !payload.aud || !payload.exp || !payload.iat) {
      throw new Error('Missing required claims')
    }

    // Verify issuer
    if (payload.iss !== 'https://accounts.google.com' && 
        payload.iss !== 'accounts.google.com') {
      throw new Error('Invalid issuer')
    }

    // Verify audience
    if (payload.aud !== clientId) {
      throw new Error('Invalid audience')
    }

    // Verify time-based claims
    if (payload.exp < now) {
      throw new Error('Token has expired')
    }

    if (payload.nbf && payload.nbf > now) {
      throw new Error('Token not yet valid')
    }

    if (payload.iat > now) {
      throw new Error('Token issued in the future')
    }

    // Verify email is verified (Google specific)
    if (payload.email && !payload.email_verified) {
      throw new Error('Email not verified')
    }

    return payload
  } catch (err) {
    console.error('Failed to verify token:', err)
    throw new Error('Invalid token')
  }
} 