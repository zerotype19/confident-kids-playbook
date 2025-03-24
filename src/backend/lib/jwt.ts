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

// Decodes a JWT without verification
function decodeJwt(token: string): { header: JWTHeader; payload: any } {
  const [headerB64, payloadB64] = token.split('.')
  const header = JSON.parse(atob(headerB64.replace(/-/g, '+').replace(/_/g, '/')))
  const payload = JSON.parse(atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/')))
  return { header, payload }
}

async function fetchGoogleCerts(): Promise<Record<string, GoogleCertificate>> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  if (!response.ok) {
    throw new Error('Failed to fetch Google certificates')
  }
  const data = await response.json() as GoogleCertsResponse
  return data.keys.reduce((acc: Record<string, GoogleCertificate>, key: GoogleCertificate) => {
    acc[key.kid] = key
    return acc
  }, {})
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
      false, // extractable
      ['verify']
    )

    // Split token and prepare for verification
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    const signedData = `${headerB64}.${payloadB64}`
    
    // Convert base64url to ArrayBuffer
    const signatureUrl = signatureB64.replace(/-/g, '+').replace(/_/g, '/')
    const signature = new Uint8Array(
      atob(signatureUrl.padEnd(Math.ceil(signatureUrl.length / 4) * 4, '='))
        .split('')
        .map(c => c.charCodeAt(0))
    )

    // Verify the signature
    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signature,
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