import { Env } from '../types';
import { corsHeaders } from '../lib/cors';

export async function onRequestGet(context: { request: Request; env: Env; params?: { childId: string } }) {
  const { request, env, params } = context;
  const childId = params?.childId;

  console.log('Trait Scores API: Request received', {
    url: request.url,
    method: request.method,
    childId
  });

  if (!childId) {
    return new Response(
      JSON.stringify({ error: 'Child ID is required' }),
      { 
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    const result = await env.DB.prepare(`
      SELECT 
        t.id as trait_id,
        t.name as trait_name,
        t.code as trait_code,
        t.pillar_id,
        cts.score
      FROM child_trait_scores cts
      INNER JOIN traits t ON t.id = cts.trait_id
      WHERE cts.child_id = ?
      ORDER BY cts.score DESC
    `).bind(childId).all();

    console.log('Trait Scores API: Successfully fetched scores:', result.results);

    return new Response(
      JSON.stringify({ data: result.results }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Trait Scores API: Error fetching scores:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch trait scores' }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }
} 