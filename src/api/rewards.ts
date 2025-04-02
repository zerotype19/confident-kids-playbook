import { Context } from 'hono';
import { db } from '../db';
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
          GROUP_CONCAT(completed_at) as raw_dates
        FROM challenge_logs
        WHERE child_id = ? 
        AND completed = 1
        AND date(completed_at) >= date('now', 'weekday 0')
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
          date('now', 'weekday 6') as week_end_date
        FROM challenge_logs
        WHERE child_id = ? 
        AND completed = 1
        AND date(completed_at) >= date('now', 'weekday 0')
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
          'milestones_completed', (SELECT completed FROM milestone_progress),
          'weekly_challenges', COALESCE((SELECT completed FROM weekly_challenges), 0),
          'weekly_debug', (
            SELECT json_object(
              'completed', completed,
              'dates', dates,
              'raw_dates', raw_dates
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
              'query_params', json_object(
                'child_id', ?,
                'week_start', date('now', 'weekday 0')
              )
            )
            FROM debug_weekly
          ),
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
          )
        ) as progress_summary
    `).bind(childId, childId, childId, childId, childId, childId, childId).first<{ progress_summary: ProgressSummary }>();

    return c.json({
      rewards: rewards.results,
      progress: progress?.progress_summary || null
    });
  } catch (error) {
    console.error('Error fetching rewards and progress:', error);
    return c.json({ error: 'Failed to fetch rewards and progress' }, 500);
  }
} 