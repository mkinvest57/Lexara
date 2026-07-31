'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import { hydrateProductStore, useProductStore } from '@/lib/product-store';

export function ProductSync() {
  const { data: session, status } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const mergeRemote = useProductStore((state) => state.mergeRemote);
  const setSyncStatus = useProductStore((state) => state.setSyncStatus);
  const attemptedToken = useRef<string | null>(null);

  useEffect(() => {
    hydrateProductStore();
  }, []);

  useEffect(() => {
    if (status === 'loading') return;
    if (!token) {
      setSyncStatus('local');
      attemptedToken.current = null;
      return;
    }
    if (attemptedToken.current === token) return;
    attemptedToken.current = token;

    let active = true;
    const hydrate = async () => {
      setSyncStatus('syncing');
      try {
        const profile = await apiClient.getLanguageProfile(token);
        const [lessonsResult, wordsResult, statsResult] = await Promise.allSettled([
          apiClient.getLessons(token, profile.id),
          apiClient.getVocab(token),
          apiClient.getOverviewStats(token),
        ]);
        if (!active) return;
        mergeRemote({
          profile,
          lessons: lessonsResult.status === 'fulfilled' ? lessonsResult.value : undefined,
          words: wordsResult.status === 'fulfilled' ? wordsResult.value : undefined,
          stats: statsResult.status === 'fulfilled' ? statsResult.value : undefined,
        });
      } catch {
        if (active) setSyncStatus('offline');
      }
    };

    void hydrate();
    return () => {
      active = false;
    };
  }, [mergeRemote, setSyncStatus, status, token]);

  return null;
}
