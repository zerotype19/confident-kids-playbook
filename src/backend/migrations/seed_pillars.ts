import { D1Database } from '@cloudflare/workers-types';

const pillars = [
  {
    id: 1,
    name: 'Self-Awareness',
    description: 'Understanding your own emotions, thoughts, and values, and how they influence your behavior.',
    icon: '🎯',
    color: '#FF6B6B'
  },
  {
    id: 2,
    name: 'Self-Management',
    description: 'Managing your emotions and behaviors in different situations, including stress management and self-motivation.',
    icon: '⚡',
    color: '#4ECDC4'
  },
  {
    id: 3,
    name: 'Social Awareness',
    description: 'Understanding and empathizing with others, including their emotions, perspectives, and cultural differences.',
    icon: '👥',
    color: '#45B7D1'
  },
  {
    id: 4,
    name: 'Relationship Skills',
    description: 'Building and maintaining healthy relationships, including communication, teamwork, and conflict resolution.',
    icon: '🤝',
    color: '#96CEB4'
  },
  {
    id: 5,
    name: 'Responsible Decision-Making',
    description: 'Making constructive choices about personal behavior and social interactions based on ethical standards, safety concerns, and social norms.',
    icon: '🎯',
    color: '#FFEEAD'
  }
];

export async function seedPillars(db: D1Database) {
  console.log('🌱 Seeding pillars...');

  for (const pillar of pillars) {
    await db.prepare(`
      INSERT OR REPLACE INTO pillars (id, name, description, icon, color)
      VALUES (?, ?, ?, ?, ?)
    `).bind(
      pillar.id,
      pillar.name,
      pillar.description,
      pillar.icon,
      pillar.color
    ).run();
  }

  console.log('✅ Pillars seeded successfully');
} 