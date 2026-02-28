import type { APIRoute } from 'astro';
import { computeTransits } from '../../lib/compute-transits';
import type { ChartData, RashiId } from '../../lib/types';

const RASHI_ORDER: RashiId[] = [
  'Mesha', 'Vrishabha', 'Mithuna', 'Karka', 'Simha', 'Kanya',
  'Tula', 'Vrishchika', 'Dhanu', 'Makara', 'Kumbha', 'Meena',
];

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const GET: APIRoute = async ({ url }) => {
  const dateStr = url.searchParams.get('date');
  const lagna = (url.searchParams.get('lagna') ?? 'Mesha') as RashiId;

  if (!RASHI_ORDER.includes(lagna)) {
    return new Response(JSON.stringify({ error: 'Invalid lagna' }), { status: 400, headers });
  }

  const lagnaIdx = RASHI_ORDER.indexOf(lagna);
  const minimalChart: ChartData = {
    lagna,
    houses: Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [
        i + 1,
        { rashi: RASHI_ORDER[(lagnaIdx + i) % 12], planets: [] },
      ])
    ) as ChartData['houses'],
  };

  let targetDate: Date | undefined;
  if (dateStr) {
    const parsed = new Date(dateStr + 'T12:00:00Z');
    if (!isNaN(parsed.getTime())) targetDate = parsed;
  }

  const result = await computeTransits(minimalChart, targetDate);
  if (!result) {
    return new Response(JSON.stringify({ error: 'Could not compute transits' }), { status: 500, headers });
  }

  return new Response(JSON.stringify(result), { status: 200, headers });
};
