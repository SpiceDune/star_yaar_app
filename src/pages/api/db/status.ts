/**
 * GET /api/db/status – check if the API can connect to the database (DATABASE_URL + pg).
 * Returns connection debug info and runs a test query. No secrets exposed.
 */
import '../../../lib/load-env';
import type { APIRoute } from 'astro';
import { getPool, getConnectionDebug } from '../../../lib/db/pg';

export const GET: APIRoute = async () => {
  const pool = getPool();
  const debug = getConnectionDebug();

  let testQuery: 'ok' | string = 'not_run';
  let citiesCount: number | null = null;
  if (pool) {
    try {
      await pool.query('SELECT 1 as ok');
      testQuery = 'ok';
    } catch (err) {
      testQuery = err instanceof Error ? err.message : String(err);
    }
    if (testQuery === 'ok') {
      try {
        const r = await pool.query<{ count: number }>('SELECT count(*)::int as count FROM cities');
        citiesCount = r.rows?.[0]?.count ?? null;
      } catch {
        // ignore
      }
    }
  }

  const connected = testQuery === 'ok';

  return new Response(
    JSON.stringify(
      {
        database: 'pg (DATABASE_URL)',
        connected,
        debug: {
          ...debug,
          testQuery,
          citiesCount,
        },
        hint: !debug.hasDatabaseUrl
          ? 'DATABASE_URL not set in API. Put it in .env at project root and restart dev server.'
          : !connected
            ? `Pool or query failed: ${testQuery}`
            : 'Database is connected.',
      },
      null,
      2
    ),
    { headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } }
  );
};
