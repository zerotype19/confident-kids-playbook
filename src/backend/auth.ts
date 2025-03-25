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
  email: string
  name: string
  picture: string
  iat: number
  exp: number
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

export async function verifyJWT(token: string, env: Env): Promise<JwtPayload> {
  console.log('🔑 Verifying JWT:', {
    tokenLength: token.length,
    tokenPrefix: token.substring(0, 20) + '...',
    hasJwtSecret: !!env.JWT_SECRET,
    jwtSecretLength: env.JWT_SECRET?.length,
    jwtSecretPreview: env.JWT_SECRET ? `${env.JWT_SECRET.substring(0, 4)}...${env.JWT_SECRET.substring(env.JWT_SECRET.length - 4)}` : undefined
  });

  if (!env.JWT_SECRET) {
    console.error('❌ JWT_SECRET not set in environment');
    throw new Error('JWT_SECRET not configured');
  }

  try {
    console.log('🔍 Attempting to verify JWT...');
    const decoded = await verify(token, env.JWT_SECRET);
    console.log('✅ JWT verification successful, decoded token:', {
      hasDecoded: !!decoded,
      decodedType: typeof decoded,
      decodedKeys: Object.keys(decoded),
      decodedPreview: decoded ? JSON.stringify(decoded).substring(0, 100) + '...' : undefined
    });

    const payload = decoded as JwtPayload;
    
    console.log('✅ JWT verification successful:', {
      hasPayload: !!payload,
      hasSub: !!payload?.sub,
      hasEmail: !!payload?.email,
      hasName: !!payload?.name,
      hasExp: !!payload?.exp,
      exp: payload?.exp,
      isExpired: payload?.exp ? payload.exp < Math.floor(Date.now() / 1000) : true,
      currentTime: Math.floor(Date.now() / 1000),
      timeUntilExpiry: payload?.exp ? payload.exp - Math.floor(Date.now() / 1000) : undefined
    });

    if (!payload?.sub) {
      console.error('❌ Invalid token payload:', payload);
      throw new Error('Invalid token payload');
    }

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      console.error('❌ Token expired:', {
        exp: payload.exp,
        now: Math.floor(Date.now() / 1000),
        timeExpired: Math.floor(Date.now() / 1000) - payload.exp
      });
      throw new Error('Token expired');
    }

    return payload;
  } catch (error) {
    console.error('❌ JWT verification failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    throw error;
  }
}
