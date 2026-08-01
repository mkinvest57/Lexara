'use client';

import { useEffect } from 'react';
import { useProductStore } from '@/lib/product-store';

export function ThemeSync() {
  const theme = useProductStore((s) => s.preferences.theme);

  useEffect(() => {
    const apply = (dark: boolean) => {
      document.documentElement.classList.toggle('dark', dark);
    };

    if (theme === 'dark') {
      apply(true);
      return;
    }
    if (theme === 'light') {
      apply(false);
      return;
    }
    // system
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    apply(mq.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [theme]);

  return null;
}
