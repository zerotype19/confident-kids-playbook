-- Drop existing tables that are not in schema.sql
DROP TABLE IF EXISTS media_records;
DROP TABLE IF EXISTS subscriptions;

-- Update users table
ALTER TABLE users ADD COLUMN auth_provider TEXT;
ALTER TABLE users ADD COLUMN has_completed_onboarding BOOLEAN DEFAULT FALSE;

-- Update families table
ALTER TABLE families DROP COLUMN updated_at;

-- Update family_members table
ALTER TABLE family_members DROP COLUMN updated_at;
ALTER TABLE family_members DROP COLUMN role;
ALTER TABLE family_members ADD COLUMN role TEXT DEFAULT 'owner';

-- Update children table
ALTER TABLE children DROP COLUMN updated_at;
ALTER TABLE children DROP COLUMN age;
ALTER TABLE children ADD COLUMN age_range TEXT NOT NULL;

-- Create challenges table
CREATE TABLE challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  goal TEXT,
  steps TEXT,
  example_dialogue TEXT,
  tip TEXT,
  pillar_id INTEGER,
  age_range TEXT,
  difficulty_level INTEGER
);

-- Create challenge_logs table
CREATE TABLE challenge_logs (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reflection TEXT,
  mood_rating INTEGER NULL,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

-- Create journal_entries table
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  entry_text TEXT NOT NULL,
  mood_rating INTEGER,
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id)
);

-- Create calendar_schedule table
CREATE TABLE calendar_schedule (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  date TEXT NOT NULL,
  pillar_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id)
);

-- Create practice_modules table
CREATE TABLE practice_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  steps TEXT NOT NULL  -- JSON array of prompts/choices
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'free',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create feature_flags table
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  enabled_for_plan TEXT  -- 'free', 'premium'
); 