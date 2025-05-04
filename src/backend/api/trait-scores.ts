import { Env } from '../types';
import { corsHeaders } from '../lib/cors';

export async function onRequestGet(context: { request: Request; env: Env; params?: { childId: string } }) {
  const { request, env, params } = context;
  const childId = params?.childId;
  const url = new URL(request.url);
  const historical = url.searchParams.get('historical') === 'true';

  console.log('Trait Scores API: Request received', {
    url: request.url,
    method: request.method,
    childId,
    historical
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
    let query;
    let params;
    if (historical) {
      query = `
        SELECT 
          t.id as trait_id,
          t.name as trait_name,
          t.code as trait_code,
          t.pillar_id,
          cts.score
        FROM child_trait_scores cts
        INNER JOIN traits t ON t.id = cts.trait_id
        WHERE cts.child_id = ?
        AND cts.updated_at <= datetime('now', '-7 days')
        ORDER BY cts.score DESC
      `;
      params = [childId];
    } else {
      query = `
        WITH recent_trait_gains AS (
          SELECT 
            tsh.trait_id,
            SUM(tsh.score_delta) as total_gain,
            t.name as trait_name,
            t.code as trait_code,
            t.pillar_id
          FROM trait_score_history tsh
          INNER JOIN traits t ON t.id = tsh.trait_id
          WHERE tsh.child_id = ?
          AND tsh.completed_at >= datetime('now', '-7 days')
          GROUP BY tsh.trait_id
          ORDER BY total_gain DESC
        ),
        current_scores AS (
          SELECT 
            t.id as trait_id,
            t.name as trait_name,
            t.code as trait_code,
            t.pillar_id,
            cts.score
          FROM child_trait_scores cts
          INNER JOIN traits t ON t.id = cts.trait_id
          WHERE cts.child_id = ?
        )
        SELECT 
          cs.*,
          COALESCE(rtg.total_gain, 0) as recent_gain
        FROM current_scores cs
        LEFT JOIN recent_trait_gains rtg ON cs.trait_id = rtg.trait_id
        ORDER BY cs.score DESC
      `;
      params = [childId, childId];
    }

    const result = await env.DB.prepare(query).bind(...params).all();

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