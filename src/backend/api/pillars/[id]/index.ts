import { Env } from '../../../types';
import { verifyJWT } from '../../../auth';
import { corsHeaders } from '../../../lib/cors';

interface Pillar {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders()
    });
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders()
    });
  }

  try {
    // Verify authentication
    const authorization = request.headers.get('Authorization');
    if (!authorization) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    // Get pillar ID from URL
    const url = new URL(request.url);
    const pillarId = url.pathname.split('/')[3]; // /api/pillars/:id

    // Get pillar details
    const pillar = await env.DB.prepare(`
      SELECT * FROM pillars WHERE id = ?
    `).bind(pillarId).first<Pillar>();

    if (!pillar) {
      return new Response(JSON.stringify({ error: 'Pillar not found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    return new Response(JSON.stringify(pillar), {
      headers: corsHeaders()
    });

  } catch (error) {
    console.error('Error fetching pillar:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 