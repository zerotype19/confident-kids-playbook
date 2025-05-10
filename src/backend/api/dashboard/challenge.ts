import { Env } from '../../types';
import { corsHeaders, handleOptions } from '../../lib/cors';

interface Challenge {
  id: string;
  title: string;
  pillar_id: string;
  age_range: string;
  challenge_type_id: number;
  difficulty_level: number;
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
  challenge_type: {
    name: string;
    description: string;
  };
}

interface Child {
  age_range: string;
}

interface ChallengeResult {
  id: string;
  title: string;
  pillar_id: string;
  age_range: string;
  challenge_type_id: number;
  difficulty_level: number;
  what_you_practice: string;
  start_prompt: string;
  guide_prompt: string;
  success_signals: string;
  why_it_matters: string;
  challenge_type_name: string;
  challenge_type_description: string;
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

    // 1. Check if the child has already completed a challenge today
    const completedToday = await env.DB.prepare(`
      SELECT 1 FROM challenge_logs
      WHERE child_id = ?
      AND date(datetime(completed_at, '-4 hours', '-30 minutes')) = date(datetime('now', '-4 hours', '-30 minutes'))
      LIMIT 1
    `).bind(childId).first();

    if (completedToday) {
      // Child has already completed a challenge today
      return new Response(JSON.stringify({ completedToday: true }), {
        status: 200,
        headers: corsHeaders()
      });
    }

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
        c.pillar_id,
        c.age_range,
        c.challenge_type_id,
        c.difficulty_level,
        c.what_you_practice,
        c.start_prompt,
        c.guide_prompt,
        c.success_signals,
        c.why_it_matters,
        ct.name as challenge_type_name,
        ct.description as challenge_type_description,
        CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END as is_completed
      FROM challenges c
      LEFT JOIN challenge_logs cl ON c.id = cl.challenge_id 
        AND cl.child_id = ?
      LEFT JOIN challenge_types ct ON c.challenge_type_id = ct.challenge_type_id
        AND c.pillar_id = ct.pillar_id
      WHERE REPLACE(c.age_range, '–', '-') = REPLACE(?, '–', '-')
      AND c.pillar_id = (SELECT pillar_id FROM current_theme)
      AND NOT EXISTS (
        SELECT 1 
        FROM challenge_logs cl 
        WHERE cl.child_id = ? 
        AND cl.challenge_id = c.id 
        AND date(datetime(cl.completed_at, '-4 hours', '-30 minutes')) = date(datetime('now', '-4 hours', '-30 minutes'))
      )
      ORDER BY RANDOM()
      LIMIT 1
    `).bind(childId, child.age_range, childId).first<ChallengeResult>();

    if (!result) {
      console.log('No challenges found for age range:', child.age_range);
      return new Response(JSON.stringify({ error: 'No age-appropriate challenges available for today' }), {
        status: 404,
        headers: corsHeaders()
      });
    }

    console.log('Found challenge:', result.id);

    // Create the challenge object with the new structure
    const challenge: Challenge = {
      id: result.id,
      title: result.title,
      pillar_id: result.pillar_id,
      age_range: result.age_range,
      challenge_type_id: result.challenge_type_id,
      difficulty_level: result.difficulty_level,
      what_you_practice: result.what_you_practice,
      start_prompt: result.start_prompt,
      guide_prompt: result.guide_prompt,
      success_signals: result.success_signals,
      why_it_matters: result.why_it_matters,
      challenge_type: {
        name: result.challenge_type_name,
        description: result.challenge_type_description
      }
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