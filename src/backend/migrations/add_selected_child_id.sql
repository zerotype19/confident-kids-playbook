-- Add selected_child_id column to users table
ALTER TABLE users ADD COLUMN selected_child_id TEXT REFERENCES children(id); 