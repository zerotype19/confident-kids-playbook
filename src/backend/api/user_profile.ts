import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';

interface FamilyMember {
  family_id: string;
}

interface Child {
  id: string;
  name: string;
  birthdate: string;
  gender: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  has_completed_onboarding: boolean;
  selected_child_id: string | null;
}

interface DBResult<T> {
  results: T[];
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  console.log('🚀 User profile endpoint called:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries())
  });

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

  try {
    const token = authorization.split(' ')[1];
    if (!token) {
      return new Response(JSON.stringify({ error: 'Invalid token format' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    const payload = await verifyJWT(token, env);
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    console.log('✅ JWT verification result:', {
      hasPayload: !!payload,
      hasSub: !!payload?.sub,
      sub: payload?.sub,
      name: payload?.name,
      email: payload?.email
    });

    // Get user data from database
    const userResult = await env.DB.prepare(`
      SELECT id, email, name, has_completed_onboarding, selected_child_id
      FROM users
      WHERE id = ?
    `).bind(payload.sub).first<User>();

    if (!userResult) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get family data if exists
    const familyResult = await env.DB.prepare(`
      SELECT f.id, f.name
      FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = ?
    `).bind(payload.sub).first();

    // Get children if family exists
    let children: Child[] = [];
    if (familyResult) {
      const childrenResult = await env.DB.prepare(`
        SELECT id, name, birthdate, gender
        FROM children
        WHERE family_id = ?
      `).bind(familyResult.id).all<Child>() as DBResult<Child>;
      children = childrenResult.results || [];
    }

    // Return user data with family and children
    return new Response(JSON.stringify({
      userId: userResult.id,
      email: userResult.email,
      name: userResult.name,
      hasCompletedOnboarding: userResult.has_completed_onboarding,
      hasFamily: !!familyResult,
      hasChild: children.length > 0,
      selectedChildId: userResult.selected_child_id,
      family: familyResult ? {
        id: familyResult.id,
        name: familyResult.name
      } : null,
      children: children.map(child => ({
        id: child.id,
        name: child.name,
        birthdate: child.birthdate,
        gender: child.gender
      }))
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('❌ User profile check failed:', error);
    if (error instanceof Error) {
      console.error('Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 