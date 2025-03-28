import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';

interface FamilyMember {
  family_id: string;
}

interface Child {
  id: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  has_completed_onboarding: boolean;
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

    // Get user data including onboarding status
    const userResult = await env.DB.prepare(`
      SELECT id, email, name, has_completed_onboarding
      FROM users
      WHERE id = ?
    `).bind(payload.sub).first<User>();

    if (!userResult) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Check if user has a family
    const familyResult = await env.DB.prepare(`
      SELECT family_id 
      FROM family_members 
      WHERE user_id = ?
    `).bind(payload.sub).all<FamilyMember>() as DBResult<FamilyMember>;

    const hasFamily = familyResult.results.length > 0;
    const familyId = hasFamily ? familyResult.results[0].family_id : null;

    // If user has a family, check for children
    let hasChild = false;
    if (familyId) {
      const childrenResult = await env.DB.prepare(`
        SELECT id 
        FROM children 
        WHERE family_id = ?
        LIMIT 1
      `).bind(familyId).all<Child>() as DBResult<Child>;

      hasChild = childrenResult.results.length > 0;
    }

    return new Response(JSON.stringify({
      userId: payload.sub,
      email: userResult.email,
      name: userResult.name,
      hasFamily,
      hasChild,
      hasCompletedOnboarding: Boolean(userResult.has_completed_onboarding)
    }), {
      headers: corsHeaders()
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