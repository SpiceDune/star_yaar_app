/**
 * Cities table – search for birth city autocomplete.
 * Uses Supabase client per https://docs.astro.build/en/guides/backend/supabase/
 * Schema: cities (id, name, state, country, country_code, latitude, longitude, timezone, population, search_text)
 */
import { supabase } from '../supabase';

export interface CityOption {
  id: string | number;
  name: string;
  state: string;
  country: string;
  label: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
}

function rowToOption(row: {
  id: number;
  name: string | null;
  state: string | null;
  country: string | null;
  latitude?: number | null;
  longitude?: number | null;
  timezone?: string | null;
}): CityOption {
  const name = (row.name ?? '').toString().trim();
  const state = (row.state ?? '').toString().trim();
  const country = (row.country ?? '').toString().trim();
  return {
    id: row.id ?? '',
    name,
    state,
    country,
    label: [name, state, country].filter(Boolean).join(', '),
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    timezone: row.timezone ?? undefined,
  };
}

/**
 * Search cities by name. Returns up to 20 matches (by population).
 */
export async function searchCities(searchQuery: string): Promise<CityOption[]> {
  if (!supabase || !searchQuery || searchQuery.trim().length < 2) return [];
  const q = searchQuery.trim().replace(/%/g, '').replace(/_/g, ' ');
  const pattern = `%${q}%`;
  const { data, error } = await supabase
    .from('cities')
    .select('id, name, state, country, latitude, longitude, timezone')
    .ilike('name', pattern)
    .order('population', { ascending: false, nullsFirst: false })
    .limit(20);
  if (error) {
    console.error('[cities] searchCities:', error.message);
    return [];
  }
  return (data ?? []).map(rowToOption);
}

/** Get first matching city's lat/lon/timezone by label (e.g. "Mumbai, Maharashtra, India") or name. */
export async function getCityLatLon(labelOrName: string): Promise<{ lat: number; lon: number; timezone?: string } | null> {
  if (!supabase || !labelOrName?.trim()) return null;
  const firstPart = labelOrName.split(',')[0]?.trim() || labelOrName.trim();
  const pattern = `%${firstPart.replace(/%/g, '').replace(/_/g, ' ')}%`;
  const { data, error } = await supabase
    .from('cities')
    .select('latitude, longitude, timezone')
    .ilike('name', pattern)
    .not('latitude', 'is', null)
    .not('longitude', 'is', null)
    .order('population', { ascending: false, nullsFirst: false })
    .limit(1);
  if (error || !data?.length) return null;
  const row = data[0];
  if (row.latitude == null || row.longitude == null) return null;
  return {
    lat: Number(row.latitude),
    lon: Number(row.longitude),
    timezone: row.timezone ?? undefined,
  };
}
