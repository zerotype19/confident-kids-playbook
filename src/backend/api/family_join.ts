import { Env, FamilyJoinRequest } from '../types';
import { corsHeaders } from '../lib/cors';

interface UserRecord {
  id: string;
  email: string;
  has_completed_onboarding: number;
  created_at: string;
  updated_at: string;
}

interface InviteRecord {
  id: string;
  family_id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    const { invite_code } = body as FamilyJoinRequest;
    console.log('Invite code:', invite_code);

    if (!invite_code) {
      return new Response(JSON.stringify({ error: 'Missing invite code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Get invite
    const invite = await env.DB.prepare(`
      SELECT * FROM family_invites
      WHERE id = ? AND expires_at > datetime('now')
    `).bind(invite_code).first() as InviteRecord | null;
    console.log('Found invite:', invite);

    if (!invite) {
      return new Response(JSON.stringify({ error: 'Invalid or expired invite' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Check if user with this email already exists
    const existingUser = await env.DB.prepare(`
      SELECT * FROM users WHERE email = ?
    `).bind(invite.email).first() as UserRecord | null;
    console.log('Existing user:', existingUser);

    let userId: string;

    if (!existingUser) {
      // Create new user with the invited email
      userId = crypto.randomUUID();
      await env.DB.prepare(`
        INSERT INTO users (
          id,
          email,
          has_completed_onboarding,
          created_at,
          updated_at
        ) VALUES (?, ?, 1, datetime('now'), COALESCE(datetime('now'), NULL))
      `).bind(
        userId,
        invite.email
      ).run();
      console.log('Created new user with ID:', userId);
    } else {
      userId = existingUser.id;
      // Update existing user's onboarding status
      await env.DB.prepare(`
        UPDATE users 
        SET has_completed_onboarding = 1,
            updated_at = COALESCE(datetime('now'), NULL)
        WHERE id = ?
      `).bind(userId).run();
      console.log('Updated existing user:', userId);
    }

    // Check if user is already a member
    const existingMember = await env.DB.prepare(`
      SELECT * FROM family_members
      WHERE family_id = ? AND user_id = ?
    `).bind(invite.family_id, userId).first();
    console.log('Existing member:', existingMember);

    if (existingMember) {
      return new Response(JSON.stringify({ 
        success: true,
        message: 'Already a member of this family'
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Add user to family using the invite's family_id
    const memberId = crypto.randomUUID();
    console.log('New member details:', {
      memberId,
      familyId: invite.family_id,
      userId: userId,
      role: invite.role
    });

    await env.DB.prepare(`
      INSERT INTO family_members (
        id,
        family_id,
        user_id,
        role,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, COALESCE(datetime('now'), NULL), COALESCE(datetime('now'), NULL))
    `).bind(
      memberId,
      invite.family_id,
      userId,
      invite.role
    ).run();

    // Delete invite
    await env.DB.prepare('DELETE FROM family_invites WHERE id = ?')
      .bind(invite_code).run();

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Successfully joined family'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (error: any) {
    console.error('Join family error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return new Response(JSON.stringify({ error: 'Failed to join family' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }
};