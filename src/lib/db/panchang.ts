/**
 * Panchang DB helpers – fetch by date from Supabase.
 */
import { supabase } from '../supabase';
import type { Panchang } from '../types';

export interface PanchangRow {
  id: string;
  date: string;
  tithi: string;
  nakshatra: string;
  nakshatra_pada: number | null;
  yoga: string | null;
  karana: string | null;
  vara: string;
  vara_english: string | null;
  lagna: string | null;
  lagna_english: string | null;
}

function rowToPanchang(row: PanchangRow): Panchang {
  return {
    lagna: row.lagna ?? '',
    lagnaEnglish: row.lagna_english ?? undefined,
    tithi: row.tithi,
    nakshatra: row.nakshatra,
    nakshatraPada: row.nakshatra_pada != null ? `Pada ${row.nakshatra_pada}` : undefined,
    yoga: row.yoga ?? '',
    karana: row.karana ?? '',
    vara: row.vara,
    varaEnglish: row.vara_english ?? undefined,
  };
}

/**
 * Get panchang for a given date (YYYY-MM-DD). Returns null if not found or Supabase not configured.
 */
export async function getPanchangByDate(date: string): Promise<Panchang | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('panchang')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error || !data) return null;
  return rowToPanchang(data as PanchangRow);
}
