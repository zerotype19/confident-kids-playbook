import { Env } from '../types';
import jwt from 'jsonwebtoken';

export const onRequestGet: PagesFunction<Env> = async (context) => {
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
    const url = new URL(request.url);
    const child_id = url.searchParams.get('child_id');

    if (!child_id) {
      return new Response(JSON.stringify({ error: 'Child ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Verify user has access to the child
    const child = await env.DB.prepare(`
      SELECT c.* 
      FROM children c
      JOIN family_members fm ON c.family_id = fm.family_id
      WHERE c.id = ? AND fm.user_id = ?
    `).bind(child_id, decoded.user_id).first();

    if (!child) {
      return new Response(JSON.stringify({ error: 'Child not found or access denied' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get media records
    const media = await env.DB.prepare(`
      SELECT * FROM media
      WHERE child_id = ?
      ORDER BY created_at DESC
    `).bind(child_id).all();

    return new Response(JSON.stringify({ media: media.results }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('List media error:', error);
    return new Response(JSON.stringify({ error: 'Failed to list media' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 