import { Env, RecordMediaRequest } from '../types';
import jwt from 'jsonwebtoken';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { user_id: string };
    const data = await request.json() as RecordMediaRequest;

    // Verify user has access to the child
    const child = await env.DB.prepare(`
      SELECT c.* 
      FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ?
    `).bind(data.child_id, decoded.user_id).first();

    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Record media metadata
    const result = await env.DB.prepare(`
      INSERT INTO media (
        id,
        child_id,
        key,
        filename,
        file_type,
        size,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      crypto.randomUUID(),
      data.child_id,
      data.key,
      data.filename,
      data.file_type,
      data.size
    ).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Record media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to record media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 