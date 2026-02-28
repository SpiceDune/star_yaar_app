/**
 * GET /api/cities/raw?q=... – raw Supabase response for debugging. Remove in production.
 */
import '../../../lib/load-env';
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q') ?? 'tokyo';
  const pattern = `%${q.trim()}%`;
  const out: Record<string, unknown> = { q, pattern, hasClient: !!supabase };
  if (supabase) {
    const res = await supabase.from('cities').select('id, name, state, country').ilike('name', pattern).limit(5);
    out.data = res.data;
    out.error = res.error ? { message: res.error.message, code: res.error.code } : null;
  }
  return new Response(JSON.stringify(out, null, 2), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
};
