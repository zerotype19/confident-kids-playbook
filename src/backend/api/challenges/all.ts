import { Env } from '../../types';
import { verifyJWT } from '../../auth';
import { corsHeaders } from '../../lib/cors';

interface Child {
  id: string;
  age_range: string;
}

interface Challenge {
  id: string;
  title: string;
  pillar_id: number;
  age_range: string;
  challenge_type_id: number;
  difficulty_level: number;
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
  tags: string;
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

    // Get all challenges for the child's age range
    console.log('Fetching challenges for child:', {
      childId,
      ageRange: child.age_range
    });

    const challenges = await env.DB.prepare(`
      SELECT 
        c.*,
        CASE WHEN cl.completed_at IS NOT NULL THEN 1 ELSE 0 END as is_completed
      FROM challenges c
      LEFT JOIN challenge_logs cl ON c.id = cl.challenge_id 
        AND cl.child_id = ?
      WHERE REPLACE(REPLACE(REPLACE(c.age_range, '–', '-'), '—', '-'), ' ', '') = 
            REPLACE(REPLACE(REPLACE(?, '–', '-'), '—', '-'), ' ', '')
      ORDER BY c.pillar_id, c.difficulty_level
    `).bind(childId, child.age_range).all<Challenge>();

    // Parse JSON fields
    const parsedChallenges = challenges.results?.map(challenge => {
      try {
        // Convert Python-style list to JSON format for success_signals
        const successSignalsStr = challenge.success_signals
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/\[|\]/g, ''); // Remove brackets
        const successSignals = successSignalsStr.split(', ').map(signal => signal.trim());

        // Convert Python-style list to JSON format for tags
        const tagsStr = challenge.tags
          .replace(/'/g, '"') // Replace single quotes with double quotes
          .replace(/\[|\]/g, ''); // Remove brackets
        const tags = tagsStr ? tagsStr.split(', ').map(tag => tag.trim()) : [];
        
        return {
          ...challenge,
          success_signals: successSignals,
          tags: tags
        };
      } catch (error: any) {
        console.error('Error parsing challenge data:', {
          challengeId: challenge.id,
          error: error.message,
          success_signals: challenge.success_signals,
          tags: challenge.tags
        });
        return {
          ...challenge,
          success_signals: [],
          tags: []
        };
      }
    }) || [];

    console.log('Found challenges:', {
      count: parsedChallenges.length,
      firstChallenge: parsedChallenges[0],
      childAgeRange: child.age_range,
      childId: childId
    });

    return new Response(JSON.stringify(parsedChallenges), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Error fetching challenges:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch challenges' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 