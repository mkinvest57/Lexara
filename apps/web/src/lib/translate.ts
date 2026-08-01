/**
 * Client-side wrapper around the /api/translate route.
 *
 * Results are memoised per (text, source, target) for the page session: the
 * reader asks for the same word every time the learner taps it, and the
 * upstream provider is rate limited.
 */

import type { TranslationResult } from '@yapro/core';

const cache = new Map<string, TranslationResult>();

export async function requestTranslation(
  text: string,
  target: string,
  source: string,
  signal?: AbortSignal
): Promise<TranslationResult> {
  const key = `${source}|${target}|${text.toLocaleLowerCase()}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const params = new URLSearchParams({ text, target, source });
  const response = await fetch(`/api/translate?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`translate responded ${response.status}`);

  const result = (await response.json()) as TranslationResult;
  cache.set(key, result);
  return result;
}
