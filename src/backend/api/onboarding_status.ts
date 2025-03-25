import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';

interface User {
  has_completed_onboarding: boolean;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders()
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, context.env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    // Query the database directly
    const result = await context.env.DB.prepare(
      'SELECT has_completed_onboarding FROM users WHERE id = ?'
    ).bind(payload.sub).all<User>();

    const user = result.results?.[0];

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    return new Response(JSON.stringify({
      hasCompletedOnboarding: user.has_completed_onboarding || false
    }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Onboarding status check failed:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 