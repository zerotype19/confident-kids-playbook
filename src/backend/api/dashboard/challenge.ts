import { Env } from '../../types';
import { corsHeaders, handleOptions } from '../../lib/cors';

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

export async function challenge({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const childId = url.searchParams.get('childId');

  if (!childId) {
    return new Response(JSON.stringify({ error: 'Child ID is required' }), {
      status: 400,
      headers: corsHeaders()
    });
  }

  try {
    // Get a random challenge for the day
    const result = await env.DB.prepare(`
      SELECT 
        id,
        title,
        description,
        goal,
        steps,
        example_dialogue,
        tip,
        pillar
      FROM challenges
      ORDER BY RANDOM()
      LIMIT 1
    `).first();

    if (!result) {
      return new Response(JSON.stringify({ error: 'No challenges available' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Parse the steps JSON array
    const challenge: Challenge = {
      ...result,
      steps: JSON.parse(result.steps)
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