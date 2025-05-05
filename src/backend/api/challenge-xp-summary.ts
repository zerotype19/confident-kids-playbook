import { Env } from '../types';
import { corsHeaders } from '../lib/cors';

export async function onRequestGet(context: { request: Request; env: Env; params: { childId: string; challengeId: string } }) {
  const { env, params } = context;
  const { childId, challengeId } = params;

  if (!childId || !challengeId) {
    return new Response(JSON.stringify({ error: 'Missing childId or challengeId' }), {
      status: 400,
      headers: corsHeaders()
    });
  }

  try {
    // Get the most recent completion timestamp for this child/challenge
    const recent = await env.DB.prepare(`
      SELECT MAX(completed_at) as recent_completed
      FROM trait_score_history
      WHERE child_id = ? AND challenge_id = ?
    `).bind(childId, challengeId).first<{ recent_completed: string }>();

    if (!recent?.recent_completed) {
      return new Response(JSON.stringify({ traits: [], total_xp: 0 }), {
        headers: corsHeaders()
      });
    }

    // Get all trait deltas for this completion
    const rows = await env.DB.prepare(`
      SELECT tsh.trait_id, t.name as trait_name, tsh.score_delta as xp_gained, cts.score as new_total
      FROM trait_score_history tsh
      INNER JOIN traits t ON t.id = tsh.trait_id
      LEFT JOIN child_trait_scores cts ON cts.child_id = tsh.child_id AND cts.trait_id = tsh.trait_id
      WHERE tsh.child_id = ? AND tsh.challenge_id = ? AND tsh.completed_at = ?
    `).bind(childId, challengeId, recent.recent_completed).all<{
      trait_id: number;
      trait_name: string;
      xp_gained: number;
      new_total: number;
    }>();

    const traits = rows.results || [];
    const total_xp = traits.reduce((sum, t) => sum + (t.xp_gained || 0), 0);

    return new Response(JSON.stringify({ traits, total_xp }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Error in challenge-xp-summary:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 