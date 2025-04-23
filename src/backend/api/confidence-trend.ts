import { Env } from '../types';
import { getConfidenceSummary } from '../../frontend/src/utils/confidenceTrend';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const childId = url.searchParams.get('childId');

  if (!childId) {
    return new Response('Child ID is required', { status: 400 });
  }

  try {
    const db = env.DB;
    const result = await db.prepare(
      `SELECT DATE(timestamp) as date, feeling
       FROM challenge_reflections
       WHERE child_id = ?
       ORDER BY timestamp DESC
       LIMIT 7`
    ).bind(childId).all();

    const data = result.results;
    const summary = getConfidenceSummary(data);

    return new Response(JSON.stringify({ data, summary }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error fetching confidence trend:', error);
    return new Response('Failed to fetch confidence trend', { status: 500 });
  }
} 