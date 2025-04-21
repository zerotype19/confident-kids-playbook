import { Env } from '../../types';
import { corsHeaders } from '../../lib/cors';

interface ThemeWeek {
  id: string;
  week_number: number;
  pillar_id: number;
  title: string;
  description: string;
  pillar_name: string;
  pillar_icon: string;
  pillar_color: string;
}

export async function theme(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405, headers: { ...corsHeaders() } });
  }

  try {
    const db = env.DB;

    // Get current week's theme
    const query = `
      SELECT 
        tw.*,
        p.name as pillar_name,
        p.icon as pillar_icon,
        p.color as pillar_color
      FROM theme_weeks tw
      JOIN pillars p ON tw.pillar_id = p.id
      WHERE tw.week_number = CAST(strftime('%W', 'now') AS INTEGER) + 1
    `;

    const result = await db.prepare(query).first<ThemeWeek>();

    if (!result) {
      return new Response(
        JSON.stringify({ error: 'No theme found for current week' }),
        { status: 404, headers: { ...corsHeaders() } }
      );
    }

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error fetching theme:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch theme' }),
      { status: 500, headers: { ...corsHeaders() } }
    );
  }
} 