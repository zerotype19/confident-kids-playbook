// First, let's get the weekly challenges count directly
const weeklyChallenges = await db.prepare(`
  SELECT 
    COUNT(*) as count,
    GROUP_CONCAT(completed_at) as dates,
    datetime('now', 'localtime', 'America/New_York', 'weekday 0') as week_start,
    datetime('now', 'localtime', 'America/New_York') as current_date,
    datetime('now', 'localtime', 'America/New_York') as current_datetime,
    datetime('now', 'localtime', 'America/New_York', 'weekday 0') as week_start_datetime
  FROM challenge_logs
  WHERE child_id = ?
  AND completed = 1
  AND datetime(completed_at, 'localtime', 'America/New_York') >= datetime('now', 'localtime', 'America/New_York', 'weekday 0')
`).bind(childId).first<{ count: number; dates: string; week_start: string; current_date: string; current_datetime: string; week_start_datetime: string }>();

// Let's also get a raw count of all completed challenges for this week
const rawWeeklyCount = await db.prepare(`
  SELECT COUNT(*) as count
  FROM challenge_logs
  WHERE child_id = ?
  AND completed = 1
  AND datetime(completed_at, 'localtime', 'America/New_York') >= datetime('now', 'localtime', 'America/New_York', 'weekday 0')
`).bind(childId).first<{ count: number }>(); 