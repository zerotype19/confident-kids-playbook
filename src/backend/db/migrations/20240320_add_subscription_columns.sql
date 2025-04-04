-- Add subscription-related columns to users table
ALTER TABLE users
ADD COLUMN subscription_status TEXT,
ADD COLUMN subscription_id TEXT,
ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP; 