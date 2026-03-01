/**
 * Supabase client for browser (auth, client-side calls).
 * Uses PUBLIC_* env vars exposed by Vite to the client.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = (import.meta.env.PUBLIC_SUPABASE_URL as string)?.trim() ?? '';
const key = (import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string)?.trim() ?? '';

export const supabaseBrowser: SupabaseClient | null =
  url && key ? createClient(url, key) : null;
