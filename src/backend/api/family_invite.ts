import { Env, FamilyInviteRequest } from '../types';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

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
    const { email, role } = await request.json() as FamilyInviteRequest;

    // Get user's family
    const family = await env.DB.prepare(`
      SELECT f.* 
      FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = ? AND fm.role = 'owner'
    `).bind(decoded.user_id).first();

    if (!family) {
      return new Response(JSON.stringify({ error: 'No family found or not owner' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate invite code
    const invite_code = randomBytes(16).toString('hex');

    // Store invite
    await env.DB.prepare(`
      INSERT INTO family_invites (
        id,
        family_id,
        email,
        role,
        created_at,
        expires_at
      ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+7 days'))
    `).bind(invite_code, family.id, email, role).run();

    // TODO: Send email with invite link
    const invite_link = `${env.FRONTEND_URL}/join?code=${invite_code}`;

    return new Response(JSON.stringify({ invite_link }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Create invite error:', error);
    return new Response(JSON.stringify({ error: 'Failed to create invite' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 