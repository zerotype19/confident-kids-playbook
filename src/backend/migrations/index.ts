import { D1Database } from '@cloudflare/workers-types';
import { createUsersTable } from './create_users_table';
import { createChildrenTable } from './create_children_table';
import { createChallengesTable } from './create_challenges_table';
import { createChallengeCompletionsTable } from './create_challenge_completions_table';
import { createPillarsTable } from './create_pillars_table';
import { seedPillars } from './seed_pillars';

export async function runMigrations(db: D1Database) {
  console.log('🚀 Starting database migrations...');

  // Create tables
  await createUsersTable(db);
  await createChildrenTable(db);
  await createChallengesTable(db);
  await createChallengeCompletionsTable(db);
  await createPillarsTable(db);

  // Seed data
  await seedPillars(db);

  console.log('✅ All migrations completed successfully');
} 