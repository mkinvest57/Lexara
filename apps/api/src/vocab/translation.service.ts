import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationService {
  /**
   * MVP Translation using MyMemory API (free, 1000 req/day)
   * TODO P1: Add LibreTranslate or DeepL for better quality
   */
  async translate(
    text: string,
    targetLang: string,
    sourceLang: string = 'es',
    context?: string
  ): Promise<{ translatedText: string }> {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData) {
        const candidates = Array.isArray(data.matches)
          ? data.matches
              .filter((match: any) => typeof match.translation === 'string' && match.translation.trim())
              .map((match: any) => ({
                text: match.translation.trim(),
                quality: Number(match.quality || 0),
                match: Number(match.match || 0),
              }))
          : [];

        // MyMemory occasionally ranks an unrelated single result above multiple
        // near-identical dictionary matches. Prefer the most frequent strong
        // candidate, then use its quality score as a tie-breaker.
        const ranked = new Map<string, { text: string; count: number; score: number }>();
        for (const candidate of candidates) {
          const key = candidate.text.toLocaleLowerCase();
          const existing = ranked.get(key) || { text: candidate.text, count: 0, score: 0 };
          existing.count += 1;
          existing.score = Math.max(existing.score, candidate.quality * candidate.match);
          ranked.set(key, existing);
        }

        const best = [...ranked.values()].sort((a, b) => b.count - a.count || b.score - a.score)[0];
        return { translatedText: best?.text || data.responseData.translatedText };
      }

      // Fallback: return the original text if translation fails
      return { translatedText: text };
    } catch (error) {
      console.error('Translation error:', error);
      return { translatedText: text };
    }
  }

  /**
   * Get translation with context (simplified for MVP)
   * In P1, this will use Claude API for contextual translation
   */
  async translateWithContext(word: string, sentence: string, targetLang: string): Promise<{ translatedText: string }> {
    // For MVP, just translate the word
    return this.translate(word, targetLang);
  }
}
