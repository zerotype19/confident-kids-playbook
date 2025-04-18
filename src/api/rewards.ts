import { Context } from 'hono';
import { db } from '@db';
import { Reward, ProgressSummary } from '../frontend/src/types';

export async function getRewardsAndProgress(c: Context) {
  try {
    const childId = c.req.query('childId');
    if (!childId) {
      return c.json({ error: 'Child ID is required' }, 400);
    }

    console.log('Reward Engine: Starting progress calculation for child:', childId);

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
    const weeklyCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM challenge_logs
      WHERE child_id = ?
      AND completed = 1
      AND date(completed_at) >= date('now', 'weekday 0')
    `).bind(childId).first<{ count: number }>();

    console.log('Weekly challenges count:', {
      count: weeklyCount?.count,
      childId,
      query: `SELECT COUNT(*) as count FROM challenge_logs WHERE child_id = '${childId}' AND completed = 1 AND date(completed_at) >= date('now', 'weekday 0')`
    });

    // Also get a raw count for verification
    const rawCount = await db.prepare(`
      SELECT COUNT(*) as count
      FROM challenge_logs
      WHERE child_id = ?
      AND completed = 1
      AND date(completed_at) >= date('now', 'weekday 0')
    `).bind(childId).first<{ count: number }>();

    console.log('Raw weekly count:', rawCount);

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
      )
      SELECT 
        json_object(
          'total_challenges', (SELECT completed FROM milestone_progress),
          'current_streak', (SELECT current_streak FROM streak_info),
          'longest_streak', (SELECT longest_streak FROM streak_info),
          'pillar_progress', json_object(
            '1', json_object(
              'completed', COALESCE(SUM(CASE WHEN cp.pillar_id = 1 THEN cp.completed ELSE 0 END), 0),
              'total', COALESCE(SUM(CASE WHEN cp.pillar_id = 1 THEN cp.total ELSE 0 END), 0),
              'percentage', CASE 
                WHEN COALESCE(SUM(CASE WHEN cp.pillar_id = 1 THEN cp.total ELSE 0 END), 0) = 0 THEN 0 
                ELSE (COALESCE(SUM(CASE WHEN cp.pillar_id = 1 THEN cp.completed ELSE 0 END), 0) * 100.0 / 
                      COALESCE(SUM(CASE WHEN cp.pillar_id = 1 THEN cp.total ELSE 0 END), 0))
              END
            ),
            '2', json_object(
              'completed', COALESCE(SUM(CASE WHEN cp.pillar_id = 2 THEN cp.completed ELSE 0 END), 0),
              'total', COALESCE(SUM(CASE WHEN cp.pillar_id = 2 THEN cp.total ELSE 0 END), 0),
              'percentage', CASE 
                WHEN COALESCE(SUM(CASE WHEN cp.pillar_id = 2 THEN cp.total ELSE 0 END), 0) = 0 THEN 0 
                ELSE (COALESCE(SUM(CASE WHEN cp.pillar_id = 2 THEN cp.completed ELSE 0 END), 0) * 100.0 / 
                      COALESCE(SUM(CASE WHEN cp.pillar_id = 2 THEN cp.total ELSE 0 END), 0))
              END
            ),
            '3', json_object(
              'completed', COALESCE(SUM(CASE WHEN cp.pillar_id = 3 THEN cp.completed ELSE 0 END), 0),
              'total', COALESCE(SUM(CASE WHEN cp.pillar_id = 3 THEN cp.total ELSE 0 END), 0),
              'percentage', CASE 
                WHEN COALESCE(SUM(CASE WHEN cp.pillar_id = 3 THEN cp.total ELSE 0 END), 0) = 0 THEN 0 
                ELSE (COALESCE(SUM(CASE WHEN cp.pillar_id = 3 THEN cp.completed ELSE 0 END), 0) * 100.0 / 
                      COALESCE(SUM(CASE WHEN cp.pillar_id = 3 THEN cp.total ELSE 0 END), 0))
              END
            ),
            '4', json_object(
              'completed', COALESCE(SUM(CASE WHEN cp.pillar_id = 4 THEN cp.completed ELSE 0 END), 0),
              'total', COALESCE(SUM(CASE WHEN cp.pillar_id = 4 THEN cp.total ELSE 0 END), 0),
              'percentage', CASE 
                WHEN COALESCE(SUM(CASE WHEN cp.pillar_id = 4 THEN cp.total ELSE 0 END), 0) = 0 THEN 0 
                ELSE (COALESCE(SUM(CASE WHEN cp.pillar_id = 4 THEN cp.completed ELSE 0 END), 0) * 100.0 / 
                      COALESCE(SUM(CASE WHEN cp.pillar_id = 4 THEN cp.total ELSE 0 END), 0))
              END
            ),
            '5', json_object(
              'completed', COALESCE(SUM(CASE WHEN cp.pillar_id = 5 THEN cp.completed ELSE 0 END), 0),
              'total', COALESCE(SUM(CASE WHEN cp.pillar_id = 5 THEN cp.total ELSE 0 END), 0),
              'percentage', CASE 
                WHEN COALESCE(SUM(CASE WHEN cp.pillar_id = 5 THEN cp.total ELSE 0 END), 0) = 0 THEN 0 
                ELSE (COALESCE(SUM(CASE WHEN cp.pillar_id = 5 THEN cp.completed ELSE 0 END), 0) * 100.0 / 
                      COALESCE(SUM(CASE WHEN cp.pillar_id = 5 THEN cp.total ELSE 0 END), 0))
              END
            )
          ),
          'milestone_progress', json_object(
            'current', (SELECT completed FROM milestone_progress),
            'next', 20,
            'percentage', (SELECT completed FROM milestone_progress) * 100.0 / 20
          )
        ) as progress_summary
      FROM challenge_progress cp
    `).bind(childId, childId, childId).first<{ progress_summary: ProgressSummary }>();

    // Log the progress summary before returning
    console.log('Reward Engine: Progress summary:', progress?.progress_summary);
    console.log('Reward Engine: Weekly challenges calculation:', {
      childId,
      weekStart: weeklyCount?.week_start,
      currentDate: weeklyCount?.current_date,
      weeklyTotal: weeklyCount?.count || 0,
      rawCount: rawCount?.count || 0
    });

    // Return the response with weekly challenges count
    const progressSummary = progress?.progress_summary || {};
    const response = {
      rewards: rewards.results || [],
      progress: {
        total_challenges: progressSummary.total_challenges || 0,
        current_streak: progressSummary.current_streak || 0,
        longest_streak: progressSummary.longest_streak || 0,
        weekly_challenges: weeklyCount?.count || 0,
        pillar_progress: progressSummary.pillar_progress || {},
        milestone_progress: progressSummary.milestone_progress || {
          current: 0,
          next: 20,
          percentage: 0
        }
      }
    };

    console.log('Reward Engine: Final response:', JSON.stringify(response, null, 2));
    return c.json(response);
  } catch (error) {
    console.error('Error fetching rewards and progress:', error);
    return c.json({ error: 'Failed to fetch rewards and progress' }, 500);
  }
} 