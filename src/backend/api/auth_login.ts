import { Env, AuthRequest } from '../types';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { provider, token } = await request.json() as AuthRequest;

  try {
    let user_id: string;
    let email: string;

    if (provider === 'google') {
      const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      if (!payload) throw new Error('Invalid token');
      user_id = payload.sub;
      email = payload.email!;
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
        INSERT INTO users (id, email, created_at, updated_at)
        VALUES (?, ?, datetime('now'), datetime('now'))
      `).bind(user_id, email).run();
    }

    // Generate JWT
    const jwt_token = jwt.sign(
      { user_id, email },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return new Response(JSON.stringify({ token: jwt_token }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Authentication failed' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 