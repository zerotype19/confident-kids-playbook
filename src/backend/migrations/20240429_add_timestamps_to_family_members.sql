-- Add timestamp columns to family_members table
ALTER TABLE family_members ADD COLUMN created_at TEXT;
ALTER TABLE family_members ADD COLUMN updated_at TEXT; 