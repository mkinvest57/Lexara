/**
 * Supabase authentication.
 *
 * Replaces NextAuth + the retired NestJS API. Supabase is the single source of
 * truth for identity, and the same JWT authorises every RLS-guarded query, so
 * there is no second session to keep in sync.
 *
 * When Supabase is not configured the app stays usable in local-only mode:
 * `user` is null, and reads/writes fall back to device storage.
 */

'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase';

export interface AuthState {
  user: User | null;
  session: Session | null;
  /** True until the initial session lookup settles. */
  loading: boolean;
  configured: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<{ needsConfirmation: boolean }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isSupabaseConfigured();

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      configured,
      async signIn(email, password) {
        const supabase = getSupabase();
        if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      async signUp(email, password, name) {
        const supabase = getSupabase();
        if (!supabase) throw new Error('SUPABASE_NOT_CONFIGURED');
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: name ? { data: { full_name: name } } : undefined,
        });
        if (error) throw error;
        // With email confirmation enabled Supabase returns a user but no
        // session; the caller shows a "check your inbox" state instead of
        // redirecting into the app.
        return { needsConfirmation: Boolean(data.user) && !data.session };
      },
      async signOut() {
        const supabase = getSupabase();
        if (!supabase) return;
        await supabase.auth.signOut();
      },
    }),
    [configured, loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
