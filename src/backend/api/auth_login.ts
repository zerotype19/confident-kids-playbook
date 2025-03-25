import { Env, AuthRequest } from '../types';
import { OAuth2Client } from 'google-auth-library';
import { sign } from '@tsndr/cloudflare-worker-jwt';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  console.log('🔍 Auth login request:', {
    hasEnv: !!env,
    hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
    hasJwtSecret: !!env.JWT_SECRET
  });

  const { provider, token } = await request.json() as AuthRequest;

  try {
    let user_id: string;
    let email: string;
    let name: string;
    let picture: string;

    if (provider === 'google') {
      console.log('🔍 Verifying Google token...');
      const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid token');
      user_id = payload.sub;
      email = payload.email!;
      name = payload.name || '';
      picture = payload.picture || '';
      console.log('✅ Google token verified:', { user_id, email, name, picture });
    } else if (provider === 'apple') {
      // Apple Sign In verification
      const appleClient = new OAuth2Client(env.APPLE_CLIENT_ID);
      const ticket = await appleClient.verifyIdToken({
        idToken: token,
        audience: env.APPLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid token');
      user_id = payload.sub;
      email = payload.email!;
      name = payload.name || '';
      picture = payload.picture || '';
    } else {
      throw new Error('Invalid provider');
    }

    // Check if user exists
    const user = await env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(user_id).first();

    if (!user) {
      // Create new user
      await env.DB.prepare(`
        INSERT INTO users (id, email, name, picture, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(user_id, email, name, picture).run();
    }

    // Create JWT with all required fields
    const jwtPayload = {
      sub: user_id,
      email,
      name,
      picture,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 // 7 days
    };

    console.log('🔑 Creating JWT with payload:', jwtPayload);
    const jwtToken = await sign(jwtPayload, env.JWT_SECRET);
    console.log('✅ JWT created successfully');

    return new Response(JSON.stringify({ token: jwtToken }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('❌ Auth login error:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 401,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}; 