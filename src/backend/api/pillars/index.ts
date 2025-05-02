import { Env } from '../../types';
import { verifyJWT } from '../../auth';
import { corsHeaders } from '../../lib/cors';

interface Child {
  id: string;
  age_range: string;
}

interface Pillar {
  id: number;
  name: string;
  description: string;
  icon: string;
  color: string;
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

    // Get child ID from URL search params
    const url = new URL(request.url);
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

    // Get all pillars with progress for the child
    console.log('Fetching pillars for child:', {
      childId,
      ageRange: child.age_range
    });

    // Get all pillars
    const { results: pillars } = await env.DB.prepare(`
      SELECT * FROM pillars
      ORDER BY id ASC
    `).all();

    // Get challenge types for each pillar
    const pillarsWithTypes = await Promise.all(
      pillars.map(async (pillar) => {
        // Get challenge types for this pillar
        const { results: challengeTypes } = await env.DB.prepare(`
          SELECT * FROM challenge_types
          WHERE pillar_id = ?
          ORDER BY challenge_type_id ASC
        `).bind(pillar.id).all();

        // Get total challenges for this pillar
        const { total } = await env.DB.prepare(`
          SELECT COUNT(*) as total FROM challenges WHERE pillar_id = ?
        `).bind(pillar.id).first();

        // Get completed challenges for this pillar and child
        const { completed } = await env.DB.prepare(`
          SELECT COUNT(*) as completed FROM challenges 
          WHERE pillar_id = ? AND id IN (
            SELECT challenge_id FROM challenge_logs 
            WHERE child_id = ? AND completed_at IS NOT NULL
          )
        `).bind(pillar.id, childId).first();

        const progress = total ? (completed / total) * 100 : 0;

        return {
          ...pillar,
          progress,
          challenge_types: challengeTypes
        };
      })
    );

    return new Response(JSON.stringify(pillarsWithTypes), {
      headers: corsHeaders()
    });

  } catch (error) {
    console.error('Error fetching pillars:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 