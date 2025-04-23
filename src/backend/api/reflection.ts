import { nanoid } from 'nanoid';
import { Env } from '../types';
import { corsHeaders } from '../lib/cors';
import { PagesFunction } from '@cloudflare/workers-types';

interface ReflectionRequest {
  childId: string;
  challengeId: string;
  feeling: number;
  reflection: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const { childId, challengeId, feeling, reflection } = await request.json() as ReflectionRequest;

    // Validate feeling is between 1 and 5
    if (feeling < 1 || feeling > 5) {
      return new Response(JSON.stringify({ error: 'Feeling must be between 1 and 5' }), {
        status: 400,
        headers: corsHeaders()
      });
    }

    // Insert the reflection
    await env.DB.prepare(
      `INSERT INTO challenge_reflections (id, child_id, challenge_id, feeling, reflection) 
       VALUES (?, ?, ?, ?, ?)`
    ).bind(nanoid(), childId, challengeId, feeling, reflection).run();

    return new Response(JSON.stringify({ status: 'ok' }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Error saving reflection:', error);
    return new Response(JSON.stringify({ error: 'Failed to save reflection' }), {
      status: 500,
      headers: corsHeaders()
    });
  }
} 