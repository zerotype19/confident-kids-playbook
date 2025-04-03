import { Env, D1Database } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'streak' | 'pillar';
  criteria_value: number;
  pillar_id?: number;
  level?: number;
  unlockable_content?: string;
  reward_type?: string;
}

interface ChildReward {
  id: string;
  child_id: string;
  reward_id: string;
  granted_at: string;
}

export async function evaluateAndGrantRewards(childId: string, env: Env) {
  console.log('Reward Engine: Starting reward evaluation for child:', childId);
  
  try {
    // 1. Check milestone rewards
    const { total } = await env.DB.prepare(`
      SELECT COUNT(*) as total 
      FROM challenge_logs 
      WHERE child_id = ?
    `).bind(childId).first<{ total: number }>();
    
    console.log('Reward Engine: Total completed challenges:', total);
    
    const milestones = [5, 10, 20, 50, 100];
    for (const value of milestones) {
      console.log('Reward Engine: Checking milestone:', value);
      if (total >= value) {
        await grantRewardIfNew(env.DB, childId, 'milestone', value);
      }
    }

    // 2. Check streak rewards
    const { current_streak } = await env.DB.prepare(`
      WITH RECURSIVE dates AS (
        SELECT date(datetime(completed_at, 'localtime', 'America/New_York')) as date
        FROM challenge_logs
        WHERE child_id = ?
        AND completed = 1
        ORDER BY completed_at DESC
        LIMIT 1
      ),
      consecutive_days AS (
        SELECT date, 1 as streak
        FROM dates
        UNION ALL
        SELECT date(datetime(cl.completed_at, 'localtime', 'America/New_York')), cd.streak + 1
        FROM challenge_logs cl
        JOIN consecutive_days cd ON date(datetime(cl.completed_at, 'localtime', 'America/New_York')) = date(datetime(cd.date, 'localtime', 'America/New_York'), '-1 day')
        WHERE cl.child_id = ?
        AND cl.completed = 1
      )
      SELECT MAX(streak) as current_streak
      FROM consecutive_days
    `).bind(childId, childId).first<{ current_streak: number }>();
    
    console.log('Reward Engine: Current streak:', current_streak);
    
    const streaks = [3, 5, 10, 15, 20, 30];
    for (const value of streaks) {
      console.log('Reward Engine: Checking streak:', value);
      if (current_streak >= value) {
        await grantRewardIfNew(env.DB, childId, 'streak', value);
      }
    }

    // 3. Check pillar rewards
    const pillarCounts = await env.DB.prepare(`
      SELECT c.pillar_id, COUNT(*) as count
      FROM challenge_logs cl
      JOIN challenges c ON cl.challenge_id = c.id
      WHERE cl.child_id = ?
      GROUP BY c.pillar_id
    `).bind(childId).all<{ pillar_id: number; count: number }>();
    
    console.log('Reward Engine: Pillar counts:', pillarCounts);
    
    for (const { pillar_id, count } of pillarCounts.results || []) {
      console.log('Reward Engine: Checking pillar:', pillar_id, 'count:', count);
      // Level 1 rewards (3 challenges)
      if (count >= 3) {
        await grantRewardIfNew(env.DB, childId, 'pillar', 3, pillar_id);
      }
      // Level 2 rewards (10 challenges)
      if (count >= 10) {
        await grantRewardIfNew(env.DB, childId, 'pillar', 10, pillar_id);
      }
    }
  } catch (error) {
    console.error('Reward Engine: Error during reward evaluation:', error);
    throw error;
  }
}

