import { Env } from '../../../types';
import { verifyJWT } from '../../../auth';
import { corsHeaders } from '../../../lib/cors';

interface Child {
  id: string;
  age_range: string;
}

interface PillarProgress {
  total: number;
  completed: number;
  progress: number;
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

    // Get pillar ID and child ID from URL
    const url = new URL(request.url);
    const pillarId = url.pathname.split('/')[3]; // /api/pillars/:id/progress
    const childId = url.searchParams.get('child_id');

    if (!childId) {
      return new Response(JSON.stringify({ error: 'Child ID is required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Verify user has access to the child
    const child = await env.DB.prepare(`
      SELECT c.* 
      FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ?
    `).bind(childId, payload.sub).first<Child>();

    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found or access denied' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Get total challenges for this pillar
    const { total } = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM challenges WHERE pillar_id = ?
    `).bind(pillarId).first<{ total: number }>();

    // Get completed challenges for this pillar and child
    const { completed } = await env.DB.prepare(`
      SELECT COUNT(*) as completed FROM challenges 
      WHERE pillar_id = ? AND id IN (
        SELECT challenge_id FROM challenge_logs 
        WHERE child_id = ? AND completed_at IS NOT NULL
      )
    `).bind(pillarId, childId).first<{ completed: number }>();

    const progress = total ? (completed / total) * 100 : 0;

    const response: PillarProgress = {
      total,
      completed,
      progress
    };

    return new Response(JSON.stringify(response), {
      headers: corsHeaders()
    });

  } catch (error) {
    console.error('Error fetching pillar progress:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 