import { Env } from '../types';
import { verifyToken } from '../lib/auth';
import { corsHeaders } from '../lib/cors';

export async function onRequestGet({ request, env, params }: { request: Request; env: Env; params: { id: string } }) {
  console.log('🧭 Challenge details request:', {
    method: request.method,
    url: request.url,
    challengeId: params.id
  });

  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('*')
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token, env.JWT_SECRET);
    const userId = decodedToken.sub;

    // Get challenge details from D1
    const { results } = await env.DB.prepare(`
      SELECT id, title, description, tip, difficulty_level, age_range, pillar_id
      FROM challenges
      WHERE id = ?
    `).bind(params.id).all();

    if (!results || results.length === 0) {
      console.log('❌ Challenge not found:', params.id);
      return new Response(JSON.stringify({ error: 'Challenge not found' }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('*')
        }
      });
    }

    const challenge = results[0];
    console.log('✅ Found challenge:', {
      id: challenge.id,
      title: challenge.title
    });

    return new Response(JSON.stringify(challenge), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders('*')
      }
    });
  } catch (error) {
    console.error('❌ Error fetching challenge:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders('*')
      }
    });
  }
}

export async function onRequestPost({ request, env, params }: { request: Request; env: Env; params: { id: string } }) {
  console.log('🧭 Mark challenge complete request:', {
    method: request.method,
    url: request.url,
    challengeId: params.id
  });

  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('❌ No authorization header found');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('*')
        }
      });
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = await verifyToken(token, env.JWT_SECRET);
    const userId = decodedToken.sub;

    // Get user's selected child
    const { results: userData } = await env.DB.prepare(`
      SELECT selected_child_id FROM users WHERE id = ?
    `).bind(userId).all();

    const selectedChildId = userData[0]?.selected_child_id;
    if (!selectedChildId) {
      console.log('❌ No child selected for user:', userId);
      return new Response(JSON.stringify({ error: 'No child selected' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders('*')
        }
      });
    }

    // Mark challenge as complete in challenge_log
    const { success } = await env.DB.prepare(`
      INSERT INTO challenge_log (child_id, challenge_id, completed_at)
      VALUES (?, ?, ?)
      ON CONFLICT (child_id, challenge_id) DO UPDATE SET completed_at = ?
    `).bind(selectedChildId, params.id, new Date().toISOString(), new Date().toISOString()).run();

    if (!success) {
      throw new Error('Failed to mark challenge as complete');
    }

    console.log('✅ Challenge marked as complete:', {
      childId: selectedChildId,
      challengeId: params.id
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders('*')
      }
    });
  } catch (error) {
    console.error('❌ Error marking challenge complete:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders('*')
      }
    });
  }
} 