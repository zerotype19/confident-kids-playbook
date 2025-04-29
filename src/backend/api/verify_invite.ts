import { Env } from '../types';
import { corsHeaders } from '../lib/cors';
import { D1Database } from '@cloudflare/workers-types';

interface InviteRequest {
  invite_code: string;
}

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  try {
    const db = env.DB as D1Database;

    // Parse request body
    const body = await request.json() as InviteRequest;
    console.log('Request body:', body);
    const { invite_code } = body;
    console.log('Invite code:', invite_code);

    if (!invite_code) {
      return new Response(
        JSON.stringify({ error: 'Missing invite code' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        }
      );
    }

    // Check if invite exists and is valid
    const invite = await db
      .prepare('SELECT * FROM family_invites WHERE id = ?')
      .bind(invite_code)
      .first<{ id: string; family_id: string; role: string; expires_at: string }>();
    console.log('Found invite:', invite);

    if (invite) {
      console.log('✅ Valid invite found:', {
        invite_code: body.invite_code,
        family_id: invite.family_id,
        role: invite.role
      });

      return new Response(JSON.stringify({
        valid: true,
        family_id: invite.family_id,
        role: invite.role
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid invite code' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() }
        }
      );
    }
  } catch (err: any) {
    console.error('Error verifying invite:', err);
    console.error('Error details:', {
      name: err?.name,
      message: err?.message,
      stack: err?.stack
    });
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders() }
      }
    );
  }
}; 