-- Add new milestone rewards
INSERT OR IGNORE INTO rewards (id, title, description, icon, type, criteria_value) VALUES
  ('milestone-30', 'Challenge Master', 'Completed 30 challenges', '🏆', 'milestone', 30),
  ('milestone-50', 'Superstar Achiever', 'Completed 50 challenges', '⭐', 'milestone', 50);

-- Add new streak rewards
INSERT OR IGNORE INTO rewards (id, title, description, icon, type, criteria_value) VALUES
  ('streak-7', 'Weekly Warrior', 'Maintained a 7-day streak', '🔥', 'streak', 7),
  ('streak-30', 'Monthly Master', 'Maintained a 30-day streak', '🌟', 'streak', 30);

-- Add new pillar-specific rewards
INSERT OR IGNORE INTO rewards (id, title, description, icon, type, criteria_value, pillar_id) VALUES
  ('pillar-1-10', 'Independence Champion', 'Completed 10 Independence & Problem-Solving challenges', '🎯', 'pillar', 10, 1),
  ('pillar-2-10', 'Growth Master', 'Completed 10 Growth Mindset & Resilience challenges', '🌱', 'pillar', 10, 2),
  ('pillar-3-10', 'Social Star', 'Completed 10 Social Confidence & Communication challenges', '🦋', 'pillar', 10, 3),
  ('pillar-4-10', 'Purpose Pro', 'Completed 10 Purpose & Strength Discovery challenges', '🎯', 'pillar', 10, 4); 