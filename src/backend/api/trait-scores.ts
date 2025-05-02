import { db } from '../lib/db';

export async function GET(
  request: Request,
  { params }: { params: { childId: string } }
) {
  try {
    const { childId } = params;

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

    const traitScores = await db.query(`
      SELECT 
        t.id as trait_id,
        t.name as trait_name,
        t.code as trait_code,
        t.pillar_id,
        cts.score
      FROM child_trait_scores cts
      INNER JOIN traits t ON t.id = cts.trait_id
      WHERE cts.child_id = $1
      ORDER BY cts.score DESC
    `, [childId]);

    return new Response(
      JSON.stringify(traitScores),
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