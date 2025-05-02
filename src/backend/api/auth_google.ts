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
  family_id?: string
  role?: string
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
      hasInviteCode: !!body.invite_code,
      hasFamilyId: !!body.family_id,
      hasRole: !!body.role
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
      'SELECT id, temp_family_id FROM users WHERE id = ?'
    ).bind(user_id).first<{ id: string; temp_family_id: string | null }>();
    console.log('👤 User lookup by ID result:', { user });

    if (!user) {
      // Then check if user exists by email
      console.log('🔍 User not found by ID, checking by email:', email);
      user = await env.DB.prepare(
        'SELECT id, temp_family_id FROM users WHERE email = ?'
      ).bind(email).first<{ id: string; temp_family_id: string | null }>();
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
          hasInviteCode: !!body.invite_code,
          inviteCode: body.invite_code,
          familyId: body.family_id,
          role: body.role
        });
        try {
          let family_id = null;
          let role = null;

          // If we have an invite code, verify it and get the family_id
          if (body.invite_code) {
            console.log('🔍 Verifying invite code:', body.invite_code);
            const invite = await env.DB.prepare(
              'SELECT family_id, role FROM family_invites WHERE id = ?'
            ).bind(body.invite_code).first<{ family_id: string; role: string }>();

            if (!invite) {
              console.error('❌ Invalid invite code:', body.invite_code);
              throw new Error('Invalid invite code');
            }

            family_id = invite.family_id;
            role = invite.role;
            console.log('✅ Verified invite:', { family_id, role });
          }

          // Start transaction using D1's transaction API
          const stmt = env.DB.prepare(`
            INSERT INTO users (
              id, 
              email, 
              name, 
              auth_provider,
              created_at,
              updated_at,
              has_completed_onboarding,
              temp_family_id
            )
            VALUES (?, ?, ?, 'google', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 0, ?)
          `).bind(user_id, email, name, family_id);

          const result = await stmt.run();
          console.log('✅ User created:', { result });

          // If we have a family_id from the invite, create the family member record
          if (family_id) {
            console.log('➕ Creating family member record:', {
              familyId: family_id,
              userId: user_id,
              role: role
            });

            const familyMemberStmt = env.DB.prepare(`
              INSERT INTO family_members (id, family_id, user_id, role, created_at, updated_at)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).bind(crypto.randomUUID(), family_id, user_id, role);

            const familyMemberResult = await familyMemberStmt.run();
            console.log('✅ Family member created:', { familyMemberResult });

            // Delete the invite
            const deleteInviteStmt = env.DB.prepare(`
              DELETE FROM family_invites WHERE id = ?
            `).bind(body.invite_code);

            const deleteResult = await deleteInviteStmt.run();
            console.log('✅ Invite deleted:', { deleteResult });
          } else {
            // Create a new family for the user
            family_id = crypto.randomUUID();
            console.log('➕ Creating new family:', {
              familyId: family_id,
              userId: user_id
            });

            // Create the family
            const familyStmt = env.DB.prepare(`
              INSERT INTO families (id, name, created_at)
              VALUES (?, ?, CURRENT_TIMESTAMP)
            `).bind(family_id, `${name}'s Family`);

            const familyResult = await familyStmt.run();
            console.log('✅ Family created:', { familyResult });

            // Add user as owner of the family
            const memberStmt = env.DB.prepare(`
              INSERT INTO family_members (id, family_id, user_id, role, created_at, updated_at)
              VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            `).bind(crypto.randomUUID(), family_id, user_id, 'owner');

            const memberResult = await memberStmt.run();
            console.log('✅ Family member created:', { memberResult });
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