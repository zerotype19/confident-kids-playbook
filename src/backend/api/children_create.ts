import { Env } from '../types';
import { verifyJWT } from '../auth';
import { nanoid } from 'nanoid';

interface CreateChildRequest {
  name: string;
  age_range: string;
  avatar_url?: string;
}

interface FamilyMemberResult {
  family_id: string;
}

export async function onRequest(context: any) {
  const { request, env } = context;
  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, env as Env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user's family
    const familyMember = await env.DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? 
      LIMIT 1
    `).bind(payload.sub).first() as FamilyMemberResult | null;

    if (!familyMember) {
      return new Response(JSON.stringify({ error: 'No family found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const body = await request.json() as CreateChildRequest;
    const childId = nanoid();

    // Create child profile
    const createChildResult = await env.DB.prepare(`
      INSERT INTO children (id, family_id, name, age_range, avatar_url, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      childId,
      familyMember.family_id,
      body.name,
      body.age_range,
      body.avatar_url || null
    ).run();

    if (!createChildResult.success) {
      throw new Error('Failed to create child profile');
    }

    return new Response(JSON.stringify({
      success: true,
      childId
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to create child profile:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 