/**
 * GET /api/cities?q=... – search cities for autocomplete.
 * Requires output: 'server' in astro.config so url.searchParams is populated.
 */
import '../../../lib/load-env';
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';
import { searchCities } from '../../../lib/db/cities';

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const GET: APIRoute = async ({ url }) => {
  if (!supabase) {
    return new Response(
      JSON.stringify({ error: 'Supabase not configured', cities: [] }),
      { status: 503, headers }
    );
  }
  const q = (url.searchParams.get('q') ?? '').trim();
  const cities = await searchCities(q);
  headers['Cache-Control'] = cities.length ? 'public, max-age=3600' : 'no-store';
  return new Response(JSON.stringify(cities), { status: 200, headers });
};
