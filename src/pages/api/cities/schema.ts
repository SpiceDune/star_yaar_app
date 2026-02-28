/**
 * GET /api/cities/schema – return one row from cities table to inspect column names.
 * Remove or restrict in production.
 */
import '../../../lib/load-env';
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async () => {
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Supabase not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const { data, error } = await supabase
    .from('cities')
    .select('*')
    .limit(1);
  if (error) {
    return new Response(JSON.stringify({ error: error.message, code: error.code }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const row = data?.[0] as Record<string, unknown> | undefined;
  const columns = row ? Object.keys(row) : [];
  const suggested = {
    CITIES_NAME_COLUMN: columns.find((c) => /name|city/i.test(c)) || 'name',
    CITIES_STATE_COLUMN: columns.find((c) => /state|admin|region/i.test(c)) || 'state',
    CITIES_COUNTRY_COLUMN: columns.find((c) => /country/i.test(c)) || 'country',
  };
  return new Response(
    JSON.stringify({
      columns,
      sample: row,
      suggestedEnv: suggested,
      hint: 'Add these to .env if your columns differ, then restart dev server.',
    }, null, 2),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
};
