// src/backend/api/challenges_complete.ts

import { verifyToken } from '../auth';
import { getDB } from '../db';

export async function onRequestPost({ request, env }) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Missing or invalid authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token, env);
    if (!decodedToken) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parse request body
    const body = await request.json();
    const { child_id, challenge_id } = body;

    if (!child_id || !challenge_id) {
      return new Response(JSON.stringify({ error: 'Missing child_id or challenge_id' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get database connection
    const db = getDB(env);

    // Verify child belongs to user's family
    const childResult = await db.prepare(`
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
    const challengeResult = await db.prepare(`
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
    await db.prepare(`
      INSERT INTO challenge_logs (child_id, challenge_id, completed_at)
      VALUES (?, ?, datetime('now'))
    `).bind(child_id, challenge_id).run();

    // Get updated streak and coins
    const statsResult = await db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM challenge_logs 
         WHERE child_id = ? AND completed_at >= date('now', '-7 days')) as current_streak,
        (SELECT COALESCE(SUM(coins_earned), 0) FROM challenge_logs 
         WHERE child_id = ?) as total_coins
    `).bind(child_id, child_id).first();

    return new Response(JSON.stringify({
      success: true,
      message: 'Challenge marked complete',
      new_streak: statsResult.current_streak,
      new_coins: statsResult.total_coins
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error completing challenge:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
