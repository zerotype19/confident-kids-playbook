import { Env } from "../types";
import { v4 as uuidv4 } from 'uuid';

interface Reward {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'milestone' | 'streak' | 'pillar';
  criteria_value: number;
  pillar_id?: number;
}

interface ChildReward {
  id: string;
  child_id: string;
  reward_id: string;
  granted_at: string;
}

export async function evaluateAndGrantRewards(childId: string, env: Env) {
  console.log('Reward Engine: Starting reward evaluation for child:', childId);
  
  // 1. Check milestone rewards
  const { total } = await env.DB.prepare(`
    SELECT COUNT(*) as total 
    FROM challenge_logs 
    WHERE child_id = ?
  `).bind(childId).first<{ total: number }>();
  
  console.log('Reward Engine: Total completed challenges:', total);
  
  const milestones = [5, 10, 20];
  for (const value of milestones) {
    if (total >= value) {
      await grantRewardIfNew(env.DB, childId, 'milestone', value);
    }
  }

  // 2. Check streak rewards
  const { current_streak } = await env.DB.prepare(`
    WITH RECURSIVE dates AS (
      SELECT date(completed_at) as date
      FROM challenge_logs
      WHERE child_id = ?
      ORDER BY completed_at DESC
      LIMIT 1
    ),
    consecutive_days AS (
      SELECT date, 1 as streak
      FROM dates
      UNION ALL
      SELECT date(cl.completed_at), cd.streak + 1
      FROM challenge_logs cl
      JOIN consecutive_days cd ON date(cl.completed_at) = date(cd.date, '-1 day')
      WHERE cl.child_id = ?
    )
    SELECT MAX(streak) as current_streak
    FROM consecutive_days
  `).bind(childId, childId).first<{ current_streak: number }>();
  
  console.log('Reward Engine: Current streak:', current_streak);
  
  const streaks = [3, 5, 10];
  for (const value of streaks) {
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
    if (count >= 3) {
      await grantRewardIfNew(env.DB, childId, 'pillar', 3, pillar_id);
    }
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
  
  const reward = await db.prepare(`
    SELECT id 
    FROM rewards 
    WHERE type = ? AND criteria_value = ? AND (pillar_id = ? OR (pillar_id IS NULL AND ? IS NULL))
  `).bind(type, value, pillarId, pillarId).first<{ id: string }>();
  
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
      INSERT INTO child_rewards (id, child_id, reward_id)
      VALUES (?, ?, ?)
    `).bind(uuidv4(), childId, reward.id).run();
  } else {
    console.log('Reward Engine: Reward already granted');
  }
}

export async function getChildRewards(childId: string, env: Env): Promise<Reward[]> {
  console.log('Reward Engine: Fetching rewards for child:', childId);
  
  const rewards = await env.DB.prepare(`
    SELECT r.*
    FROM rewards r
    JOIN child_rewards cr ON r.id = cr.reward_id
    WHERE cr.child_id = ?
    ORDER BY cr.granted_at DESC
  `).bind(childId).all<Reward>();
  
  console.log('Reward Engine: Found rewards:', rewards);
  return rewards;
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
      SELECT date(completed_at) as date
      FROM challenge_logs
      WHERE child_id = ?
      ORDER BY completed_at DESC
      LIMIT 1
    ),
    consecutive_days AS (
      SELECT date, 1 as streak
      FROM dates
      UNION ALL
      SELECT date(cl.completed_at), cd.streak + 1
      FROM challenge_logs cl
      JOIN consecutive_days cd ON date(cl.completed_at) = date(cd.date, '-1 day')
      WHERE cl.child_id = ?
    )
    SELECT MAX(streak) as current_streak
    FROM consecutive_days
  `).bind(childId, childId).first<{ current_streak: number }>();

  // Get longest streak
  const { longest_streak } = await env.DB.prepare(`
    WITH RECURSIVE dates AS (
      SELECT date(completed_at) as date
      FROM challenge_logs
      WHERE child_id = ?
      ORDER BY completed_at DESC
    ),
    consecutive_days AS (
      SELECT date, 1 as streak
      FROM dates
      UNION ALL
      SELECT date(cl.completed_at), cd.streak + 1
      FROM challenge_logs cl
      JOIN consecutive_days cd ON date(cl.completed_at) = date(cd.date, '-1 day')
      WHERE cl.child_id = ?
    )
    SELECT MAX(streak) as longest_streak
    FROM consecutive_days
  `).bind(childId, childId).first<{ longest_streak: number }>();

  // Get challenges completed this week
  const { weekly_challenges } = await env.DB.prepare(`
    SELECT COUNT(*) as weekly_challenges
    FROM challenge_logs
    WHERE child_id = ?
    AND date(completed_at) >= date('now', 'weekday 0', '-7 days')
  `).bind(childId).first<{ weekly_challenges: number }>();

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

  // Debug logging
  console.log('Reward Engine: Debug info:', {
    age_range,
    normalized_age_range: normalizedAgeRange,
    child_id: childId,
    raw_challenges: await env.DB.prepare(`
      SELECT pillar_id, COUNT(*) as total
      FROM challenges
      WHERE age_range = ?
      GROUP BY pillar_id
    `).bind(normalizedAgeRange).all(),
    raw_completed: await env.DB.prepare(`
      SELECT 
        c.pillar_id,
        COUNT(*) as completed
      FROM challenge_logs cl
      JOIN challenges c ON cl.challenge_id = c.id
      WHERE cl.child_id = ?
      GROUP BY c.pillar_id
    `).bind(childId).all(),
    results: pillarProgress.results
  });

  // Calculate milestone progress
  const milestones = [5, 10, 20];
  const nextMilestone = milestones.find(m => m > total) || milestones[milestones.length - 1];
  const milestoneProgress = {
    current: total,
    next: nextMilestone,
    percentage: total >= 20 ? 100 : (total / nextMilestone) * 100
  };

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
    weekly_challenges: weekly_challenges || 0,
    pillar_progress: transformedPillarProgress,
    milestone_progress: milestoneProgress
  };
} 