// src/backend/api/challenges_complete.ts

import { verifyJWT } from '../auth';
import { DB } from '../db';

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const decodedToken = await verifyJWT(token, env);

    // Parse request body
    const body = await request.json();
    const { child_id, challenge_id } = body;

    if (!child_id || !challenge_id) {
      return new Response(JSON.stringify({ error: 'Missing child_id or challenge_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
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
    `).bind(child_id, decodedToken.sub).first();

    if (!childResult) {
      return new Response(JSON.stringify({ error: 'Child not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check if challenge exists and is not already completed
    const challengeResult = await env.DB.prepare(`
      SELECT * FROM challenges 
      WHERE id = ? AND id NOT IN (
        SELECT challenge_id FROM challenge_logs WHERE child_id = ?
      )
    `).bind(challenge_id, child_id).first();

    if (!challengeResult) {
      return new Response(JSON.stringify({ error: 'Challenge not found or already completed' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert challenge completion log
    await env.DB.prepare(`
      INSERT INTO challenge_logs (child_id, challenge_id, completed_at)
      VALUES (?, ?, datetime('now'))
    `).bind(child_id, challenge_id).run();

    // Calculate updated stats
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
    `).bind(child_id, child_id).first();

    return new Response(JSON.stringify({
      message: 'Challenge marked as complete',
      stats: statsResult
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error completing challenge:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to complete challenge',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
