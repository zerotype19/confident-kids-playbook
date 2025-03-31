import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders } from '../lib/cors';

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // Verify JWT token
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'No authorization token provided' }),
        { status: 401, headers: corsHeaders() }
      );
    }

    const decoded = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: corsHeaders() }
      );
    }

    // Get child_id from query params
    const url = new URL(request.url);
    const childId = url.searchParams.get('childId');
    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'Child ID is required' }),
        { status: 400, headers: corsHeaders() }
      );
    }

    // Get child's age range
    const child = await env.DB.prepare(`
      SELECT age_range FROM children WHERE id = ?
    `).bind(childId).first();

    if (!child) {
      return new Response(
        JSON.stringify({ error: 'Child not found' }),
        { status: 404, headers: corsHeaders() }
      );
    }

    // Get all challenges for the child's age range, with completion status
    const challenges = await env.DB.prepare(`
      SELECT 
        c.*,
        CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END AS is_completed
      FROM challenges c
      LEFT JOIN challenge_logs cl 
        ON c.id = cl.challenge_id AND cl.child_id = ?
      WHERE c.age_range = ?
      ORDER BY c.pillar_id ASC, c.difficulty_level ASC
    `).bind(childId, child.age_range).all();

    return new Response(
      JSON.stringify({ challenges }),
      { headers: corsHeaders() }
    );

  } catch (error) {
    console.error('Error fetching challenges:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch challenges',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
} 