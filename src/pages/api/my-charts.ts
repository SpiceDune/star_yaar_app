import type { APIRoute } from 'astro';
import { getUserIdFromRequest } from '../../lib/auth-server';
import { supabase } from '../../lib/supabase';

export const GET: APIRoute = async ({ request }) => {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (!supabase) {
    return new Response(
      JSON.stringify({ error: 'Service unavailable' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const { data, error } = await supabase
    .from('kundli_charts')
    .select('id, name, dob, city, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[api/my-charts]', error.message);
    return new Response(
      JSON.stringify({ error: 'Failed to load charts' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return new Response(JSON.stringify({ charts: data ?? [] }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
