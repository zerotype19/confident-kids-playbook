/// <reference types="@cloudflare/workers-types" />

interface Env {
  DB: D1Database;
}

interface ProgressRequest {
  child_id: string;
  module_id: string;
  step_id: string;
}

interface ProgressRecord {
  completed_steps: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request } = context;
  const body = await request.json() as ProgressRequest;
  const { child_id, module_id, step_id } = body;

  if (!child_id || !module_id || !step_id) {
    return new Response(JSON.stringify({ error: 'Missing required fields' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Check if progress already exists
    const existing = await context.env.DB.prepare(`
      SELECT * FROM practice_progress 
      WHERE child_id = ? AND module_id = ?
    `).bind(child_id, module_id).first() as ProgressRecord | null;

    if (existing) {
      // Update existing progress
      const completedSteps = existing.completed_steps.split(',');
      if (!completedSteps.includes(step_id)) {
        completedSteps.push(step_id);
      }

      await context.env.DB.prepare(`
        UPDATE practice_progress 
        SET completed_steps = ?, updated_at = CURRENT_TIMESTAMP
        WHERE child_id = ? AND module_id = ?
      `).bind(completedSteps.join(','), child_id, module_id).run();
    } else {
      // Create new progress
      await context.env.DB.prepare(`
        INSERT INTO practice_progress (child_id, module_id, step_id, completed_steps)
        VALUES (?, ?, ?, ?)
      `).bind(child_id, module_id, step_id, step_id).run();
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating practice progress:', error);
    return new Response(JSON.stringify({ error: 'Failed to update progress' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}; 