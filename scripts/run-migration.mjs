/**
 * Run panchang migration (create table) using DATABASE_URL.
 * Get the connection string from Supabase Dashboard → Project Settings → Database → Connection string (URI).
 *
 * Usage: node scripts/run-migration.mjs
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
  console.error('Missing DATABASE_URL in .env (or .env.local)');
  console.error('Checked:', join(root, '.env'), 'and', join(root, '.env.local'));
  console.error('Get it from: Supabase Dashboard → Project Settings → Database → Connection string (URI)');
  process.exit(1);
}

const sql = readFileSync(
  join(__dirname, '../supabase/migrations/20250227000001_create_panchang.sql'),
  'utf-8'
);

async function main() {
  const client = new pg.Client({ connectionString: url });
  try {
    await client.connect();
    await client.query(sql);
    console.log('Migration applied: panchang table created.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
