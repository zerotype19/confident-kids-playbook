import { getDB } from './db';

interface ProgressSummary {
  totalCompleted: number;
  streak: number;
  focusPillarId: number | null;
}

interface StreakRow {
  day: string;
}

function calculateStreak(dates: string[]): number {
  let streak = 0;
  let yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  for (let day of dates) {
    const date = new Date(day);
    if (
      date.toDateString() === new Date().toDateString() ||
      date.toDateString() === yesterday.toDateString()
    ) {
      streak++;
      yesterday.setDate(yesterday.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

export async function getProgressSummary(childId: string): Promise<ProgressSummary> {
  const db = getDB();

  const totalCompleted = await db.get(`
    SELECT COUNT(*) as total FROM challenge_logs WHERE child_id = ?;
  `, [childId]);

  const streakData = await db.all<StreakRow>(`
    SELECT DATE(completed_at) as day FROM challenge_logs 
    WHERE child_id = ? ORDER BY completed_at DESC LIMIT 10;
  `, [childId]);

  const days = streakData.map(row => row.day);
  const streak = calculateStreak(days);

  const focusPillar = await db.get(`
    SELECT c.pillar_id, COUNT(*) as count FROM challenge_logs cl
    JOIN challenges c ON cl.challenge_id = c.id
    WHERE cl.child_id = ?
    GROUP BY c.pillar_id ORDER BY count DESC LIMIT 1;
  `, [childId]);

  return {
    totalCompleted: totalCompleted.total,
    streak,
    focusPillarId: focusPillar?.pillar_id ?? null
  };
} 