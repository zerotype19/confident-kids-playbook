import { Context } from 'hono';
import { Env, Child, FamilyMember } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';
import { calculateAgeRange } from '../utils/ageUtils';

interface UpdateChildRequest {
  name: string;
  birthdate: string;
  gender: string;
  avatar_url?: string;
}

export async function onRequest(context: { request: Request; env: Env; id?: string }) {
  const { request, env, id } = context;
  console.log('🚀 Children update endpoint called:', {
    method: request.method,
    url: request.url,
    id,
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

  if (request.method !== 'PUT') {
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

    if (!id) {
      return new Response(JSON.stringify({ error: 'Child ID is required' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Get user's family
    const familyMember = await env.DB.prepare(`
      SELECT family_id FROM family_members 
      WHERE user_id = ? 
      LIMIT 1
    `).bind(payload.sub).first<FamilyMember>();

    if (!familyMember) {
      return new Response(JSON.stringify({ error: 'No family found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    // Verify the child belongs to the user's family
    const childCheck = await env.DB.prepare(`
      SELECT * FROM children 
      WHERE id = ? AND family_id = ?
    `).bind(id, familyMember.family_id).first<Child>();

    if (!childCheck) {
      return new Response(JSON.stringify({ error: 'Child not found or access denied' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    const body = await request.json() as UpdateChildRequest;
    
    // Validate required fields
    if (!body.name || !body.birthdate || !body.gender) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields',
        details: {
          name: !body.name ? 'Name is required' : null,
          birthdate: !body.birthdate ? 'Birthdate is required' : null,
          gender: !body.gender ? 'Gender is required' : null
        }
      }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Calculate age range from birthdate
    const ageRange = calculateAgeRange(new Date(body.birthdate));
    if (!ageRange) {
      return new Response(JSON.stringify({ 
        error: 'Child must be between ages 3 and 13',
        details: 'Please provide a valid birthdate for a child aged 3-13'
      }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    console.log('👶 Updating child with:', {
      childId: id,
      name: body.name,
      birthdate: body.birthdate,
      ageRange,
      gender: body.gender,
      familyId: familyMember.family_id,
      hasAvatar: !!body.avatar_url
    });

    // Update child profile
    const updateChildResult = await env.DB.prepare(`
      UPDATE children 
      SET name = ?, birthdate = ?, gender = ?, avatar_url = ?, age_range = ?
      WHERE id = ? AND family_id = ?
    `).bind(
      body.name,
      body.birthdate,
      body.gender,
      body.avatar_url || null,
      ageRange,
      id,
      familyMember.family_id
    ).run();

    if (!updateChildResult.success) {
      throw new Error('Failed to update child profile');
    }

    console.log('✅ Child updated successfully:', {
      childId: id,
      familyId: familyMember.family_id
    });

    return new Response(JSON.stringify({
      success: true,
      childId: id
    }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('❌ Failed to update child profile:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 