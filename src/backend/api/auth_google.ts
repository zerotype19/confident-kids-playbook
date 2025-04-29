import { corsHeaders, handleOptions } from '../lib/cors'
import { verifyGoogleTokenAndCreateJwt } from '../lib/googleAuth'
import { OAuth2Client } from 'google-auth-library'

interface Env {
  JWT_SECRET: string
  GOOGLE_CLIENT_ID: string
  DB: D1Database
  APPLE_CLIENT_ID: string
}

interface GoogleAuthRequest {
  credential: string
}

export async function authGoogle(context: { request: Request; env: Env }) {
  const { request, env } = context;
  console.log('🚀 Google auth endpoint called:', {
    method: request.method,
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    hasEnv: !!env,
    hasJwtSecret: !!env.JWT_SECRET,
    hasGoogleClientId: !!env.GOOGLE_CLIENT_ID,
    hasDB: !!env.DB,
    hasAppleClientId: !!env.APPLE_CLIENT_ID
  });

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    console.log('🔄 Handling CORS preflight request');
    return handleOptions(request);
  }

  try {
    const body = await request.json() as GoogleAuthRequest;
    console.log('✅ Received Google credential:', {
      hasCredential: !!body.credential,
      credentialLength: body.credential?.length
    });

    if (!body.credential) {
      console.error('❌ No credential provided');
      return new Response(JSON.stringify({ error: 'No credential provided' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    console.log('🔗 Using API URL:', request.url);
    const result = await verifyGoogleTokenAndCreateJwt(body.credential, env.JWT_SECRET, env.GOOGLE_CLIENT_ID);

    if (!result.success) {
      console.error('❌ Token verification failed:', result.error);
      return new Response(JSON.stringify({ error: result.error }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    console.log('✅ API Response:', {
      status: 'ok',
      hasJWT: !!result.jwt,
      user: {
        id: result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).sub : undefined,
        email: result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).email : undefined,
        name: result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).name : undefined,
        picture: result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).picture : undefined
      }
    });

    const user_id = result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).sub : undefined;
    const email = result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).email : undefined;
    const name = result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).name : undefined;
    const picture = result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).picture : undefined;

    // First check if user exists by ID
    let user = await env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(user_id).first();

    if (!user) {
      // Then check if user exists by email
      user = await env.DB.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).bind(email).first();

      if (user) {
        // Update existing user with Google ID and info
        await env.DB.prepare(`
          UPDATE users 
          SET id = ?, 
              name = ?,
              auth_provider = 'google',
              updated_at = CURRENT_TIMESTAMP
          WHERE email = ?
        `).bind(user_id, name, email).run();
      } else {
        // Create new user
        await env.DB.prepare(`
          INSERT INTO users (
            id, 
            email, 
            name, 
            auth_provider,
            created_at,
            updated_at,
            has_completed_onboarding,
            selected_child_id
          )
          VALUES (?, ?, ?, 'google', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, NULL)
        `).bind(user_id, email, name).run();
      }
    }

    return new Response(
      JSON.stringify({
        status: 'ok',
        jwt: result.jwt,
        user: {
          id: result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).sub : undefined,
          email: result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).email : undefined,
          name: result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).name : undefined,
          picture: result.jwt ? JSON.parse(atob(result.jwt.split('.')[1])).picture : undefined
        }
      }),
      {
        headers: corsHeaders()
      }
    );
  } catch (error) {
    console.error('❌ Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request' }),
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
} 