async function grantRewardIfNew(
  db: D1Database, 
  childId: string, 
  type: string, 
  value: number, 
  pillarId?: number
) {
  console.log('Reward Engine: Checking reward:', { type, value, pillarId });
  
  let query = `
    SELECT id 
    FROM rewards 
    WHERE type = ? AND criteria_value = ?
  `;
  let params = [type, value];

  if (pillarId !== undefined) {
    query += ' AND pillar_id = ?';
    params.push(pillarId);
  } else {
    query += ' AND pillar_id IS NULL';
  }

  console.log('Reward Engine: Executing query:', { query, params });
  
  const reward = await db.prepare(query)
    .bind(...params)
    .first<{ id: number }>();
  
  if (!reward) {
    console.log('Reward Engine: No matching reward found');
    return;
  }
  
  const alreadyGranted = await db.prepare(`
    SELECT 1 
    FROM child_rewards 
    WHERE child_id = ? AND reward_id = ?
  `).bind(childId, reward.id).first<{ '1': number }>();
  
  if (!alreadyGranted) {
    console.log('Reward Engine: Granting new reward:', reward.id);
    await db.prepare(`
      INSERT INTO child_rewards (id, child_id, reward_id, granted_at)
      VALUES (?, ?, ?, datetime('now'))
    `).bind(uuidv4(), childId, reward.id).run();
  } else {
    console.log('Reward Engine: Reward already granted');
  }
}

export async function getChildRewards(childId: string, env: Env): Promise<Reward[]> {
  console.log('Reward Engine: Fetching rewards for child:', childId);
  
  const result = await env.DB.prepare(`
    SELECT r.*
    FROM rewards r
    JOIN child_rewards cr ON r.id = cr.reward_id
    WHERE cr.child_id = ?
    ORDER BY cr.granted_at DESC
  `).bind(childId).all<Reward>();
  
  console.log('Reward Engine: Found rewards:', result);
  return result.results || [];
}

