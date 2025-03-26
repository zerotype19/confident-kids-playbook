import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
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

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders()
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    // Update user's onboarding status
    const result = await env.DB.prepare(
      'UPDATE users SET has_completed_onboarding = true WHERE id = ?'
    ).bind(payload.sub).run();

    if (!result.success) {
      throw new Error('Failed to update onboarding status');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Failed to mark onboarding as complete:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 