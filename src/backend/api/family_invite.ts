import { Env, FamilyInviteRequest } from '../types';
import { randomBytes } from 'node:crypto';
import { corsHeaders, handleOptions } from '../lib/cors';
import { verifyJWT } from '../auth';

interface Family {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

async function sendInviteEmail(env: Env, email: string, inviteLink: string, familyName: string) {
  if (env.EMAIL_SERVICE !== 'sendgrid') {
    console.warn('Email service not configured or not supported');
    return;
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email }],
        dynamic_template_data: {
          inviteLink,
          familyName,
        },
      }],
      from: { email: env.FROM_EMAIL },
      template_id: 'd-069b1bc2a34e46478a0eb996330b947e',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to send email:', error);
    throw new Error('Failed to send invitation email');
  }
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
    const payload = await verifyJWT(token, env);
    
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email, role = 'member' } = await request.json() as FamilyInviteRequest;

    // Get user's family
    const family = await env.DB.prepare(`
      SELECT f.id, f.name
      FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = ? AND fm.role = 'owner'
    `).bind(payload.sub).first<Family>();

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

    // Send email with invite link
    const inviteLink = `${env.FRONTEND_URL}/join-family?code=${inviteCode}`;
    await sendInviteEmail(env, email, inviteLink, family.name);

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