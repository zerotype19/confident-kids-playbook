import { Env } from '../types';
import { verifyJWT } from '../auth';

export async function onRequest(context: any) {
  const { request, env } = context;
  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, env as Env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
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
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to mark onboarding as complete:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 