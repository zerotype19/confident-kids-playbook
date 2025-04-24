-- Family invites table
CREATE TABLE IF NOT EXISTS family_invites (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (family_id) REFERENCES families(id) ON DELETE CASCADE
);

-- Create indexes for family_invites
CREATE INDEX IF NOT EXISTS idx_family_invites_family_id ON family_invites(family_id);
CREATE INDEX IF NOT EXISTS idx_family_invites_email ON family_invites(email);
CREATE INDEX IF NOT EXISTS idx_family_invites_expires_at ON family_invites(expires_at); 