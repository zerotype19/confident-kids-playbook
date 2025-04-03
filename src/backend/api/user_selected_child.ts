import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';

interface UpdateSelectedChildRequest {
  childId: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  console.log('🚀 User selected child endpoint called:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

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

  if (request.method !== 'PUT') {
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

    const body = await request.json() as UpdateSelectedChildRequest;
    
    if (!body.childId) {
      return new Response(JSON.stringify({ error: 'Child ID is required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Verify the child belongs to the user's family
    const childCheck = await env.DB.prepare(`
      SELECT c.id FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ?
    `).bind(body.childId, payload.sub).first();

    if (!childCheck) {
      return new Response(JSON.stringify({ error: 'Child not found or access denied' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Update the user's selected child ID
    const updateResult = await env.DB.prepare(`
      UPDATE users SET selected_child_id = ? WHERE id = ?
    `).bind(body.childId, payload.sub).run();

    if (!updateResult.success) {
      throw new Error('Failed to update selected child');
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Failed to update selected child:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 