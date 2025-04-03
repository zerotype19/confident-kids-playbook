-- First, delete existing pillar-specific rewards
DELETE FROM rewards WHERE type = 'pillar';

-- Insert updated pillar-specific rewards
INSERT INTO rewards (id, title, description, icon, type, criteria_value, pillar_id) VALUES
  ('pillar-1-3', 'Independence Explorer', 'Completed 3 Independence & Problem-Solving challenges', '🎯', 'pillar', 3, 1),
  ('pillar-2-3', 'Growth Champion', 'Completed 3 Growth Mindset & Resilience challenges', '🌱', 'pillar', 3, 2),
  ('pillar-3-3', 'Social Butterfly', 'Completed 3 Social Confidence & Communication challenges', '🦋', 'pillar', 3, 3),
  ('pillar-4-3', 'Purpose Pioneer', 'Completed 3 Purpose & Strength Discovery challenges', '🎯', 'pillar', 3, 4),
  ('pillar-5-3', 'Fearless Explorer', 'Completed 3 Managing Fear & Anxiety challenges', '��', 'pillar', 3, 5); 