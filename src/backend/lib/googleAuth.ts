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

    console.log('✅ Google token verified, payload:', {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      sub: payload.sub
    });

    // Create JWT with the same sub as the Google token
    const jwtPayload: JwtPayload = {
      sub: payload.sub || payload.email || '', // Use sub from Google or fallback to email
      email: payload.email || '',
      name: payload.name || '',
      picture: payload.picture || '',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    };

    console.log('🔑 Creating JWT with payload:', jwtPayload);
    const token = await sign(jwtPayload, jwtSecret);
    
    console.log('✅ JWT created successfully');
    return {
      success: true,
      jwt: token
    };
  } catch (error) {
    console.error('❌ Error in verifyGoogleTokenAndCreateJwt:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return {
      success: false,
      error: 'Failed to verify token'
    };
  }
} 