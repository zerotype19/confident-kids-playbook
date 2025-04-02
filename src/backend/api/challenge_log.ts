import { Env } from '../types';
import { corsHeaders } from '../lib/cors';
import { verifyJWT } from '../auth';
import { v4 as uuidv4 } from 'uuid';
import { evaluateAndGrantRewards } from '../lib/rewardEngine';

interface ChallengeLogRequest {
  child_id: string;
  challenge_id: string;
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

    // Verify child belongs to user's family
    const childResult = await env.DB.prepare(`
      SELECT c.*, f.id as family_id
      FROM children c
      JOIN families f ON c.family_id = f.id
      WHERE c.id = ? AND f.id IN (
        SELECT family_id FROM family_members WHERE user_id = ?
      )
    `).bind(body.child_id, payload.sub).first();

    if (!childResult) {
      return new Response(JSON.stringify({ error: 'Child not found or access denied' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Check if challenge exists
    const challengeResult = await env.DB.prepare(`
      SELECT * FROM challenges 
      WHERE id = ?
    `).bind(body.challenge_id).first();

    if (!challengeResult) {
      return new Response(JSON.stringify({ error: 'Challenge not found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Check for duplicate log for today
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
    console.log('Generated log ID:', logId);
    console.log('Inserting with values:', {
      logId,
      childId: body.child_id,
      challengeId: body.challenge_id
    });
    
    const insertResult = await env.DB.prepare(`
      INSERT INTO challenge_logs (
        id,
        child_id,
        challenge_id,
        completed_at
      ) VALUES (?, ?, ?, datetime('now'))
    `)
      .bind(logId, body.child_id, body.challenge_id)
      .run();

    if (!insertResult.success) {
      console.error('Insert failed:', insertResult);
      return new Response(JSON.stringify({ error: 'Failed to log challenge completion' }), {
        status: 500,
        headers: corsHeaders()
      });
    }

    console.log('Challenge log inserted successfully:', insertResult);

    // Evaluate and grant rewards
    console.log('Starting reward evaluation...');
    await evaluateAndGrantRewards(body.child_id, env);
    console.log('Reward evaluation complete');

    // Calculate updated stats
    console.log('Calculating updated stats...');
    const statsResult = await env.DB.prepare(`
      WITH streak_info AS (
        SELECT 
          COUNT(*) as total_completed,
          MAX(completed_at) as last_completed,
          COUNT(DISTINCT date(completed_at)) as unique_days
        FROM challenge_logs
        WHERE child_id = ?
      )
      SELECT 
        total_completed,
        unique_days as current_streak,
        (SELECT COUNT(*) FROM challenge_logs WHERE child_id = ?) as total_coins
      FROM streak_info
    `).bind(body.child_id, body.child_id).first();

    console.log('Stats calculated:', statsResult);

    return new Response(JSON.stringify({
      success: true,
      stats: statsResult
    }), {
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