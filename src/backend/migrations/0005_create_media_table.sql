CREATE TABLE IF NOT EXISTS media (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  key TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  size INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (child_id) REFERENCES children(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_media_child_id ON media(child_id);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media(created_at); 