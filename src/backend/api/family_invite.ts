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

async function sendInviteEmail(env: Env, email: string, inviteLink: string, familyName: string) {
  const response = await fetch('https://api.cloudflare.com/client/v4/accounts/315111a87fcb293ac0efd819b6e59147/email/routing/rules', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: 'Family Invite',
      enabled: true,
      matchers: [{
        type: 'literal',
        field: 'to',
        value: email,
      }],
      actions: [{
        type: 'forward',
        value: [email],
      }],
      priority: 0,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Failed to send email:', error);
    throw new Error('Failed to send invitation email');
  }

  // Send the actual email
  const emailResponse = await fetch('https://api.cloudflare.com/client/v4/accounts/315111a87fcb293ac0efd819b6e59147/email/routing/rules/email', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.CLOUDFLARE_API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.FROM_EMAIL,
      to: email,
      subject: `Join ${familyName}'s Family on Kidoova`,
      text: `You've been invited to join ${familyName}'s family on Kidoova! Click the link below to accept the invitation:\n\n${inviteLink}\n\nThis invitation will expire in 7 days.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Join ${familyName}'s Family on Kidoova</h2>
          <p>You've been invited to join ${familyName}'s family on Kidoova!</p>
          <p>Click the button below to accept the invitation:</p>
          <a href="${inviteLink}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">Accept Invitation</a>
          <p style="color: #666; font-size: 14px;">This invitation will expire in 7 days.</p>
        </div>
      `,
    }),
  });

  if (!emailResponse.ok) {
    const error = await emailResponse.text();
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
    const decoded = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const { email, role = 'member' } = await request.json() as FamilyInviteRequest;

    // Get user's family
    const family = await env.DB.prepare(`
      SELECT f.id, f.name
      FROM families f
      JOIN family_members fm ON f.id = fm.family_id
      WHERE fm.user_id = ? AND fm.role = 'owner'
    `).bind(decoded.sub).first<Family>();

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