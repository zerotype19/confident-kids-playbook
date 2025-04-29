-- Add temp_family_id column to users table
ALTER TABLE users ADD COLUMN temp_family_id TEXT REFERENCES families(id); 