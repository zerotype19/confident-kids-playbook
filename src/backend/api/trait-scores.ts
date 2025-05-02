import { createDb } from '../lib/db';
import { Env } from '../types';
import { corsHeaders } from '../lib/cors';

export async function onRequestGet({ request, env }: { request: Request, env: Env }) {
  console.log('Trait Scores API: Request received', {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries())
  });

  try {
    const url = new URL(request.url);
    const childId = url.pathname.split('/').pop();

    console.log('Trait Scores API: Parsed URL parameters', {
      childId,
      pathname: url.pathname
    });

    if (!childId) {
      console.log('Trait Scores API: Missing child ID');
      return new Response(
        JSON.stringify({ error: 'Child ID is required' }),
        {
          status: 400,
          headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
        }
      );
    }

    const db = createDb(env);
    const result = await db.query(`
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
    `, [childId]);

    console.log('Trait Scores API: Successfully fetched scores:', result.results);

    return new Response(
      JSON.stringify(result.results),
      {
        status: 200,
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