export async function getChildProgress(childId: string, env: Env) {
  console.log('Reward Engine: Fetching progress for child:', childId);

  // First get the child's age range
  const { age_range } = await env.DB.prepare(`
    SELECT age_range 
    FROM children 
    WHERE id = ?
  `).bind(childId).first<{ age_range: string }>();

  if (!age_range) {
    throw new Error('Child not found');
  }

  // Normalize the age range format (replace en dash with regular hyphen)
  const normalizedAgeRange = age_range.replace(/–/g, '-');

  // Get total completed challenges
  const { total } = await env.DB.prepare(`
    SELECT COUNT(*) as total 
    FROM challenge_logs 
    WHERE child_id = ?
  `).bind(childId).first<{ total: number }>();

  // Get current streak
  const { current_streak } = await env.DB.prepare(`
    WITH RECURSIVE dates AS (
      SELECT date(datetime(completed_at, 'localtime', 'America/New_York')) as date
      FROM challenge_logs
      WHERE child_id = ?
      AND completed = 1
      ORDER BY completed_at DESC
      LIMIT 1
    ),
    consecutive_days AS (
      SELECT date, 1 as streak
      FROM dates
      UNION ALL
      SELECT date(datetime(cl.completed_at, 'localtime', 'America/New_York')), cd.streak + 1
      FROM challenge_logs cl
      JOIN consecutive_days cd ON date(datetime(cl.completed_at, 'localtime', 'America/New_York')) = date(datetime(cd.date, 'localtime', 'America/New_York'), '-1 day')
      WHERE cl.child_id = ?
      AND cl.completed = 1
    )
    SELECT MAX(streak) as current_streak
    FROM consecutive_days
  `).bind(childId, childId).first<{ current_streak: number }>();

  // Get longest streak
  const { longest_streak } = await env.DB.prepare(`
    WITH RECURSIVE dates AS (
      SELECT date(datetime(completed_at, 'localtime', 'America/New_York')) as date
      FROM challenge_logs
      WHERE child_id = ?
      AND completed = 1
      ORDER BY completed_at DESC
    ),
    consecutive_days AS (
      SELECT date, 1 as streak
      FROM dates
      UNION ALL
      SELECT date(datetime(cl.completed_at, 'localtime', 'America/New_York')), cd.streak + 1
      FROM challenge_logs cl
      JOIN consecutive_days cd ON date(datetime(cl.completed_at, 'localtime', 'America/New_York')) = date(datetime(cd.date, 'localtime', 'America/New_York'), '-1 day')
      WHERE cl.child_id = ?
      AND cl.completed = 1
    )
    SELECT MAX(streak) as longest_streak
    FROM consecutive_days
  `).bind(childId, childId).first<{ longest_streak: number }>();

  // Get challenges completed this week
  const weeklyChallengesQuery = await env.DB.prepare(`
    SELECT 
      COUNT(*) as weekly_challenges,
      datetime('now', 'localtime', 'America/New_York') as current_time,
      datetime('now', 'localtime', 'America/New_York', 'weekday 0', '-7 days') as week_start,
      GROUP_CONCAT(datetime(completed_at, 'localtime', 'America/New_York')) as completed_dates
    FROM challenge_logs
    WHERE child_id = ?
    AND completed = 1
    AND datetime(completed_at, 'localtime', 'America/New_York') >= datetime('now', 'localtime', 'America/New_York', 'weekday 0', '-7 days')
  `).bind(childId).first<{ 
    weekly_challenges: number;
    current_time: string;
    week_start: string;
    completed_dates: string;
  }>();

  console.log('Weekly challenges calculation:', {
    childId,
    currentTime: weeklyChallengesQuery?.current_time,
    weekStart: weeklyChallengesQuery?.week_start,
    completedDates: weeklyChallengesQuery?.completed_dates,
    count: weeklyChallengesQuery?.weekly_challenges
  });

  // Get pillar progress
  const pillarProgress = await env.DB.prepare(`
    SELECT 
      c.pillar_id,
      COUNT(*) as completed,
      (
        SELECT COUNT(*)
        FROM challenges c2
        WHERE c2.pillar_id = c.pillar_id
        AND c2.age_range = ?
      ) as total
    FROM challenge_logs cl
    JOIN challenges c ON cl.challenge_id = c.id
    WHERE cl.child_id = ?
    GROUP BY c.pillar_id
  `).bind(normalizedAgeRange, childId).all<{ pillar_id: number; completed: number; total: number }>();

  // Calculate next rewards
  const nextRewards = {
    milestone: null as any,
    streak: null as any,
    pillar: null as any
  };

  // Next milestone reward
  const milestones = [5, 10, 20, 50, 100];
  const nextMilestone = milestones.find(m => m > total);
  if (nextMilestone) {
    const reward = await env.DB.prepare(`
      SELECT * FROM rewards 
      WHERE type = 'milestone' AND criteria_value = ?
      AND NOT EXISTS (
        SELECT 1 FROM child_rewards 
        WHERE child_id = ? AND reward_id = rewards.id
      )
    `).bind(nextMilestone, childId).first<Reward>();
    if (reward) {
      nextRewards.milestone = {
        ...reward,
        progress: (total / nextMilestone) * 100
      };
    }
  }

  // Calculate milestone progress
  const milestoneProgress = {
    current: total,
    next: nextMilestone || Math.ceil(total / 10) * 10 + 10, // If no next milestone, use next multiple of 10
    percentage: nextMilestone ? (total / nextMilestone) * 100 : (total % 10) * 10
  };

  // Next streak reward
  const streaks = [3, 5, 10, 15, 20, 30];
  const nextStreak = streaks.find(s => s > (current_streak || 0));
  if (nextStreak) {
    const reward = await env.DB.prepare(`
      SELECT * FROM rewards 
      WHERE type = 'streak' AND criteria_value = ?
      AND NOT EXISTS (
        SELECT 1 FROM child_rewards 
        WHERE child_id = ? AND reward_id = rewards.id
      )
    `).bind(nextStreak, childId).first<Reward>();
    if (reward) {
      nextRewards.streak = {
        ...reward,
        progress: ((current_streak || 0) / nextStreak) * 100
      };
    }
  }

  // Transform pillar progress into the expected format
  const transformedPillarProgress = (pillarProgress.results || []).reduce((acc: any, pillar: any) => {
    acc[pillar.pillar_id] = {
      completed: pillar.completed,
      total: pillar.total,
      percentage: pillar.total > 0 ? (pillar.completed / pillar.total) * 100 : 0
    };
    return acc;
  }, {});

  return {
    total_challenges: total,
    current_streak: current_streak || 0,
    longest_streak: longest_streak || 0,
    weekly_challenges: weeklyChallengesQuery?.weekly_challenges || 0,
    pillar_progress: transformedPillarProgress,
    milestone_progress: milestoneProgress,
    next_rewards: nextRewards
  };
} 