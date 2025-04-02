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
      SELECT 
        COUNT(*) as count,
        GROUP_CONCAT(completed_at) as dates,
        date('now', 'weekday 0') as week_start,
        date('now') as current_date,
        datetime('now') as current_datetime,
        datetime('now', 'weekday 0') as week_start_datetime
      FROM challenge_logs
      WHERE child_id = ?
      AND completed = 1
      AND completed_at >= datetime('now', 'weekday 0')
    `).bind(childId).first<{ count: number; dates: string; week_start: string; current_date: string; current_datetime: string; week_start_datetime: string }>();

    console.log('Reward Engine: Weekly challenges direct query:', {
      childId,
      count: weeklyChallenges?.count || 0,
      dates: weeklyChallenges?.dates,
      weekStart: weeklyChallenges?.week_start,
      currentDate: weeklyChallenges?.current_date,
      currentDateTime: weeklyChallenges?.current_datetime,
      weekStartDateTime: weeklyChallenges?.week_start_datetime
    });

    // Let's also get a raw count of all completed challenges for this week
    const rawWeeklyCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM challenge_logs
      WHERE child_id = ?
      AND completed = 1
      AND completed_at >= datetime('now', 'weekday 0')
    `).bind(childId).first<{ count: number }>();

    console.log('Reward Engine: Raw weekly count:', {
      childId,
      count: rawWeeklyCount?.count || 0
    });

    // Get weekly challenges count directly
    const weeklyChallengesCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM challenge_logs
      WHERE child_id = ?
      AND completed = 1
      AND completed_at >= datetime('now', 'weekday 0')
    `).bind(childId).first<{ count: number }>();

    console.log('Reward Engine: Direct weekly challenges count:', weeklyChallengesCount);

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
      weekly_progress AS (
        SELECT 
          COUNT(*) as count,
          GROUP_CONCAT(completed_at) as dates,
          date('now', 'weekday 0') as week_start,
          date('now') as current_date,
          datetime('now') as current_datetime,
          datetime('now', 'weekday 0') as week_start_datetime
        FROM challenge_logs
        WHERE child_id = ?
        AND completed = 1
        AND completed_at >= datetime('now', 'weekday 0')
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
          'weekly_challenges', (SELECT count FROM weekly_progress),
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
              'count', count,
              'dates', dates,
              'week_start', week_start,
              'current_date', current_date,
              'current_datetime', current_datetime,
              'week_start_datetime', week_start_datetime
            )
            FROM weekly_progress
          )
        ) as progress_summary
    `).bind(childId, childId, childId, childId, childId, childId, childId).first<{ progress_summary: ProgressSummary }>();

    // Log the progress summary before returning
    console.log('Reward Engine: Progress summary:', progress?.progress_summary);
    console.log('Reward Engine: Weekly challenges calculation:', {
      childId,
      weekStart: new Date(new Date().setDate(new Date().getDate() - new Date().getDay())).toISOString(),
      weeklyTotal: progress?.progress_summary?.weekly_challenges || 0,
      weeklyDebug: progress?.progress_summary?.weekly_debug,
      directCount: weeklyChallengesCount?.count || 0,
      rawCount: rawWeeklyCount?.count || 0,
      directDates: weeklyChallenges?.dates,
      directWeekStart: weeklyChallenges?.week_start,
      directCurrentDate: weeklyChallenges?.current_date,
      directCurrentDateTime: weeklyChallenges?.current_datetime,
      directWeekStartDateTime: weeklyChallenges?.week_start_datetime
    });

    // Return the response with weekly challenges count
    return c.json({
      rewards: rewards,
      progress: {
        total_challenges: progress?.progress_summary?.total_challenges || 0,
        current_streak: progress?.progress_summary?.current_streak || 0,
        longest_streak: progress?.progress_summary?.longest_streak || 0,
        weekly_challenges: weeklyChallengesCount?.count || 0,
        pillar_progress: progress?.progress_summary?.pillar_progress || {},
        milestone_progress: progress?.progress_summary?.milestone_progress || {
          current: 0,
          next: 20,
          percentage: 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching rewards and progress:', error);
    return c.json({ error: 'Failed to fetch rewards and progress' }, 500);
  }
} 