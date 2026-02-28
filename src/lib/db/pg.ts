/**
 * PostgreSQL client using DATABASE_URL (Supabase connection string).
 * Loads .env from project root if DATABASE_URL is not set (for API routes).
 * Uses globalThis so the pool is shared across all API route bundles (Astro/Vite).
 */
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { join } from 'path';

const GLOBAL_POOL_KEY = '__star_yaar_pg_pool';

function getGlobalPool(): Pool | null {
  if (typeof globalThis !== 'undefined' && (globalThis as Record<string, unknown>)[GLOBAL_POOL_KEY] instanceof Pool) {
    return (globalThis as Record<string, Pool | null>)[GLOBAL_POOL_KEY];
  }
  return null;
}

function setGlobalPool(pool: Pool | null): void {
  if (typeof globalThis !== 'undefined') {
    (globalThis as Record<string, Pool | null>)[GLOBAL_POOL_KEY] = pool;
  }
}

function getConnectionString(): string {
  if (typeof process === 'undefined') return '';
  let url = (process.env.DATABASE_URL ?? '').trim();
  if (!url && process.cwd) {
    dotenv.config({ path: join(process.cwd(), '.env') });
    url = (process.env.DATABASE_URL ?? '').trim();
  }
  return url;
}

/**
 * Get a shared pool (shared via globalThis across API routes). Loads .env if DATABASE_URL not set.
 */
export function getPool(): Pool | null {
  let pool = getGlobalPool();
  if (pool) return pool;
  const url = getConnectionString();
  if (!url) return null;
  pool = new Pool({
    connectionString: url,
    ssl: url.includes('supabase.co') ? { rejectUnauthorized: false } : undefined,
  });
  setGlobalPool(pool);
  return pool;
}

/** For debugging: is the API process able to see env and create a pool? */
export function getConnectionDebug(): {
  hasProcess: boolean;
  cwd: string;
  hasDatabaseUrl: boolean;
  poolCreated: boolean;
} {
  const hasProcess = typeof process !== 'undefined';
  const cwd = hasProcess && process.cwd ? process.cwd() : '';
  const url = getConnectionString();
  const pool = getPool();
  return {
    hasProcess,
    cwd,
    hasDatabaseUrl: url.length > 0,
    poolCreated: pool !== null,
  };
}

/**
 * Run a query. Returns rows or [] on error. Ensure load-env is imported first.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params?: unknown[]
): Promise<T[]> {
  const pool = getPool();
  if (!pool) return [];
  try {
    const result = await pool.query(sql, params);
    return (result.rows as T[]) ?? [];
  } catch (err) {
    console.error('[db] query error:', err);
    return [];
  }
}
