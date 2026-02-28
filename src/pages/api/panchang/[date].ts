/**
 * GET /api/panchang/[date] – return panchang for YYYY-MM-DD.
 * Uses Supabase panchang table (1970–2040, reference Delhi).
 */
import '../../../lib/load-env';
import type { APIRoute } from 'astro';
import { getPanchangByDate } from '../../../lib/db/panchang';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const GET: APIRoute = async ({ params }) => {
  const date = params.date;
  if (!date || !DATE_REGEX.test(date)) {
    return new Response(JSON.stringify({ error: 'Invalid date; use YYYY-MM-DD' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const panchang = await getPanchangByDate(date);
  if (!panchang) {
    return new Response(JSON.stringify({ error: 'Panchang not found for this date' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify(panchang), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=86400',
    },
  });
};
