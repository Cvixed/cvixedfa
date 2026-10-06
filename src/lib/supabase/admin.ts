import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types/database';

export const OWNER_USER_ID = process.env.OWNER_USER_ID || '00000000-0000-0000-0000-000000000001';

/**
 * Server-only Supabase client using Service Role Key (bypasses RLS)
 * Perfect for single-owner personal deployment where security is handled
 * at the application layer via Google Authenticator session.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-cvixedfa.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';

  return createClient<Database>(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
