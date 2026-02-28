/**
 * Supabase client – per https://docs.astro.build/en/guides/backend/supabase/
 * Prefers import.meta.env; falls back to process.env when API routes load .env first.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

function getUrl(): string {
  const fromMeta =
    (import.meta.env?.SUPABASE_URL as string) || (import.meta.env?.PUBLIC_SUPABASE_URL as string) || '';
  if (fromMeta.trim()) return fromMeta.trim();
  if (typeof process !== 'undefined' && process.env) {
    return (process.env.SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL || '').trim();
  }
  return '';
}

function getKey(): string {
  const fromMeta =
    (import.meta.env?.SUPABASE_ANON_KEY as string) ||
    (import.meta.env?.PUBLIC_SUPABASE_ANON_KEY as string) ||
    '';
  if (fromMeta.trim()) return fromMeta.trim();
  if (typeof process !== 'undefined' && process.env) {
    return (process.env.SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY || '').trim();
  }
  return '';
}

const url = getUrl();
const key = getKey();

export const supabase: SupabaseClient | null = url && key ? createClient(url, key) : null;
