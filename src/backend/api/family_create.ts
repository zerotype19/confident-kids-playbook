import { Env } from '../types';
import { verifyJWT } from '../auth';
import { nanoid } from 'nanoid';

interface CreateFamilyRequest {
  name: string;
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

    const body = await request.json() as CreateFamilyRequest;
    const familyId = nanoid();

    // Create family
    const createFamilyResult = await env.DB.prepare(`
      INSERT INTO families (id, name, created_at)
      VALUES (?, ?, datetime('now'))
    `).bind(familyId, body.name).run();

    if (!createFamilyResult.success) {
      throw new Error('Failed to create family');
    }

    // Add user as family owner
    const addMemberResult = await env.DB.prepare(`
      INSERT INTO family_members (id, user_id, family_id, role)
      VALUES (?, ?, ?, 'owner')
    `).bind(nanoid(), payload.sub, familyId).run();

    if (!addMemberResult.success) {
      throw new Error('Failed to add user as family owner');
    }

    return new Response(JSON.stringify({
      success: true,
      familyId
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Failed to create family:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
} 