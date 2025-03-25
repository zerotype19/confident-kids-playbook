import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';

interface User {
  has_completed_onboarding: boolean;
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;
  console.log('🚀 Onboarding status endpoint called:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    hasEnv: !!env,
    hasDB: !!env.DB,
    hasJwtSecret: !!env.JWT_SECRET,
    jwtSecretLength: env.JWT_SECRET?.length
  });

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    console.log('🔄 Handling CORS preflight request');
    return handleOptions(request);
  }

  const authorization = request.headers.get('Authorization');
  console.log('🔑 Authorization header:', {
    present: !!authorization,
    length: authorization?.length,
    prefix: authorization?.substring(0, 20) + '...',
    type: authorization?.split(' ')[0],
    tokenLength: authorization?.split(' ')[1]?.length
  });

  if (!authorization) {
    console.error('❌ No Authorization header found');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders()
    });
  }

  try {
    const token = authorization.split(' ')[1];
    if (!token) {
      console.error('❌ No token found in Authorization header');
      return new Response(JSON.stringify({ error: 'Invalid token format' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    console.log('🔑 Verifying JWT token:', {
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20) + '...',
      hasJwtSecret: !!env.JWT_SECRET,
      jwtSecretLength: env.JWT_SECRET?.length
    });

    let payload;
    try {
      payload = await verifyJWT(token, env);
      console.log('✅ JWT verification successful:', {
        hasPayload: !!payload,
        hasSub: !!payload?.sub,
        hasEmail: !!payload?.email,
        hasName: !!payload?.name,
        hasPicture: !!payload?.picture,
        hasExp: !!payload?.exp,
        exp: payload?.exp,
        isExpired: payload?.exp ? payload.exp < Math.floor(Date.now() / 1000) : true
      });
    } catch (jwtError) {
      console.error('❌ JWT verification failed:', {
        error: jwtError instanceof Error ? {
          name: jwtError.name,
          message: jwtError.message,
          stack: jwtError.stack
        } : jwtError,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 20) + '...',
        hasJwtSecret: !!env.JWT_SECRET,
        jwtSecretLength: env.JWT_SECRET?.length
      });
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    console.log('✅ JWT verification result:', {
      hasPayload: !!payload,
      hasSub: !!payload?.sub,
      sub: payload?.sub
    });
    
    if (!payload?.sub) {
      console.error('❌ Invalid token payload:', payload);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    console.log('📊 Querying database for user:', payload.sub);
    let result;
    try {
      result = await env.DB.prepare(
        'SELECT has_completed_onboarding FROM users WHERE id = ?'
      ).bind(payload.sub).all<User>();
    } catch (dbError) {
      console.error('❌ Database query failed:', dbError);
      return new Response(JSON.stringify({ error: 'Database error' }), {
        status: 500,
        headers: corsHeaders()
      });
    }

    console.log('📥 Database query result:', {
      hasResults: !!result.results,
      resultCount: result.results?.length,
      firstResult: result.results?.[0]
    });

    const user = result.results?.[0];

    if (!user) {
      console.error('❌ User not found:', payload.sub);
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    console.log('✅ Onboarding status retrieved:', user.has_completed_onboarding);
    const response = new Response(JSON.stringify({
      hasCompletedOnboarding: user.has_completed_onboarding || false
    }), {
      headers: corsHeaders()
    });

    console.log('📤 Sending response:', {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries())
    });

    return response;
  } catch (error) {
    console.error('❌ Onboarding status check failed:', error);
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