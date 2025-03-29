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