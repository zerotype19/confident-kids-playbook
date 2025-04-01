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

    // Get child's age range and verify access
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

    // Get total age-appropriate challenges for this pillar
    const { total } = await env.DB.prepare(`
      SELECT COUNT(*) as total 
      FROM challenges 
      WHERE pillar_id = ?
        AND REPLACE(REPLACE(REPLACE(age_range, '–', '-'), '—', '-'), ' ', '') = 
            REPLACE(REPLACE(REPLACE(?, '–', '-'), '—', '-'), ' ', '')
    `).bind(pillarId, child.age_range).first<{ total: number }>();

    // Get completed age-appropriate challenges for this pillar and child
    const { completed } = await env.DB.prepare(`
      SELECT COUNT(*) as completed 
      FROM challenges c
      JOIN challenge_logs cl ON c.id = cl.challenge_id
      WHERE c.pillar_id = ? 
        AND cl.child_id = ?
        AND cl.completed_at IS NOT NULL
        AND REPLACE(REPLACE(REPLACE(c.age_range, '–', '-'), '—', '-'), ' ', '') = 
            REPLACE(REPLACE(REPLACE(?, '–', '-'), '—', '-'), ' ', '')
    `).bind(pillarId, childId, child.age_range).first<{ completed: number }>();

    const progress = total ? (completed / total) * 100 : 0;

    console.log('Pillar progress calculation:', {
      pillarId,
      childId,
      childAgeRange: child.age_range,
      total,
      completed,
      progress
    });

    const response: PillarProgress = {
      total,
      completed,
      progress
    };

    return new Response(JSON.stringify(response), {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error fetching pillar progress:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 