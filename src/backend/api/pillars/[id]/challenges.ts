import { Env } from '../../../types';
import { verifyJWT } from '../../../auth';
import { corsHeaders } from '../../../lib/cors';

interface Child {
  id: string;
  age_range: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string;
  example_dialogue: string;
  tip: string;
  pillar_id: number;
  age_range: string;
  difficulty_level: number;
  is_completed: number;
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

    // Get pillar ID from URL and child ID from query params
    const url = new URL(request.url);
    const pillarId = url.pathname.split('/')[3]; // /api/pillars/:id/challenges
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

    // Get challenges for this pillar that match the child's age range
    console.log('Fetching challenges for child:', {
      childId,
      ageRange: child.age_range,
      pillarId
    });

    const challenges = await env.DB.prepare(`
      SELECT 
        c.id,
        c.title,
        c.description,
        c.goal,
        c.steps,
        c.example_dialogue,
        c.tip,
        c.pillar_id,
        c.age_range,
        c.difficulty_level,
        CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END as is_completed
      FROM challenges c
      LEFT JOIN challenge_logs cl ON c.id = cl.challenge_id 
        AND cl.child_id = ?
      WHERE c.pillar_id = ?
        AND REPLACE(REPLACE(REPLACE(c.age_range, '–', '-'), '—', '-'), ' ', '') = 
            REPLACE(REPLACE(REPLACE(?, '–', '-'), '—', '-'), ' ', '')
      ORDER BY c.difficulty_level, c.title
    `).bind(childId, pillarId, child.age_range).all<Challenge>();

    console.log('Found challenges:', {
      count: challenges.results?.length || 0,
      firstChallenge: challenges.results?.[0],
      childAgeRange: child.age_range,
      childId: childId
    });

    return new Response(JSON.stringify(challenges.results), {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Error fetching pillar challenges:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 