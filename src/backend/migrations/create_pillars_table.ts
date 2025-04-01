import { D1Database } from '@cloudflare/workers-types';

export async function createPillarsTable(db: D1Database) {
  console.log('🔄 Creating pillars table...');

  await db.prepare(`
    CREATE TABLE IF NOT EXISTS pillars (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  console.log('✅ Pillars table created successfully');
} 