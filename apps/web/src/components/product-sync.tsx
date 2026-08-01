'use client';

/**
 * Hydrates the local cache, then pulls the active language from Supabase.
 *
 * Runs once per language: the store owns reconciliation, this component only
 * decides when to ask for it.
 */

import { useEffect, useRef } from 'react';

import { hydrateProductStore, useProductStore } from '@/lib/product-store';

export function ProductSync() {
  const targetLanguage = useProductStore((state) => state.profile.targetLanguage);
  const loadLanguage = useProductStore((state) => state.loadLanguage);
  const loadedLanguage = useRef<string | null>(null);

  useEffect(() => {
    hydrateProductStore();
  }, []);

  useEffect(() => {
    if (!targetLanguage || loadedLanguage.current === targetLanguage) return;
    loadedLanguage.current = targetLanguage;
    void loadLanguage(targetLanguage);
  }, [loadLanguage, targetLanguage]);

  return null;
}
