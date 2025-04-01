-- Create pillars table
CREATE TABLE IF NOT EXISTS pillars (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed pillars data
INSERT OR REPLACE INTO pillars (id, name, description, icon, color) VALUES
  (1, 'Self-Awareness', 'Understanding your own emotions, thoughts, and values, and how they influence your behavior.', '🎯', '#FF6B6B'),
  (2, 'Self-Management', 'Managing your emotions and behaviors in different situations, including stress management and self-motivation.', '⚡', '#4ECDC4'),
  (3, 'Social Awareness', 'Understanding and empathizing with others, including their emotions, perspectives, and cultural differences.', '👥', '#45B7D1'),
  (4, 'Relationship Skills', 'Building and maintaining healthy relationships, including communication, teamwork, and conflict resolution.', '🤝', '#96CEB4'),
  (5, 'Responsible Decision-Making', 'Making constructive choices about personal behavior and social interactions based on ethical standards, safety concerns, and social norms.', '🎯', '#FFEEAD'); 