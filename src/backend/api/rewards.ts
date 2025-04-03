// First, let's get the weekly challenges count directly
const weeklyChallenges = await db.prepare(`
  SELECT 
    COUNT(*) as count,
    GROUP_CONCAT(datetime(completed_at, 'localtime', 'America/New_York')) as dates,
    datetime('now', 'localtime', 'America/New_York', 'weekday 0', '-7 days') as week_start,
    datetime('now', 'localtime', 'America/New_York') as current_date,
    datetime('now', 'localtime', 'America/New_York') as current_datetime,
    datetime('now', 'localtime', 'America/New_York', 'weekday 0', '-7 days') as week_start_datetime
  FROM challenge_logs
  WHERE child_id = ?
  AND status = 'completed'
  AND datetime(completed_at, 'localtime', 'America/New_York') >= datetime('now', 'localtime', 'America/New_York', 'weekday 0', '-7 days')
`).bind(childId).first<{ 
  count: number; 
  dates: string; 
  week_start: string; 
  current_date: string; 
  current_datetime: string; 
  week_start_datetime: string 
}>();

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
  AND status = 'completed'
  AND datetime(completed_at, 'localtime', 'America/New_York') >= datetime('now', 'localtime', 'America/New_York', 'weekday 0')
`).bind(childId).first<{ count: number }>(); 