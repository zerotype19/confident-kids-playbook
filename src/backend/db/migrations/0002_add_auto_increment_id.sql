-- First, check if the ID column exists and drop it if it does
DROP TABLE IF EXISTS subscriptions_temp;
CREATE TABLE subscriptions_temp AS SELECT * FROM subscriptions;
DROP TABLE subscriptions;

-- Recreate the subscriptions table with auto-incrementing ID
CREATE TABLE subscriptions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_end TEXT,
  cancel_at_period_end INTEGER DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Copy the data back
INSERT INTO subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan,
  status,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
)
SELECT 
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan,
  status,
  current_period_end,
  cancel_at_period_end,
  created_at,
  updated_at
FROM subscriptions_temp;

-- Clean up
DROP TABLE subscriptions_temp; 