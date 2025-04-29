import { Env, FamilyJoinRequest } from '../types';
import jwt from 'jsonwebtoken';
import { corsHeaders } from '../lib/cors';

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
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
    `).bind(invite_code).first();
    console.log('Found invite:', invite);

    if (!invite) {
      return new Response(JSON.stringify({ error: 'Invalid or expired invite' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Check if user is already a member
    const existingMember = await env.DB.prepare(`
      SELECT * FROM family_members
      WHERE family_id = ? AND user_id = ?
    `).bind(invite.family_id, decoded.sub).first();
    console.log('Existing member:', existingMember);

    if (existingMember) {
      return new Response(JSON.stringify({ error: 'Already a member' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() },
      });
    }

    // Add user to family
    const memberId = crypto.randomUUID();
    console.log('New member details:', {
      memberId,
      familyId: invite.family_id,
      userId: decoded.sub,
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
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      memberId,
      invite.family_id,
      decoded.sub,
      invite.role
    ).run();

    // Delete invite
    await env.DB.prepare('DELETE FROM family_invites WHERE id = ?')
      .bind(invite_code).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (error) {
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