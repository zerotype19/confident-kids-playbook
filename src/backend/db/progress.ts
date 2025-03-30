import { Env } from "../types";

export interface ProgressSummary {
  totalCompleted: number;
  currentStreak: number;
  currentFocusPillar: string;
}

interface CompletedResult {
  count: number;
}

interface StreakResult {
  current_streak: number;
}

interface PillarResult {
  pillar: string;
  count: number;
}

export async function getProgressSummary(childId: string): Promise<ProgressSummary> {
  console.log('Progress DB: Starting to fetch summary for child:', childId);
  const { DB } = process.env as unknown as Env;
  
  // Get total completed challenges
  console.log('Progress DB: Fetching total completed challenges');
  const completedResult = await DB.prepare(`
    SELECT COUNT(*) as count 
    FROM challenge_completions 
    WHERE child_id = ? AND completed = 1
  `).bind(childId).first<CompletedResult>();
  console.log('Progress DB: Completed challenges result:', completedResult);
  
  // Get current streak
  console.log('Progress DB: Fetching current streak');
  const streakResult = await DB.prepare(`
    WITH RECURSIVE dates AS (
      SELECT date(completed_at) as date
      FROM challenge_completions
      WHERE child_id = ? AND completed = 1
      ORDER BY completed_at DESC
      LIMIT 1
    ),
    consecutive_days AS (
      SELECT date, 1 as streak
      FROM dates
      UNION ALL
      SELECT date(cc.completed_at), cd.streak + 1
      FROM challenge_completions cc
      JOIN consecutive_days cd ON date(cc.completed_at) = date(cd.date, '-1 day')
      WHERE cc.child_id = ? AND cc.completed = 1
    )
    SELECT MAX(streak) as current_streak
    FROM consecutive_days
  `).bind(childId, childId).first<StreakResult>();
  console.log('Progress DB: Streak result:', streakResult);
  
  // Get current focus pillar
  console.log('Progress DB: Fetching current focus pillar');
  const pillarResult = await DB.prepare(`
    SELECT c.pillar, COUNT(*) as count
    FROM challenge_completions cc
    JOIN challenges c ON cc.challenge_id = c.id
    WHERE cc.child_id = ? AND cc.completed = 1
    GROUP BY c.pillar
    ORDER BY count DESC
    LIMIT 1
  `).bind(childId).first<PillarResult>();
  console.log('Progress DB: Pillar result:', pillarResult);
  
  const summary = {
    totalCompleted: completedResult?.count || 0,
    currentStreak: streakResult?.current_streak || 0,
    currentFocusPillar: pillarResult?.pillar || 'None'
  };
  
  console.log('Progress DB: Final summary:', summary);
  return summary;
} 