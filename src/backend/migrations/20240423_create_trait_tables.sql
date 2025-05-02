-- Create challenge_traits table
CREATE TABLE IF NOT EXISTS challenge_traits (
  challenge_id TEXT NOT NULL,     -- FK to challenges.id
  trait_id INTEGER NOT NULL,      -- FK to traits.id
  weight REAL NOT NULL CHECK (weight >= 0 AND weight <= 1),
  PRIMARY KEY (challenge_id, trait_id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id),
  FOREIGN KEY (trait_id) REFERENCES traits(id)
);

-- Create child_trait_scores table
CREATE TABLE IF NOT EXISTS child_trait_scores (
  child_id TEXT NOT NULL,       -- FK to children.id
  trait_id INTEGER NOT NULL,    -- FK to traits.id
  score REAL DEFAULT 0,         -- Rolling total score for trait
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (child_id, trait_id),
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (trait_id) REFERENCES traits(id)
);

-- Create trait_score_history table
CREATE TABLE IF NOT EXISTS trait_score_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,   -- Optional auto ID for ordering
  child_id TEXT NOT NULL,                 -- FK to children.id
  trait_id INTEGER NOT NULL,              -- FK to traits.id
  challenge_id TEXT NOT NULL,             -- FK to challenges.id
  score_delta REAL NOT NULL,              -- How much the trait grew
  emoji_slider INTEGER,                   -- Optional: how confident the child felt (1–5)
  reflection TEXT,                        -- Optional: child's reflection
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (trait_id) REFERENCES traits(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_challenge_traits_challenge_id ON challenge_traits(challenge_id);
CREATE INDEX IF NOT EXISTS idx_challenge_traits_trait_id ON challenge_traits(trait_id);
CREATE INDEX IF NOT EXISTS idx_child_trait_scores_child_id ON child_trait_scores(child_id);
CREATE INDEX IF NOT EXISTS idx_child_trait_scores_trait_id ON child_trait_scores(trait_id);
CREATE INDEX IF NOT EXISTS idx_trait_score_history_child_id ON trait_score_history(child_id);
CREATE INDEX IF NOT EXISTS idx_trait_score_history_trait_id ON trait_score_history(trait_id);
CREATE INDEX IF NOT EXISTS idx_trait_score_history_challenge_id ON trait_score_history(challenge_id); 