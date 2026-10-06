'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'
import { getSanitizedSupabaseUrl, getSanitizedSupabaseAnonKey } from './config'

export function createClient() {
  const url = getSanitizedSupabaseUrl()
  const key = getSanitizedSupabaseAnonKey()
  return createBrowserClient<Database>(url, key)
}
