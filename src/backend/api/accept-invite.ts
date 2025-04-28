import { Env } from '../types';
import { verifyJWT } from '../auth';
import { corsHeaders, handleOptions } from '../lib/cors';

interface AcceptInviteRequest {
  code: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const authorization = request.headers.get('Authorization');
  if (!authorization) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: corsHeaders()
    });
  }

  try {
    const token = authorization.split(' ')[1];
    const payload = await verifyJWT(token, env);
    if (!payload?.sub) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: corsHeaders()
      });
    }

    const { code } = await request.json() as AcceptInviteRequest;
    if (!code) {
      return new Response(JSON.stringify({ error: 'No invite code provided' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Look up invite
    const invite = await env.DB.prepare(`
      SELECT * FROM family_invites WHERE id = ?
    `).bind(code).first();
    if (!invite) {
      return new Response(JSON.stringify({ error: 'Invalid invite code' }), {
        status: 404,
        headers: corsHeaders()
      });
    }
    if (invite.expires_at && new Date(invite.expires_at.toString()) < new Date()) {
      return new Response(JSON.stringify({ error: 'Invite expired' }), {
        status: 410,
        headers: corsHeaders()
      });
    }

    // Add user to family
    await env.DB.prepare(`
      INSERT OR IGNORE INTO family_members (family_id, user_id, email, role, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).bind(invite.family_id, payload.sub, payload.email, invite.role).run();

    // Mark invite as used (delete or update)
    await env.DB.prepare(`
      DELETE FROM family_invites WHERE id = ?
    `).bind(code).run();

    return new Response(JSON.stringify({ success: true }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('❌ Failed to accept invite:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: corsHeaders()
    });
  }
}; 