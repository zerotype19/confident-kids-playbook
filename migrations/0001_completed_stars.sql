CREATE TABLE IF NOT EXISTS completed_stars (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  star_number INTEGER NOT NULL,
  date_completed DATETIME NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_completed_stars_child_id ON completed_stars(child_id); 