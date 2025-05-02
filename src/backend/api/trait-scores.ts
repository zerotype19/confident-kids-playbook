import { createDb } from '../lib/db';
import { Env } from '../types';

export async function onRequestGet({ request, env }: { request: Request, env: Env }) {
  try {
    const url = new URL(request.url);
    const childId = url.pathname.split('/').pop();

    if (!childId) {
      return new Response(
        JSON.stringify({ error: 'Child ID is required' }),
        {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          },
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

    return new Response(
      JSON.stringify({ data: result.results }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching trait scores:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch trait scores' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
} 