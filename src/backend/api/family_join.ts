import { Env, FamilyJoinRequest } from '../types';
import jwt from 'jsonwebtoken';

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { user_id: string };
    const { invite_code } = await request.json() as FamilyJoinRequest;

    // Get invite
    const invite = await env.DB.prepare(`
      SELECT * FROM family_invites
      WHERE id = ? AND expires_at > datetime('now')
    `).bind(invite_code).first();

    if (!invite) {
      return new Response(JSON.stringify({ error: 'Invalid or expired invite' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if user is already a member
    const existingMember = await env.DB.prepare(`
      SELECT * FROM family_members
      WHERE family_id = ? AND user_id = ?
    `).bind(invite.family_id, decoded.user_id).first();

    if (existingMember) {
      return new Response(JSON.stringify({ error: 'Already a member' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Add user to family
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
      crypto.randomUUID(),
      invite.family_id,
      decoded.user_id,
      invite.role
    ).run();

    // Delete invite
    await env.DB.prepare('DELETE FROM family_invites WHERE id = ?')
      .bind(invite_code).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Join family error:', error);
    return new Response(JSON.stringify({ error: 'Failed to join family' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 