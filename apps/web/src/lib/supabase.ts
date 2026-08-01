/**
 * Supabase browser client.
 *
 * Only the anon key is used here — it is safe to ship, since every table is
 * guarded by RLS. Service-role keys must never reach this file.
 */

'use client';

import { createYaproClient, type YaproClient } from '@yapro/core/supabase';

let client: YaproClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

/**
 * Returns the shared client, or null when Supabase is not configured.
 * Callers fall back to local-only mode rather than crashing, so the app stays
 * usable before credentials are set.
 */
export function getSupabase(): YaproClient | null {
  if (!isSupabaseConfigured()) return null;
  if (client) return client;

  client = createYaproClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    detectSessionInUrl: true,
  });

  return client;
}
