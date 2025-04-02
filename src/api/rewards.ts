import { Context } from 'hono';
import { db } from '@db';
import { Reward, ProgressSummary } from '../frontend/src/types';

export async function getRewardsAndProgress(c: Context) {
  try {
    const childId = c.req.query('childId');
    if (!childId) {
      return c.json({ error: 'Child ID is required' }, 400);
    }

    // Fetch all rewards
    const rewards = await db.prepare(`
      SELECT * FROM rewards
      ORDER BY type, criteria_value
    `).all<Reward>();

    // Fetch child's progress
    console.log('Reward Engine: Starting progress calculation for child:', childId);
    
    // First, let's get the weekly challenges count directly
    const weeklyChallenges = await db.prepare(`
      SELECT COUNT(*) as count
      FROM challenge_logs
      WHERE child_id = ?
      AND completed = 1
      AND completed_at >= datetime('now', 'weekday 0')
    `).bind(childId).first<{ count: number }>();

    console.log('Reward Engine: Weekly challenges count:', weeklyChallenges);

    const progress = await db.prepare(`
      WITH challenge_progress AS (
        SELECT 
          c.pillar_id,
          COUNT(*) as total,
          SUM(CASE WHEN cl.completed = 1 THEN 1 ELSE 0 END) as completed
        FROM challenges c
        LEFT JOIN challenge_logs cl ON c.id = cl.challenge_id AND cl.child_id = ?
        GROUP BY c.pillar_id
      ),
      streak_info AS (
        SELECT 
          current_streak,
          longest_streak
        FROM child_streaks
        WHERE child_id = ?
      ),
      milestone_progress AS (
        SELECT COUNT(*) as completed
        FROM challenge_logs
        WHERE child_id = ? AND completed = 1
      ),
      weekly_challenges AS (
        SELECT 
          COUNT(*) as completed,
          GROUP_CONCAT(date(completed_at)) as dates,
          GROUP_CONCAT(completed_at) as raw_dates,
          date('now', 'weekday 0') as week_start,
          date('now') as current_date,
          GROUP_CONCAT(date(completed_at) >= date('now', 'weekday 0')) as date_comparison_results,
          GROUP_CONCAT(completed_at) as all_completed_dates,
          COUNT(*) as total_count,
          GROUP_CONCAT(DISTINCT date(completed_at)) as unique_dates,
          GROUP_CONCAT(DISTINCT completed_at) as unique_raw_dates,
          GROUP_CONCAT(DISTINCT date(completed_at) >= date('now', 'weekday 0')) as unique_date_comparison_results,
          GROUP_CONCAT(DISTINCT completed_at) as unique_all_completed_dates,
          datetime('now', 'weekday 0') as week_start_datetime,
          datetime('now') as current_datetime,
          GROUP_CONCAT(DISTINCT completed_at >= datetime('now', 'weekday 0')) as datetime_comparison_results,
          GROUP_CONCAT(DISTINCT child_id) as child_ids,
          GROUP_CONCAT(DISTINCT challenge_id) as challenge_ids,
          GROUP_CONCAT(DISTINCT date(completed_at)) as all_dates,
          GROUP_CONCAT(DISTINCT completed_at) as all_raw_dates,
          GROUP_CONCAT(DISTINCT date(completed_at) >= date('now', 'weekday 0')) as all_date_comparison_results,
          GROUP_CONCAT(DISTINCT completed_at >= datetime('now', 'weekday 0')) as all_datetime_comparison_results,
          GROUP_CONCAT(DISTINCT date(completed_at) >= date('now', 'weekday 0', '-7 days')) as last_week_comparison_results,
          GROUP_CONCAT(DISTINCT completed_at >= datetime('now', 'weekday 0', '-7 days')) as last_week_datetime_comparison_results
        FROM challenge_logs
        WHERE child_id = ? 
        AND completed = 1
        AND completed_at >= datetime('now', 'weekday 0')
      ),
      debug_weekly AS (
        SELECT 
          date('now', 'weekday 0') as week_start,
          COUNT(*) as total_completed,
          GROUP_CONCAT(date(completed_at)) as completed_dates,
          GROUP_CONCAT(completed_at) as raw_dates,
          GROUP_CONCAT(completed) as completion_status,
          GROUP_CONCAT(challenge_id) as challenge_ids,
          GROUP_CONCAT(child_id) as child_ids,
          date('now') as current_date,
          date('now', 'weekday 0') as week_start_date,
          date('now', 'weekday 6') as week_end_date,
          GROUP_CONCAT(completed_at >= datetime('now', 'weekday 0')) as date_comparison_results,
          GROUP_CONCAT(date(completed_at)) as all_dates,
          GROUP_CONCAT(completed_at) as all_raw_dates
        FROM challenge_logs
        WHERE child_id = ? 
        AND completed = 1
      ),
      next_reward AS (
        SELECT 
          r.*,
          CASE 
            WHEN r.type = 'milestone' THEN 
              (SELECT completed FROM milestone_progress) * 100.0 / r.criteria_value
            WHEN r.type = 'streak' THEN 
              (SELECT current_streak FROM streak_info) * 100.0 / r.criteria_value
            WHEN r.type = 'pillar' THEN 
              (SELECT completed FROM challenge_progress WHERE pillar_id = r.pillar_id) * 100.0 / r.criteria_value
          END as progress
        FROM rewards r
        WHERE r.id NOT IN (
          SELECT reward_id FROM child_rewards WHERE child_id = ?
        )
        ORDER BY progress DESC
        LIMIT 1
      )
      SELECT 
        json_object(
          'total_challenges', (SELECT completed FROM milestone_progress),
          'current_streak', (SELECT current_streak FROM streak_info),
          'longest_streak', (SELECT longest_streak FROM streak_info),
          'weekly_challenges', COALESCE((
            SELECT COUNT(*) 
            FROM challenge_logs 
            WHERE child_id = ? 
            AND completed = 1 
            AND completed_at >= datetime('now', 'weekday 0')
          ), 0),
          'pillar_progress', json_group_object(
            pillar_id,
            json_object(
              'total', total,
              'completed', completed,
              'percentage', (completed * 100.0 / total)
            )
          ),
          'milestone_progress', json_object(
            'current', (SELECT completed FROM milestone_progress),
            'next', 20,
            'percentage', (SELECT completed FROM milestone_progress) * 100.0 / 20
          ),
          'next_reward', (
            SELECT json_object(
              'id', id,
              'title', title,
              'description', description,
              'icon', icon,
              'type', type,
              'criteria_value', criteria_value,
              'pillar_id', pillar_id,
              'progress', progress
            )
            FROM next_reward
          ),
          'weekly_debug', (
            SELECT json_object(
              'completed', completed,
              'dates', dates,
              'raw_dates', raw_dates,
              'week_start', week_start,
              'current_date', current_date,
              'date_comparison', datetime('now', 'weekday 0'),
              'date_comparison_results', date_comparison_results,
              'all_completed_dates', all_completed_dates,
              'total_count', total_count,
              'unique_dates', unique_dates,
              'unique_raw_dates', unique_raw_dates,
              'unique_date_comparison_results', unique_date_comparison_results,
              'unique_all_completed_dates', unique_all_completed_dates,
              'week_start_datetime', week_start_datetime,
              'current_datetime', current_datetime,
              'datetime_comparison_results', datetime_comparison_results,
              'child_ids', child_ids,
              'challenge_ids', challenge_ids,
              'all_dates', all_dates,
              'all_raw_dates', all_raw_dates,
              'all_date_comparison_results', all_date_comparison_results,
              'all_datetime_comparison_results', all_datetime_comparison_results,
              'last_week_comparison_results', last_week_comparison_results,
              'last_week_datetime_comparison_results', last_week_datetime_comparison_results
            )
            FROM weekly_challenges
          ),
          'debug_info', (
            SELECT json_object(
              'week_start', week_start,
              'total_completed', total_completed,
              'completed_dates', completed_dates,
              'raw_dates', raw_dates,
              'completion_status', completion_status,
              'challenge_ids', challenge_ids,
              'child_ids', child_ids,
              'current_date', current_date,
              'week_start_date', week_start_date,
              'week_end_date', week_end_date,
              'date_comparison_results', date_comparison_results,
              'all_dates', all_dates,
              'all_raw_dates', all_raw_dates
            )
            FROM debug_weekly
          )
        ) as progress_summary
    `).bind(childId, childId, childId, childId, childId, childId, childId, childId, childId).first<{ progress_summary: ProgressSummary }>();

    // Log the progress summary before returning
    console.log('Reward Engine: Progress summary:', progress?.progress_summary);
    console.log('Reward Engine: Weekly challenges calculation:', {
      childId,
      weekStart: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString(),
      weeklyTotal: progress?.progress_summary?.weekly_challenges || 0,
      weeklyDebug: progress?.progress_summary?.weekly_debug,
      debugInfo: progress?.progress_summary?.debug_info,
      directCount: weeklyChallenges?.count || 0
    });

    // Return the response
    return c.json({
      rewards: rewards.results,
      progress: progress?.progress_summary || null
    });
  } catch (error) {
    console.error('Error fetching rewards and progress:', error);
    return c.json({ error: 'Failed to fetch rewards and progress' }, 500);
  }
} 