
-- Sample seed data for Confidant D1 schema

-- Users
INSERT INTO users (id, email, name, auth_provider) VALUES
  ('user_1', 'parent@example.com', 'Parent One', 'google');

-- Families
INSERT INTO families (id, name) VALUES
  ('family_1', 'Smith Family');

-- Family Members
INSERT INTO family_members (id, user_id, family_id, role) VALUES
  ('fm_1', 'user_1', 'family_1', 'parent');

-- Children
INSERT INTO children (id, family_id, name, age_range, avatar_url) VALUES
  ('child_1', 'family_1', 'Ella', '6-9', 'https://example.com/avatar1.png'),
  ('child_2', 'family_1', 'Max', '3-5', 'https://example.com/avatar2.png');

-- Challenges
INSERT INTO challenges (id, title, description, goal, steps, example_dialogue, tip, pillar_id, age_range, difficulty_level) VALUES
  ('chal_1', 'Ask, Don’t Tell', 'Help your child problem-solve by asking, not telling.', 'Foster independent thinking.', '["Ask them how they might solve it", "Guide them to break down the problem"]', '"What do you think you could try?"', 'Don’t jump to answers too fast.', 1, '6-9', 1),
  ('chal_2', 'Try Again Muscle', 'Build resilience through repetition.', 'Normalize trying again.', '["Talk about mistakes", "Model retrying"]', '"Let’s try it together this time."', 'Trying again builds brain strength.', 2, '3-5', 1);

-- Journal Entries
INSERT INTO journal_entries (id, child_id, entry_text, mood_rating, tags) VALUES
  ('j1', 'child_1', 'Ella solved a problem by herself today.', 5, 'confidence,resilience'),
  ('j2', 'child_2', 'Max had a rough morning but calmed down after breathing.', 3, 'emotion,self-regulation');

-- Calendar Schedule
INSERT INTO calendar_schedule (id, child_id, date, pillar_id) VALUES
  ('cal_1', 'child_1', '2025-03-24', 2);

-- Practice Modules
INSERT INTO practice_modules (id, title, steps) VALUES
  ('pm_1', 'Handling Mistakes', '[{"prompt":"Your child spills milk. What do you say?","choices":[{"label":""You’re so clumsy!"","feedback":"Negative reaction. Try again.","score":0},{"label":""It’s okay, let’s clean it up together."","feedback":"Supportive and solution-focused.","score":1}]}]');

-- Subscriptions
INSERT INTO subscriptions (id, user_id, stripe_customer_id, plan) VALUES
  ('sub_1', 'user_1', 'cus_test123', 'premium');

-- Feature Flags
INSERT INTO feature_flags (id, key, enabled_for_plan) VALUES
  ('flag_1', 'premium.practice_modules', 'premium'),
  ('flag_2', 'premium.dashboard_insights', 'premium');
