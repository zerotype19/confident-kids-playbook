import { Env } from '../types';
import { corsHeaders } from '../lib/cors';

export async function onRequestGet(context: { request: Request; env: Env; params?: { childId: string } }) {
  const { request, env, params } = context;
  const childId = params?.childId;
  const url = new URL(request.url);
  const historical = url.searchParams.get('historical') === 'true';

  console.log('Trait Scores API: Request received', {
    url: request.url,
    method: request.method,
    childId,
    historical
  });

  if (!childId) {
    return new Response(
      JSON.stringify({ error: 'Child ID is required' }),
      { 
        status: 400,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    let query;
    let params;
    if (historical) {
      query = `
        SELECT 
          t.id as trait_id,
          t.name as trait_name,
          t.code as trait_code,
          t.pillar_id,
          cts.score
        FROM child_trait_scores cts
        INNER JOIN traits t ON t.id = cts.trait_id
        WHERE cts.child_id = ?
        AND cts.updated_at <= datetime('now', '-7 days')
        ORDER BY cts.score DESC
      `;
      params = [childId];
    } else {
      query = `
        WITH recent_trait_gains AS (
          SELECT 
            tsh.trait_id,
            SUM(tsh.score_delta) as total_gain,
            t.name as trait_name,
            t.code as trait_code,
            t.pillar_id
          FROM trait_score_history tsh
          INNER JOIN traits t ON t.id = tsh.trait_id
          WHERE tsh.child_id = ?
          AND tsh.completed_at >= datetime('now', '-7 days')
          GROUP BY tsh.trait_id
          ORDER BY total_gain DESC
        ),
        current_scores AS (
          SELECT 
            t.id as trait_id,
            t.name as trait_name,
            t.code as trait_code,
            t.pillar_id,
            cts.score
          FROM child_trait_scores cts
          INNER JOIN traits t ON t.id = cts.trait_id
          WHERE cts.child_id = ?
        )
        SELECT 
          cs.*,
          COALESCE(rtg.total_gain, 0) as recent_gain
        FROM current_scores cs
        LEFT JOIN recent_trait_gains rtg ON cs.trait_id = rtg.trait_id
        ORDER BY cs.score DESC
      `;
      params = [childId, childId];
    }

    const traitResults = await env.DB.prepare(query).bind(...params).all();
    const traits = traitResults.results;

    // --- Advanced RPG Stats ---
    // 1. Weekly XP Gained (Sunday–now)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    weekStart.setDate(now.getDate() - dayOfWeek);
    const weekStartISO = weekStart.toISOString();
    const weeklyXPQuery = await env.DB.prepare(`
      SELECT SUM(score_delta) as weekly_xp
      FROM trait_score_history
      WHERE child_id = ?
        AND completed_at >= ?
    `).bind(childId, weekStartISO).first<{ weekly_xp: number }>();
    const weekly_xp_gained = weeklyXPQuery?.weekly_xp || 0;

    // 2. Fastest Growing Trait (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoISO = sevenDaysAgo.toISOString();
    const historyRows = await env.DB.prepare(`
      SELECT trait_id, SUM(score_delta) as recent_delta
      FROM trait_score_history
      WHERE child_id = ? AND completed_at >= ?
      GROUP BY trait_id
    `).bind(childId, sevenDaysAgoISO).all<{ trait_id: number; recent_delta: number }>();
    const traitMap = Object.fromEntries(traits.map((t: any) => [t.trait_id, t]));
    const growthRates = historyRows.results.map(row => {
      const currentScore = traitMap[row.trait_id]?.score || 0;
      const previousScore = currentScore - row.recent_delta;
      let growth = 0;
      if (previousScore > 0) {
        growth = row.recent_delta / previousScore;
      } else if (row.recent_delta > 0) {
        growth = 1;
      }
      // Cap growth to 999% for sanity
      const growthPercent = Math.min(Math.round(growth * 100), 999);
      return {
        trait_id: row.trait_id,
        growthPercent,
        trait_name: traitMap[row.trait_id]?.trait_name || `Trait ${row.trait_id}`
      };
    }).filter(r => r.growthPercent > 0).sort((a, b) => b.growthPercent - a.growthPercent);
    const fastest_growing_trait = growthRates[0] || null;

    // 3. Next Trait to Master
    const traitTierThresholds = [15, 35, 60, 100];
    const traitTierEmojis = ['🔸', '🔹', '🟢', '🟣', '🌟'];
    let best = null;
    for (const trait of traits) {
      const score = typeof trait.score === 'number' ? trait.score : Number(trait.score);
      for (let i = 0; i < traitTierThresholds.length; i++) {
        const nextXP = traitTierThresholds[i];
        if (score < nextXP) {
          const gap = nextXP - score;
          // Only show a tier up (from != to)
          const fromTier = i === 0 ? traitTierEmojis[0] : traitTierEmojis[i - 1];
          const toTier = traitTierEmojis[i];
          if (fromTier === toTier) continue;
          if (!best || gap < best.xp_remaining) {
            best = {
              trait_name: trait.trait_name,
              xp_remaining: Math.round(gap),
              from: fromTier,
              to: toTier
            };
          }
          break;
        }
      }
    }
    const next_trait_to_master = best;

    return new Response(
      JSON.stringify({
        data: traits,
        weekly_xp_gained,
        fastest_growing_trait,
        next_trait_to_master
      }),
      {
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Trait Scores API: Error fetching scores:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch trait scores' }),
      {
        status: 500,
        headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
      }
    );
  }
} 