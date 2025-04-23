-- Create challenge_reflections table
CREATE TABLE IF NOT EXISTS challenge_reflections (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  feeling INTEGER NOT NULL CHECK (feeling BETWEEN 1 AND 5),
  reflection TEXT,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_challenge_reflections_child_id ON challenge_reflections(child_id);
CREATE INDEX IF NOT EXISTS idx_challenge_reflections_challenge_id ON challenge_reflections(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_reflections_timestamp ON challenge_reflections(timestamp); 