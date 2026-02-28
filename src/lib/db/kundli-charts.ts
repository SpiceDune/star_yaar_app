import { supabase } from '../supabase';
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
  if (!supabase) return null;

  const lat = Math.round((input.latitude ?? 0) * 10000) / 10000;
  const lon = Math.round((input.longitude ?? 0) * 10000) / 10000;
  const tob = input.time_of_birth ?? '';

  const { data: existing } = await supabase
    .from('kundli_charts')
    .select('id')
    .eq('dob', input.dob)
    .eq('time_of_birth', tob || null)
    .gte('latitude', lat - 0.0001)
    .lte('latitude', lat + 0.0001)
    .gte('longitude', lon - 0.0001)
    .lte('longitude', lon + 0.0001)
    .limit(1);

  if (existing && existing.length > 0) {
    await supabase
      .from('kundli_charts')
      .update({ name: input.name })
      .eq('id', existing[0].id);
    return existing[0].id;
  }

  const { data: inserted, error } = await supabase
    .from('kundli_charts')
    .insert({
      name: input.name,
      dob: input.dob,
      time_of_birth: input.time_of_birth ?? null,
      city: input.city ?? null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      timezone: input.timezone ?? null,
      chart_data: input.chart_data,
      dasha_data: input.dasha_data,
      panchang_data: input.panchang_data ?? null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[kundli-charts] insert error:', error.message);
    return null;
  }

  return inserted?.id ?? null;
}

/**
 * Load a saved kundli chart by its UUID.
 */
export async function getKundliChart(id: string): Promise<KundliChartRow | null> {
  if (!supabase) return null;
  const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) return null;

  const { data, error } = await supabase
    .from('kundli_charts')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) return null;
  return data as KundliChartRow;
}
