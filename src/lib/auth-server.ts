import { supabase } from './supabase';

/**
 * Get the authenticated user's ID from the request's Authorization header.
 * Returns null if no valid Bearer token or if Supabase is not configured.
 */
export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  if (!supabase) return null;
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  if (!token) return null;
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user.id;
}
