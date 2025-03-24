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
}

// Decodes a JWT without verification
function decodeJwt(token: string): { header: JWTHeader; payload: any } {
  const [headerB64, payloadB64] = token.split('.')
  const header = JSON.parse(atob(headerB64))
  const payload = JSON.parse(atob(payloadB64))
  return { header, payload }
}

async function fetchGoogleCerts(): Promise<Record<string, string>> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/certs')
  const data = await response.json()
  return data.keys.reduce((acc: Record<string, string>, key: any) => {
    acc[key.kid] = key
    return acc
  }, {})
}

export async function verifyGoogleToken(token: string, clientId: string): Promise<GoogleTokenPayload> {
  try {
    // Decode the token (without verification) to get the key ID
    const decoded = decodeJwt(token)
    const { kid } = decoded.header

    // Fetch Google's public keys
    const certs = await fetchGoogleCerts()
    const key = certs[kid]
    
    if (!key) {
      throw new Error('No matching key found')
    }

    // Import the public key
    const publicKey = await crypto.subtle.importKey(
      'jwk',
      key,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: { name: 'SHA-256' },
      },
      true,
      ['verify']
    )

    // Verify the signature
    const tokenParts = token.split('.')
    const signatureBase = tokenParts[0] + '.' + tokenParts[1]
    const signature = tokenParts[2].replace(/-/g, '+').replace(/_/g, '/')
    const signatureBytes = new Uint8Array(
      atob(signature.padEnd(Math.ceil(signature.length / 4) * 4, '='))
        .split('')
        .map(c => c.charCodeAt(0))
    )

    const verified = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      publicKey,
      signatureBytes,
      new TextEncoder().encode(signatureBase)
    )

    if (!verified) {
      throw new Error('Invalid signature')
    }

    // Verify token claims
    const payload = decoded.payload as GoogleTokenPayload
    const now = Math.floor(Date.now() / 1000)

    if (payload.iss !== 'https://accounts.google.com' && 
        payload.iss !== 'accounts.google.com') {
      throw new Error('Invalid issuer')
    }

    if (payload.aud !== clientId) {
      throw new Error('Invalid audience')
    }

    if (payload.exp < now) {
      throw new Error('Token expired')
    }

    if (!payload.email_verified) {
      throw new Error('Email not verified')
    }

    return payload
  } catch (err) {
    console.error('Failed to verify token:', err)
    throw new Error('Invalid token')
  }
} 