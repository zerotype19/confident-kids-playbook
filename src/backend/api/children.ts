import { Context } from 'hono';
import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';

export async function onRequest(c: Context<{ Bindings: Env }>) {
  const { request, env } = c;
  
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
    const payload = await verifyJWT(token, env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    console.log('🔑 JWT verification successful:', {
      userId: payload.sub,
      email: payload.email
    });

    // Get user's family
    const familyMember = await env.DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? 
      LIMIT 1
    `).bind(payload.sub).first();

    if (!familyMember) {
      return new Response(JSON.stringify({ error: 'No family found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Get all children for the family
    const children = await env.DB.prepare(`
      SELECT * FROM children 
      WHERE family_id = ?
      ORDER BY name
    `).bind(familyMember.family_id).all();

    return new Response(JSON.stringify({
      success: true,
      children: children.results
    }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('❌ Failed to get children:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 