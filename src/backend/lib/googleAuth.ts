import { OAuth2Client } from "google-auth-library"
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
  jwtSecret: string,
  googleClientId: string
): Promise<AuthResult> {
  try {
    console.log('🔍 Verifying Google token with client ID:', googleClientId);
    
    // Verify the Google token using the Google client
    const client = new OAuth2Client(googleClientId);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: googleClientId
    });
    
    const payload = ticket.getPayload();
    if (!payload) {
      console.error('❌ No payload in Google token');
      return {
        success: false,
        error: 'Invalid token'
      };
    }

    console.log('✅ Google token verified successfully:', {
      hasPayload: !!payload,
      hasEmail: !!payload.email,
      hasName: !!payload.name,
      hasPicture: !!payload.picture
    });

    const email = payload.email;
    const name = payload.name || '';
    const picture = payload.picture || '';

    if (!email) {
      console.error('❌ Missing email in Google token');
      return {
        success: false,
        error: 'Missing email in token'
      };
    }

    // Create our app's JWT
    const jwtPayload: JwtPayload = {
      sub: email,
      email,
      name,
      picture,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    };

    console.log('🔑 Creating JWT with payload:', jwtPayload);
    const jwt = await sign(jwtPayload, jwtSecret);
    console.log('✅ JWT created successfully');

    return {
      success: true,
      jwt
    };
  } catch (err) {
    console.error('❌ Token verification failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to process token'
    };
  }
} 