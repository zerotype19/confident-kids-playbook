import { Env } from '../../types';
import { corsHeaders, handleOptions } from '../../lib/cors';

interface Challenge {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string[];
  example_dialogue: string;
  tip: string;
  pillar_id: string;
  age_range: string;
  difficulty_level: number;
}

interface Child {
  age_range: string;
}

interface ChallengeResult {
  id: string;
  title: string;
  description: string;
  goal: string;
  steps: string;
  example_dialogue: string;
  tip: string;
  pillar_id: string;
  age_range: string;
  difficulty_level: number;
}

export async function challenge({ request, env }: { request: Request; env: Env }) {
  const url = new URL(request.url);
  const childId = url.searchParams.get('childId');

  if (!childId) {
    return new Response(JSON.stringify({ error: 'Child ID is required' }), {
      status: 400,
      headers: corsHeaders()
    });
  }

  try {
    console.log('Fetching child with ID:', childId);
    // First, get the child's age range
    const child = await env.DB.prepare(`
      SELECT age_range 
      FROM children 
      WHERE id = ?
    `).bind(childId).first<Child>();

    if (!child) {
      console.log('Child not found:', childId);
      return new Response(JSON.stringify({ error: 'Child not found' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    console.log('Found child with age range:', child.age_range);

    // Get a random age-appropriate challenge that hasn't been completed today
    const result = await env.DB.prepare(`
      WITH current_theme AS (
        SELECT pillar_id 
        FROM theme_weeks 
        WHERE week_number = CAST(strftime('%W', 'now') AS INTEGER) + 1
      )
      SELECT 
        c.id,
        c.title,
        c.description,
        c.goal,
        c.steps,
        c.example_dialogue,
        c.tip,
        c.pillar_id,
        c.age_range,
        c.difficulty_level,
        CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END as is_completed
      FROM challenges c
      LEFT JOIN challenge_logs cl ON c.id = cl.challenge_id 
        AND cl.child_id = ?
      WHERE REPLACE(c.age_range, '–', '-') = REPLACE(?, '–', '-')
      AND c.pillar_id = (SELECT pillar_id FROM current_theme)
      AND NOT EXISTS (
        SELECT 1 
        FROM challenge_logs cl 
        WHERE cl.child_id = ? 
        AND cl.challenge_id = c.id 
        AND date(cl.completed_at) = date('now')
      )
      ORDER BY RANDOM()
      LIMIT 1
    `).bind(child.age_range, childId).first<ChallengeResult>();

    if (!result) {
      console.log('No challenges found for age range:', child.age_range);
      return new Response(JSON.stringify({ error: 'No age-appropriate challenges available for today' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    console.log('Found challenge:', result.id);

    // Parse the steps JSON array
    const challenge: Challenge = {
      id: result.id,
      title: result.title,
      description: result.description,
      goal: result.goal,
      steps: JSON.parse(result.steps),
      example_dialogue: result.example_dialogue,
      tip: result.tip,
      pillar_id: result.pillar_id,
      age_range: result.age_range,
      difficulty_level: result.difficulty_level
    };

    return new Response(JSON.stringify({ challenge }), {
      headers: corsHeaders()
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch challenge' }),
      {
        status: 500,
        headers: corsHeaders()
      }
    );
  }
} 