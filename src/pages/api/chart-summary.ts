import type { APIRoute } from 'astro';
import { getUserIdFromRequest } from '../../lib/auth-server';
import { getKundliChart } from '../../lib/db/kundli-charts';
import { computeTransits } from '../../lib/compute-transits';

function normLabel(label: string): string {
  return label.replace(/\s+/g, '').toLowerCase();
}

export const GET: APIRoute = async ({ request }) => {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return new Response(
      JSON.stringify({ error: 'Unauthorized' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const url = new URL(request.url);
  const chartId = url.searchParams.get('id');
  if (!chartId) {
    return new Response(
      JSON.stringify({ error: 'Missing chart id' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const chart = await getKundliChart(chartId);
  if (!chart || chart.user_id !== userId) {
    return new Response(
      JSON.stringify({ error: 'Chart not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const transits = await computeTransits(chart.chart_data);

  let currentDasha: {
    maha: string; antar: string; pratyantar: string;
    mahStart: string; mahEnd: string;
    antStart: string; antEnd: string;
    praStart: string; praEnd: string;
    flow: string;
  } | null = null;

  if (chart.dasha_data?.periods) {
    const periods = chart.dasha_data.periods;
    const maha = periods.find(p => normLabel(p.label) === 'mahadasha');
    const antar = periods.find(p => normLabel(p.label) === 'antardasha');
    const pratyantar = periods.find(p => normLabel(p.label) === 'pratyantardasha');
    if (maha) {
      currentDasha = {
        maha: maha.planet,
        antar: antar?.planet ?? '',
        pratyantar: pratyantar?.planet ?? '',
        mahStart: maha.start, mahEnd: maha.end,
        antStart: antar?.start ?? '', antEnd: antar?.end ?? '',
        praStart: pratyantar?.start ?? '', praEnd: pratyantar?.end ?? '',
        flow: chart.dasha_data.flow ?? '',
      };
    }
  }

  return new Response(JSON.stringify({
    chart: {
      id: chart.id,
      name: chart.name,
      dob: chart.dob,
      city: chart.city,
      lagna: chart.chart_data?.lagna ?? null,
    },
    transits: transits?.planets ?? [],
    transitDate: transits?.date ?? null,
    currentDasha,
    panchang: chart.panchang_data,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
