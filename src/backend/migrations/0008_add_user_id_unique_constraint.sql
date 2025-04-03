-- Add unique constraint on user_id in subscriptions table
ALTER TABLE subscriptions ADD CONSTRAINT unique_user_id UNIQUE (user_id); 