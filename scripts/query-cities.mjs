/**
 * Standalone script to test cities queries with DATABASE_URL + pg.
 * Same logic as the API route – run outside Astro to verify DB and query work.
 *
 * Usage: node scripts/query-cities.mjs [search-term]
 * Examples:
 *   node scripts/query-cities.mjs          # simple: 10 rows, no filter
 *   node scripts/query-cities.mjs agra     # search by name/search_text
 */
import dotenv from 'dotenv';
import pg from 'pg';
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

const searchTerm = process.argv[2];

async function main() {
  const client = new pg.Client({
    connectionString: url,
    ssl: url.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  });

  try {
    await client.connect();
    console.log('Connected to database.\n');

    if (!searchTerm || searchTerm.trim().length < 2) {
      console.log('Running simple query: SELECT id, name, state, country FROM cities ORDER BY id LIMIT 10');
      const r = await client.query(
        'SELECT id, name, state, country FROM cities ORDER BY id LIMIT 10'
      );
      console.log('Row count:', r.rows.length);
      console.log('Sample:', JSON.stringify(r.rows, null, 2));
      return;
    }

    const pattern = `%${searchTerm.trim()}%`;
    console.log('Running search: name ILIKE $1 OR search_text ILIKE $1, pattern =', pattern);
    const r = await client.query(
      `SELECT id, name, state, country FROM cities WHERE name ILIKE $1 OR search_text ILIKE $1 ORDER BY population DESC NULLS LAST LIMIT 20`,
      [pattern]
    );
    console.log('Row count:', r.rows.length);
    console.log('Results:', JSON.stringify(r.rows, null, 2));
  } catch (err) {
    console.error('Query failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
