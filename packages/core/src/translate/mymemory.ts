/**
 * MyMemory translation lookup.
 *
 * Extracted from the retired NestJS API so both the web route handler and any
 * future Edge Function share one implementation. No API key is required, so
 * this may run server-side without secrets — but it is rate limited
 * (~1000 req/day per IP), which is why callers cache results.
 */

export interface TranslationResult {
  translatedText: string;
  /** Alternative renderings, best first, excluding `translatedText`. */
  alternatives: string[];
}

interface MyMemoryMatch {
  translation?: unknown;
  quality?: unknown;
  match?: unknown;
}

interface MyMemoryResponse {
  responseStatus?: unknown;
  responseData?: { translatedText?: unknown };
  matches?: unknown;
}

const ENDPOINT = 'https://api.mymemory.translated.net/get';

/**
 * MyMemory occasionally ranks an unrelated single result above several
 * near-identical dictionary matches, so candidates are ranked by how often a
 * rendering repeats, with the quality score as a tie-breaker.
 */
function rank(matches: MyMemoryMatch[]): string[] {
  const ranked = new Map<string, { text: string; count: number; score: number }>();

  for (const match of matches) {
    if (typeof match.translation !== 'string') continue;
    const text = match.translation.trim();
    if (!text) continue;

    const quality = Number(match.quality ?? 0) || 0;
    const closeness = Number(match.match ?? 0) || 0;
    const key = text.toLocaleLowerCase();
    const existing = ranked.get(key) ?? { text, count: 0, score: 0 };
    existing.count += 1;
    existing.score = Math.max(existing.score, quality * closeness);
    ranked.set(key, existing);
  }

  return [...ranked.values()]
    .sort((a, b) => b.count - a.count || b.score - a.score)
    .map((entry) => entry.text);
}

export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage = 'en'
): Promise<TranslationResult> {
  const trimmed = text.trim();
  if (!trimmed) return { translatedText: '', alternatives: [] };

  const url = `${ENDPOINT}?q=${encodeURIComponent(trimmed)}&langpair=${encodeURIComponent(
    `${sourceLanguage}|${targetLanguage}`
  )}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error(`MyMemory responded ${response.status}`);

  const data = (await response.json()) as MyMemoryResponse;
  const candidates = Array.isArray(data.matches) ? rank(data.matches as MyMemoryMatch[]) : [];
  const fallback =
    typeof data.responseData?.translatedText === 'string' ? data.responseData.translatedText : '';
  const best = candidates[0] || fallback;

  // Returning the source text unchanged would look like a translation, so an
  // empty result is surfaced instead and the caller asks the learner.
  if (!best || best.toLocaleLowerCase() === trimmed.toLocaleLowerCase()) {
    return { translatedText: '', alternatives: candidates.slice(1, 6) };
  }

  return {
    translatedText: best,
    alternatives: candidates.slice(1, 6),
  };
}
