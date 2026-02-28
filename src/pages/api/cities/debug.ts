/** GET /api/cities/debug – check if Supabase is configured (for troubleshooting). */
import '../../../lib/load-env';
import type { APIRoute } from 'astro';
import { supabase } from '../../../lib/supabase';

export const GET: APIRoute = async () => {
  const fromMeta = !!(import.meta.env?.PUBLIC_SUPABASE_URL as string);
  const fromProcess = !!(typeof process !== 'undefined' && process.env?.PUBLIC_SUPABASE_URL);
  const configured = !!supabase;
  let count: number | null = null;
  let countError: string | null = null;
  if (supabase) {
    const { count: c, error } = await supabase.from('cities').select('*', { count: 'exact', head: true });
    count = c ?? null;
    countError = error?.message ?? null;
  }
  return new Response(
    JSON.stringify({
      configured,
      envFromMeta: fromMeta,
      envFromProcess: fromProcess,
      citiesCount: count,
      citiesError: countError,
      hint: !configured
        ? 'Add SUPABASE_URL and SUPABASE_ANON_KEY (or PUBLIC_*) to .env'
        : count === 0 && !countError
          ? 'Supabase OK but cities table is empty. Run seed or add cities.'
          : countError
            ? `Supabase error: ${countError}`
            : 'OK',
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
};
