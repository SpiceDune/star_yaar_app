/**
 * Run migration: add user_id to kundli_charts.
 * Usage: node scripts/run-migration-user-id.mjs
 */
import dotenv from 'dotenv';
import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
dotenv.config({ path: join(root, '.env') });
dotenv.config({ path: join(root, '.env.local') });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('Missing DATABASE_URL in .env');
  process.exit(1);
}

const sql = readFileSync(
  join(root, 'supabase/migrations/20250228000003_add_kundli_charts_user_id.sql'),
  'utf-8'
);

async function main() {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration applied: user_id added to kundli_charts.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
