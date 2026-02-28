/**
 * Load .env into process.env so API routes and server code can read it.
 * Import this first in any API route that uses Supabase.
 * Uses process.cwd() so the path is correct when running from bundled server.
 */
import dotenv from 'dotenv';
import { join } from 'path';

const root = typeof process !== 'undefined' && process.cwd ? process.cwd() : undefined;
if (root) {
  dotenv.config({ path: join(root, '.env') });
}
