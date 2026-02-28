import { query } from './pg';
import type { ChartData, Panchang, DashaPeriod } from '../types';

export interface KundliChartRow {
  id: string;
  name: string;
  dob: string;
  time_of_birth: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
  chart_data: ChartData;
  dasha_data: { periods: DashaPeriod[]; flow: string };
  panchang_data: Panchang | null;
  created_at: string;
}

export interface SaveKundliInput {
  name: string;
  dob: string;
  time_of_birth?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  chart_data: ChartData;
  dasha_data: { periods: DashaPeriod[]; flow: string };
  panchang_data?: Panchang | null;
}

/**
 * Find an existing chart with the same birth parameters, or insert a new one.
 * Returns the UUID.
 */
export async function saveKundliChart(input: SaveKundliInput): Promise<string | null> {
  const existing = await query<{ id: string }>(
    `SELECT id FROM kundli_charts
     WHERE dob = $1
       AND COALESCE(time_of_birth, '') = $2
       AND ROUND(CAST(latitude AS numeric), 4) = ROUND($3::numeric, 4)
       AND ROUND(CAST(longitude AS numeric), 4) = ROUND($4::numeric, 4)
     LIMIT 1`,
    [
      input.dob,
      input.time_of_birth ?? '',
      input.latitude ?? 0,
      input.longitude ?? 0,
    ],
  );

  if (existing.length > 0) {
    // Update name if it changed (same birth data, different display name)
    await query(
      `UPDATE kundli_charts SET name = $1 WHERE id = $2`,
      [input.name, existing[0].id],
    );
    return existing[0].id;
  }

  const rows = await query<{ id: string }>(
    `INSERT INTO kundli_charts (name, dob, time_of_birth, city, latitude, longitude, timezone, chart_data, dasha_data, panchang_data)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING id`,
    [
      input.name,
      input.dob,
      input.time_of_birth ?? null,
      input.city ?? null,
      input.latitude ?? null,
      input.longitude ?? null,
      input.timezone ?? null,
      JSON.stringify(input.chart_data),
      JSON.stringify(input.dasha_data),
      input.panchang_data ? JSON.stringify(input.panchang_data) : null,
    ],
  );

  return rows[0]?.id ?? null;
}

/**
 * Load a saved kundli chart by its UUID.
 */
export async function getKundliChart(id: string): Promise<KundliChartRow | null> {
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) return null;

  const rows = await query<KundliChartRow>(
    `SELECT id, name, dob::text, time_of_birth, city, latitude, longitude, timezone,
            chart_data, dasha_data, panchang_data, created_at::text
     FROM kundli_charts WHERE id = $1`,
    [id],
  );

  return rows[0] ?? null;
}
