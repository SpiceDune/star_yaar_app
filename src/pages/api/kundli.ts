import type { APIRoute } from 'astro';
import { computeKundli } from '../../lib/compute-kundli';
import { getPanchangByDate } from '../../lib/db/panchang';
import { saveKundliChart } from '../../lib/db/kundli-charts';
import { getCityLatLon } from '../../lib/db/cities';
import { getUserIdFromRequest } from '../../lib/auth-server';

export const POST: APIRoute = async ({ request }) => {
  try {
    const userId = await getUserIdFromRequest(request);

    const body = await request.json();
    let { name, dob, time, city, lat, lon, timezone } = body as {
      name?: string;
      dob?: string;
      time?: string;
      city?: string;
      lat?: number;
      lon?: number;
      timezone?: string;
    };

    if (!name || !dob) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: name, dob' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }

    if (lat == null || lon == null) {
      if (city) {
        const resolved = await getCityLatLon(city);
        if (resolved) {
          lat = resolved.lat;
          lon = resolved.lon;
          timezone = timezone || resolved.timezone;
        }
      }
      if (lat == null || lon == null) {
        return new Response(
          JSON.stringify({ error: 'Could not determine location. Please provide latitude and longitude, or a valid city name.' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } },
        );
      }
    }

    const timeForCompute = (time ?? '').replace(/\s*(AM|PM)$/i, '').trim() || '12:00';

    const computed = await computeKundli({
      dob,
      time: timeForCompute,
      lat,
      lon,
      timezone: timezone || 'Asia/Kolkata',
    });

    if (!computed) {
      return new Response(
        JSON.stringify({ error: 'Kundli computation failed' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const panchang = await getPanchangByDate(dob);

    const id = await saveKundliChart({
      name,
      dob,
      time_of_birth: time || undefined,
      city,
      latitude: lat,
      longitude: lon,
      timezone,
      chart_data: computed.chartData,
      dasha_data: computed.dasha,
      panchang_data: panchang,
      user_id: userId ?? undefined,
    });

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Failed to save chart to database' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ id }),
      { status: 201, headers: { 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    console.error('[api/kundli] POST error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', detail: String(err) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
};
