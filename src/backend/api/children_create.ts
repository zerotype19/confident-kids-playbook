import { Env } from '../types';
import { verifyJWT } from '../auth';
import { nanoid } from 'nanoid';
import { corsHeaders, handleOptions } from '../lib/cors';

interface CreateChildRequest {
  name: string;
  age_range: string;
  avatar_url?: string;
}

interface FamilyMemberResult {
  family_id: string;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  console.log('🚀 Children create endpoint called:', {
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

    console.log('🔑 JWT verification successful:', {
      userId: payload.sub,
      email: payload.email
    });

    // Get user's family
    const familyMember = await env.DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? 
      LIMIT 1
    `).bind(payload.sub).first() as FamilyMemberResult | null;

    console.log('👨‍👩‍👧‍👦 Family lookup result:', {
      hasFamily: !!familyMember,
      familyId: familyMember?.family_id
    });

    if (!familyMember) {
      return new Response(JSON.stringify({ error: 'No family found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    const body = await request.json() as CreateChildRequest;
    
    // Validate required fields
    if (!body.name) {
      return new Response(JSON.stringify({ error: 'Name is required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    if (!body.age_range) {
      return new Response(JSON.stringify({ error: 'Age range is required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    const childId = nanoid();

    console.log('👶 Creating child with:', {
      childId,
      name: body.name,
      ageRange: body.age_range,
      familyId: familyMember.family_id,
      hasAvatar: !!body.avatar_url
    });

    // Create child profile
    const createChildResult = await env.DB.prepare(`
      INSERT INTO children (id, family_id, name, age_range, avatar_url)
      VALUES (?, ?, ?, ?, ?)
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

    console.log('✅ Child created successfully:', {
      childId,
      familyId: familyMember.family_id
    });

    return new Response(JSON.stringify({
      success: true,
      childId
    }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('❌ Failed to create child profile:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 