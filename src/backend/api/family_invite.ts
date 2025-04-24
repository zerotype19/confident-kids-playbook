import { Env, FamilyInviteRequest } from '../types';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { corsHeaders, handleOptions } from '../lib/cors';

interface Family {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

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
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const { email, role = 'member' } = await request.json() as FamilyInviteRequest;

    // Get user's family
    const family = await env.DB.prepare(`
      SELECT f.id, f.name
      FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = ? AND fm.role = 'owner'
    `).bind(decoded.sub).first();

    if (!family) {
      return new Response(JSON.stringify({ error: 'No family found or not authorized' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate invite code
    const inviteCode = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    // Create invite
    await env.DB.prepare(`
      INSERT INTO family_invites (
        id,
        family_id,
        email,
        role,
        created_at,
        expires_at
      ) VALUES (?, ?, ?, ?, datetime('now'), ?)
    `).bind(
      inviteCode,
      family.id,
      email,
      role,
      expiresAt.toISOString()
    ).run();

    // TODO: Send email with invite link
    const inviteLink = `${env.FRONTEND_URL}/join-family?code=${inviteCode}`;

    return new Response(JSON.stringify({
      success: true,
      inviteLink
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Failed to create family invite:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}; 