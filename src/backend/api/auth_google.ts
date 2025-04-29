import { Env } from '../types';
import { corsHeaders, handleOptions } from '../lib/cors';
import { createJWT } from '../jwt';
import { randomUUID } from 'crypto';
import { verifyGoogleTokenAndCreateJwt } from '../lib/googleAuth'
import { OAuth2Client } from 'google-auth-library'
import { D1Database } from '@cloudflare/workers-types'

interface GoogleAuthRequest {
  credential: string
  invite_code?: string
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
      credentialLength: body.credential?.length,
      hasInviteCode: !!body.invite_code
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
    console.log('🔍 Checking if user exists by ID:', user_id);
    let user = await env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(user_id).first<{ id: string }>();
    console.log('👤 User lookup by ID result:', { user });

    if (!user) {
      // Then check if user exists by email
      console.log('🔍 User not found by ID, checking by email:', email);
      user = await env.DB.prepare(
        'SELECT id FROM users WHERE email = ?'
      ).bind(email).first<{ id: string }>();
      console.log('👤 User lookup by email result:', { user });

      if (user) {
        // Update existing user with Google ID and info
        console.log('✏️ Updating existing user:', {
          newId: user_id,
          name,
          email,
          currentUser: user
        });
        try {
          console.log('🔄 Starting user ID update process');
          
          // First update all references to use a temporary value (negative of current ID)
          await env.DB.prepare(`
            UPDATE family_members 
            SET user_id = -user_id
            WHERE user_id = ?
          `).bind(user.id).run();

          await env.DB.prepare(`
            UPDATE subscriptions 
            SET user_id = -user_id
            WHERE user_id = ?
          `).bind(user.id).run();

          // Then update the user's ID to the Google ID
          await env.DB.prepare(`
            UPDATE users 
            SET id = ?,
                name = ?,
                auth_provider = 'google',
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `).bind(user_id, name, user.id).run();

          // Finally update references to use the new Google ID
          await env.DB.prepare(`
            UPDATE family_members 
            SET user_id = ?
            WHERE user_id = ?
          `).bind(user_id, -user.id).run();

          await env.DB.prepare(`
            UPDATE subscriptions 
            SET user_id = ?
            WHERE user_id = ?
          `).bind(user_id, -user.id).run();

          console.log('✅ User ID update completed successfully');
        } catch (error: any) {
          console.error('❌ Error updating user:', {
            error,
            errorMessage: error.message,
            cause: error.cause
          });
          throw error;
        }
      } else {
        // Create new user
        console.log('➕ Creating new user:', {
          id: user_id,
          email,
          name,
          hasInviteCode: !!body.invite_code
        });
        try {
          // Start transaction using D1's transaction API
          await env.DB.prepare(`
            INSERT INTO users (
              id, 
              email, 
              name, 
              auth_provider,
              created_at,
              updated_at,
              has_completed_onboarding
            )
            VALUES (?, ?, ?, 'google', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
          `).bind(user_id, email, name).run();

          // If invite code exists, add them to the family immediately
          if (body.invite_code) {
            // Check if invite code exists and is valid
            const inviteResult = await env.DB.prepare(
              'SELECT family_id, role FROM family_invites WHERE id = ? AND expires_at > datetime(\'now\')'
            ).bind(body.invite_code).first<{ family_id: string; role: string }>();

            if (inviteResult) {
              const { family_id, role } = inviteResult;

              // Add user as member of the family with the role from the invite
              await env.DB.prepare(
                'INSERT INTO family_members (id, user_id, family_id, role) VALUES (?, ?, ?, ?)'
              ).bind(randomUUID(), user_id, family_id, role).run();

              // Delete the used invite
              await env.DB.prepare(
                'DELETE FROM family_invites WHERE id = ?'
              ).bind(body.invite_code).run();
            }
          }

          console.log('✅ New user and family member created successfully');
        } catch (error: any) {
          console.error('❌ Error creating user:', {
            error,
            errorMessage: error.message,
            cause: error.cause
          });
          throw error;
        }
      }
    }

    // Generate JWT token
    const token = await createJWT({ 
      sub: user_id,
      email: email,
      name: name,
      picture: picture,
      has_completed_onboarding: body.invite_code ? 1 : 0
    }, env.JWT_SECRET);

    return new Response(
      JSON.stringify({
        status: 'ok',
        jwt: token,
        user: {
          id: user_id,
          email: email,
          name: name,
          picture: picture,
          has_completed_onboarding: body.invite_code ? 1 : 0
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