-- First, delete all existing rewards
DELETE FROM rewards;

-- Insert milestone rewards (no pillar association)
INSERT INTO rewards (id, title, description, icon, type, criteria_value) VALUES
  ('milestone-5', 'First Steps', 'Completed 5 challenges', '🌟', 'milestone', 5),
  ('milestone-10', 'Getting Started', 'Completed 10 challenges', '⭐', 'milestone', 10),
  ('milestone-20', 'On a Roll', 'Completed 20 challenges', '✨', 'milestone', 20);

-- Insert streak rewards (no pillar association)
INSERT INTO rewards (id, title, description, icon, type, criteria_value) VALUES
  ('streak-3', 'Three Day Streak', 'Maintained a 3-day streak', '🔥', 'streak', 3),
  ('streak-5', 'Five Day Streak', 'Maintained a 5-day streak', '🔥', 'streak', 5),
  ('streak-10', 'Ten Day Streak', 'Maintained a 10-day streak', '🔥', 'streak', 10);

-- Insert pillar-specific rewards
INSERT INTO rewards (id, title, description, icon, type, criteria_value, pillar_id) VALUES
  ('pillar-1-3', 'Independence Explorer', 'Completed 3 Independence & Problem-Solving challenges', '🎯', 'pillar', 3, 1),
  ('pillar-2-3', 'Growth Champion', 'Completed 3 Growth Mindset & Resilience challenges', '🌱', 'pillar', 3, 2),
  ('pillar-3-3', 'Social Butterfly', 'Completed 3 Social Confidence & Communication challenges', '🦋', 'pillar', 3, 3),
  ('pillar-4-3', 'Purpose Pioneer', 'Completed 3 Purpose & Strength Discovery challenges', '🎯', 'pillar', 3, 4),
  ('pillar-5-3', 'Fearless Explorer', 'Completed 3 Managing Fear & Anxiety challenges', '��', 'pillar', 3, 5); 