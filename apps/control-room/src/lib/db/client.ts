/**
 * Database client — wraps Supabase service-role client.
 * Uses service-role key server-side only. Never expose to client.
 */
import { createClient } from '@supabase/supabase-js';

function getDb() {
  // SUPABASE_URL (server-only) or NEXT_PUBLIC_SUPABASE_URL (both) as fallback
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

export const db = getDb();
export const dbAvailable = () => db !== null;
