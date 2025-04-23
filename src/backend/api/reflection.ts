import { nanoid } from 'nanoid';
import { jsonResponse } from '../_utils/json';
import { getDB } from '../_utils/db';

interface ReflectionRequest {
  childId: string;
  challengeId: string;
  feeling: number;
  reflection: string;
}

export async function onRequestPost(context) {
  try {
    const db = getDB();
    const { childId, challengeId, feeling, reflection } = await context.request.json() as ReflectionRequest;

    // Validate feeling is between 1 and 5
    if (feeling < 1 || feeling > 5) {
      return jsonResponse({ error: 'Feeling must be between 1 and 5' }, 400);
    }

    // Insert the reflection
    await db.prepare(
      `INSERT INTO challenge_reflections (id, child_id, challenge_id, feeling, reflection) 
       VALUES (?, ?, ?, ?, ?)`
    ).bind(nanoid(), childId, challengeId, feeling, reflection).run();

    return jsonResponse({ status: 'ok' });
  } catch (error) {
    console.error('Error saving reflection:', error);
    return jsonResponse({ error: 'Failed to save reflection' }, 500);
  }
} 