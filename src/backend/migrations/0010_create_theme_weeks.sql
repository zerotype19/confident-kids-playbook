-- Create theme_weeks table
CREATE TABLE IF NOT EXISTS theme_weeks (
  id TEXT PRIMARY KEY,
  week_number INTEGER NOT NULL,
  pillar_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pillar_id) REFERENCES pillars(id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_theme_weeks_week_number ON theme_weeks(week_number);

-- Seed initial theme weeks data (first 12 weeks)
INSERT INTO theme_weeks (id, week_number, pillar_id, title, description) VALUES
  ('tw_1', 1, 1, 'Self-Awareness Week', 'Focus on understanding your emotions and thoughts'),
  ('tw_2', 2, 2, 'Self-Management Week', 'Learn to manage emotions and behaviors effectively'),
  ('tw_3', 3, 3, 'Social Awareness Week', 'Develop empathy and understanding of others'),
  ('tw_4', 4, 4, 'Relationship Skills Week', 'Build stronger connections with others'),
  ('tw_5', 5, 5, 'Decision-Making Week', 'Make better choices in different situations'),
  ('tw_6', 6, 1, 'Emotional Intelligence Week', 'Deepen your emotional understanding'),
  ('tw_7', 7, 2, 'Resilience Week', 'Build strength to overcome challenges'),
  ('tw_8', 8, 3, 'Empathy Week', 'Walk in others'' shoes'),
  ('tw_9', 9, 4, 'Communication Week', 'Express yourself clearly and listen effectively'),
  ('tw_10', 10, 5, 'Problem-Solving Week', 'Find solutions to everyday challenges'),
  ('tw_11', 11, 1, 'Self-Discovery Week', 'Learn more about yourself'),
  ('tw_12', 12, 2, 'Growth Mindset Week', 'Embrace challenges as opportunities'); 