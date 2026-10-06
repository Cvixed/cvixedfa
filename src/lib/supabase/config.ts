/**
 * Robust Supabase URL and Key sanitizer
 * Prevents "Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL" errors
 * caused by quotes, missing protocol, or pasting connection strings.
 */

export function getSanitizedSupabaseUrl(): string {
  let url = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  url = url.replace(/^["']|["']$/g, '');

  // If user accidentally pasted PostgreSQL connection string
  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    const match = url.match(/@db\.([a-z0-9]+)\.supabase\.co/);
    if (match) {
      return `https://${match[1]}.supabase.co`;
    }
  }

  // Fallback to configured project
  if (!url || url.includes('placeholder') || !url.includes('.')) {
    return 'https://tpklfirobtbcuspvdhuw.supabase.co';
  }

  // Ensure https protocol
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return url;
}

export function getSanitizedSupabaseAnonKey(): string {
  let key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();
  return key.replace(/^["']|["']$/g, '');
}

export function getSanitizedSupabaseServiceKey(): string {
  let key = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  key = key.replace(/^["']|["']$/g, '');
  return key || getSanitizedSupabaseAnonKey();
}
