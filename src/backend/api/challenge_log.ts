import { Env } from '../types';
import { corsHeaders } from '../lib/cors';
import { verifyJWT } from '../lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { evaluateAndGrantRewards } from '../lib/rewardEngine';

interface ChallengeLogRequest {
  child_id: string;
  challenge_id: string;
  reflection?: string;
  mood_rating?: number;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
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

    // Parse request body
    const body: ChallengeLogRequest = await request.json();
    
    if (!body.child_id || !body.challenge_id) {
      return new Response(JSON.stringify({ error: 'Child ID and Challenge ID are required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Check for duplicate log
    const existingLog = await env.DB.prepare(`
      SELECT id FROM challenge_logs 
      WHERE child_id = ? 
      AND challenge_id = ? 
      AND date(completed_at) = date('now')
    `).bind(body.child_id, body.challenge_id).first();

    if (existingLog) {
      return new Response(JSON.stringify({ error: 'Challenge already completed today' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Insert new log
    const logId = uuidv4();
    await env.DB.prepare(`
      INSERT INTO challenge_logs (id, child_id, challenge_id, completed_at, reflection, mood_rating)
      VALUES (?, ?, ?, datetime('now'), ?, ?)
    `).bind(
      logId,
      body.child_id,
      body.challenge_id,
      body.reflection || null,
      body.mood_rating || null
    ).run();

    // Evaluate and grant rewards
    await evaluateAndGrantRewards(body.child_id, env);

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders()
    });

  } catch (error) {
    console.error('Error logging challenge completion:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to log challenge completion',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
} 