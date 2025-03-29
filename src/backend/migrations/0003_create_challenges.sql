-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  goal TEXT NOT NULL,
  steps TEXT NOT NULL, -- JSON array of strings
  example_dialogue TEXT NOT NULL,
  tip TEXT NOT NULL,
  pillar TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial challenge
INSERT INTO challenges (
  id,
  title,
  description,
  goal,
  steps,
  example_dialogue,
  tip,
  pillar
) VALUES (
  'challenge_001',
  'Ask, Don''t Tell',
  'Help your child develop problem-solving skills by asking questions instead of giving direct instructions.',
  'Encourage independent thinking and decision-making in your child',
  json_array(
    'Start with open-ended questions',
    'Listen without interrupting',
    'Guide them to find their own solutions',
    'Celebrate their problem-solving attempts'
  ),
  'Instead of saying "Put your toys away", try "What do you think would be a good way to organize your toys?"',
  'Remember to give your child time to think and respond. Silence is okay!',
  'Problem Solving'
); 