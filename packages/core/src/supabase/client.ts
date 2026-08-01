/**
 * Supabase client factory.
 *
 * Platform-agnostic: each app supplies its own storage adapter (cookies on web,
 * SecureStore/AsyncStorage on mobile). Only the anon key is ever used here —
 * service-role keys must stay server-side.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './database.types';

export type YaproClient = SupabaseClient<Database>;

export interface ClientOptions {
  url: string;
  anonKey: string;
  /** Persistent storage for the auth session. Omit for server-side clients. */
  storage?: {
    getItem: (key: string) => string | null | Promise<string | null>;
    setItem: (key: string, value: string) => void | Promise<void>;
    removeItem: (key: string) => void | Promise<void>;
  };
  persistSession?: boolean;
  autoRefreshToken?: boolean;
  detectSessionInUrl?: boolean;
}

export function createYaproClient(options: ClientOptions): YaproClient {
  if (!options.url || !options.anonKey) {
    throw new Error(
      'Supabase credentials missing. Set SUPABASE_URL and SUPABASE_ANON_KEY for this environment.'
    );
  }

  return createClient<Database>(options.url, options.anonKey, {
    auth: {
      storage: options.storage,
      persistSession: options.persistSession ?? true,
      autoRefreshToken: options.autoRefreshToken ?? true,
      detectSessionInUrl: options.detectSessionInUrl ?? false,
    },
  });
}
