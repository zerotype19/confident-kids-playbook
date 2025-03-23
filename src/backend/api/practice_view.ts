/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const url = new URL(request.url);
  const child_id = url.searchParams.get('child_id');
  const pillar_id = url.searchParams.get('pillar_id');

  if (!child_id) {
    return new Response(JSON.stringify({ error: 'child_id is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let query = `
      SELECT m.*, 
        GROUP_CONCAT(DISTINCT p.step_id) as completed_steps
      FROM practice_modules m
      LEFT JOIN practice_progress p ON m.id = p.module_id AND p.child_id = ?
    `;
    const params = [child_id];

    if (pillar_id) {
      query += ' WHERE m.pillar_id = ?';
      params.push(pillar_id);
    }

    query += ' GROUP BY m.id ORDER BY m.created_at DESC';

    const result = await context.env.DB.prepare(query)
      .bind(...params)
      .all();

    const modules = result.results.map((row: any) => ({
      ...row,
      completed_steps: row.completed_steps ? row.completed_steps.split(',') : []
    }));

    return new Response(JSON.stringify({ modules }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching practice modules:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch practice modules' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 