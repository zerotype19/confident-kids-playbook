import { Env } from '../types';
import { corsHeaders } from '../lib/cors';
import { D1Database } from '@cloudflare/workers-types';

interface InviteRequest {
  invite_code: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  try {
    const { request, env } = context;
    const db = env.DB as D1Database;

    // Handle CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(),
      });
    }

    // Parse request body
    const body = await request.json() as InviteRequest;
    const { invite_code } = body;

    if (!invite_code) {
      return new Response(
        JSON.stringify({ error: 'Missing invite code' }),
        {
          status: 400,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if invite exists and is valid
    const invite = await db
      .prepare('SELECT * FROM family_invites WHERE code = ?')
      .bind(invite_code)
      .first<{ expires_at: string }>();

    if (!invite) {
      return new Response(
        JSON.stringify({ error: 'Invalid invite code' }),
        {
          status: 404,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Check if invite is expired
    const now = new Date();
    const expiresAt = new Date(invite.expires_at);
    if (now > expiresAt) {
      return new Response(
        JSON.stringify({ error: 'Invite code has expired' }),
        {
          status: 400,
          headers: {
            ...corsHeaders(),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: 'Invite code is valid' }),
      {
        status: 200,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    console.error('Error verifying invite:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/json',
        },
      }
    );
  }
} 