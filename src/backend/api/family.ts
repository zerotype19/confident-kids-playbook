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

    // Get user's family
    const family = await env.DB.prepare(`
      SELECT f.*, 
             json_group_array(json_object(
               'id', fm.id,
               'user_id', fm.user_id,
               'role', fm.role,
               'created_at', fm.created_at,
               'updated_at', fm.updated_at
             )) as members,
             json_group_array(json_object(
               'id', c.id,
               'name', c.name,
               'age', c.age,
               'created_at', c.created_at,
               'updated_at', c.updated_at
             )) as children
      FROM families f
      LEFT JOIN family_members fm ON f.id = fm.family_id
      LEFT JOIN children c ON f.id = c.family_id
      WHERE f.id IN (
        SELECT family_id 
        FROM family_members 
        WHERE user_id = ?
      )
      GROUP BY f.id
    `).bind(decoded.user_id).first();

    if (!family) {
      return new Response(JSON.stringify({ error: 'No family found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      ...family,
      members: JSON.parse(family.members as string),
      children: JSON.parse(family.children as string),
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Get family error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get family' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 