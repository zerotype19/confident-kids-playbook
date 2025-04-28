import { Env, FamilyJoinRequest } from '../types';
import { Context } from 'hono';
import jwt from 'jsonwebtoken';

export const onRequestPost = async (c: Context<{ Bindings: Env }>) => {
  const { env } = c;
  const authHeader = c.req.header('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET) as { user_id: string };
    const { invite_code } = await c.req.json() as FamilyJoinRequest;

    // Get invite
    const invite = await env.DB.prepare(`
      SELECT * FROM family_invites
      WHERE code = ? AND expires_at > datetime('now')
    `).bind(invite_code).first();

    if (!invite) {
      return c.json({ error: 'Invalid or expired invite' }, 400);
    }

    // Check if user is already a member
    const existingMember = await env.DB.prepare(`
      SELECT * FROM family_members
      WHERE family_id = ? AND user_id = ?
    `).bind(invite.family_id, decoded.user_id).first();

    if (existingMember) {
      return c.json({ error: 'Already a member' }, 400);
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
    await env.DB.prepare('DELETE FROM family_invites WHERE code = ?')
      .bind(invite_code).run();

    return c.json({ success: true });
  } catch (error) {
    console.error('Join family error:', error);
    return c.json({ error: 'Failed to join family' }, 500);
  }
} 