-- Confidant Full Schema for Cloudflare D1

-- USERS & AUTH
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  auth_provider TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- FAMILIES
CREATE TABLE families (
  id TEXT PRIMARY KEY,
  name TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  family_id TEXT NOT NULL,
  role TEXT DEFAULT 'parent',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (family_id) REFERENCES families(id)
);

-- CHILDREN
CREATE TABLE children (
  id TEXT PRIMARY KEY,
  family_id TEXT NOT NULL,
  name TEXT NOT NULL,
  age_range TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (family_id) REFERENCES families(id)
);

-- CHALLENGES
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

-- CHALLENGE LOGS
CREATE TABLE challenge_logs (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  challenge_id TEXT NOT NULL,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  reflection TEXT,
  mood_rating INTEGER,
  FOREIGN KEY (child_id) REFERENCES children(id),
  FOREIGN KEY (challenge_id) REFERENCES challenges(id)
);

-- JOURNAL
CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  entry_text TEXT NOT NULL,
  mood_rating INTEGER,
  tags TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id)
);

-- CALENDAR
CREATE TABLE calendar_schedule (
  id TEXT PRIMARY KEY,
  child_id TEXT NOT NULL,
  date TEXT NOT NULL,
  pillar_id INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (child_id) REFERENCES children(id)
);

-- PRACTICE MODULES
CREATE TABLE practice_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  steps TEXT NOT NULL  -- JSON array of prompts/choices
);

-- SUBSCRIPTIONS
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  plan TEXT DEFAULT 'free',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- FEATURE FLAGS (optional, for experimentation or gating)
CREATE TABLE feature_flags (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL,
  enabled_for_plan TEXT  -- 'free', 'premium'
); 