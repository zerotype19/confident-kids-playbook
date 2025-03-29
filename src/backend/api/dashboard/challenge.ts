import { Env } from '../../types';
import { verifyJWT } from '../../auth';
import { corsHeaders, handleOptions } from '../../lib/cors';

interface FamilyMemberResult {
  family_id: string;
}

interface ChildResult {
  age_range: string;
}

interface ChallengeResult {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string | string[];
  example_dialogue: string;
  tip: string;
  pillar_id: number;
  age_range: string;
  difficulty_level: string;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string[];
  example_dialogue: string;
  tip: string;
  pillar: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  if (request.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders()
    });
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders()
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    // Get child_id from query params
    const url = new URL(request.url);
    const childId = url.searchParams.get('child_id');
    if (!childId) {
      return new Response(JSON.stringify({ error: 'Child ID is required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Get user's family
    const familyMember = await env.DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? 
      LIMIT 1
    `).bind(payload.sub).first() as FamilyMemberResult | null;

    if (!familyMember) {
      return new Response(JSON.stringify({ error: 'No family found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Get child's age range
    const child = await env.DB.prepare(`
      SELECT age_range 
      FROM children 
      WHERE id = ? AND family_id = ?
    `).bind(childId, familyMember.family_id).first() as ChildResult | null;

    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Get a random challenge for the child's age range
    const challenge = await env.DB.prepare(`
      SELECT id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level
      FROM challenges
      WHERE age_range = ?
      ORDER BY RANDOM()
      LIMIT 1
    `).bind(child.age_range).first() as ChallengeResult | null;

    if (!challenge) {
      return new Response(JSON.stringify({ error: 'No challenges found for this age range' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Parse steps if it's a JSON string
    if (challenge.steps && typeof challenge.steps === 'string') {
      try {
        challenge.steps = JSON.parse(challenge.steps);
      } catch (e) {
        console.error('Failed to parse challenge steps:', e);
      }
    }

    return new Response(JSON.stringify({ challenge }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Failed to fetch challenge:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}

export async function challenge({ request, env }: { request: Request; env: Env }) {
  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders()
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    const url = new URL(request.url);
    const childId = url.searchParams.get('child_id');

    if (!childId) {
      return new Response(JSON.stringify({ error: 'Child ID is required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // TODO: Replace with actual database query
    // For now, return a mock challenge
    const challenge: Challenge = {
      id: '1',
      title: 'Ask, Don\'t Tell',
      description: 'Help your child develop problem-solving skills by asking questions instead of giving direct instructions.',
      goal: 'Encourage independent thinking and decision-making in your child',
      steps: [
        'Start with open-ended questions',
        'Listen without interrupting',
        'Guide them to find their own solutions',
        'Celebrate their problem-solving attempts'
      ],
      example_dialogue: 'Instead of saying "Put your toys away", try "What do you think would be a good way to organize your toys?"',
      tip: 'Remember to give your child time to think and respond. Silence is okay!',
      pillar: 'Problem Solving'
    };

    return new Response(JSON.stringify({ challenge }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch challenge' }),
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
} 