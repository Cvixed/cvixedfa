import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';
import { getSanitizedSupabaseUrl, getSanitizedSupabaseServiceKey } from './config';

export const OWNER_USER_ID = process.env.OWNER_USER_ID || '00000000-0000-0000-0000-000000000001';

/**
 * Server-only Supabase client using Service Role Key (bypasses RLS)
 * Perfect for single-owner personal deployment where security is handled
 * at the application layer via Google Authenticator session.
 */
export function createAdminClient() {
  const url = getSanitizedSupabaseUrl();
  const key = getSanitizedSupabaseServiceKey();

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
