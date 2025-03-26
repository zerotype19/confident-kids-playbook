import { Env } from '../types';
import { verifyJWT } from '../auth';
import { nanoid } from 'nanoid';
import { corsHeaders, handleOptions } from '../lib/cors';

interface CreateFamilyRequest {
  name: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const authorization = request.headers.get('Authorization');

  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders()
    });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: corsHeaders()
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    const body = await request.json() as CreateFamilyRequest;
    const familyId = nanoid();

    // First ensure user exists
    const userResult = await env.DB.prepare(`
      SELECT id FROM users WHERE id = ?
    `).bind(payload.sub).first();

    if (!userResult) {
      // Create user if they don't exist
      const createUserResult = await env.DB.prepare(`
        INSERT INTO users (id, email, name, auth_provider)
        VALUES (?, ?, ?, ?)
      `).bind(payload.sub, payload.email, payload.name, 'google').run();

      if (!createUserResult.success) {
        throw new Error('Failed to create user');
      }
    }

    // Create family
    const createFamilyResult = await env.DB.prepare(`
      INSERT INTO families (id, name)
      VALUES (?, ?)
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
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Failed to create family:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 