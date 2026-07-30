import { Injectable } from '@nestjs/common';

@Injectable()
export class TranslationService {
  /**
   * MVP Translation using MyMemory API (free, 1000 req/day)
   * TODO P1: Add LibreTranslate or DeepL for better quality
   */
  async translate(text: string, targetLang: string, context?: string): Promise<string> {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|${targetLang}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.responseStatus === 200 && data.responseData) {
        return data.responseData.translatedText;
      }

      // Fallback: return the original text if translation fails
      return text;
    } catch (error) {
      console.error('Translation error:', error);
      return text;
    }
  }

  /**
   * Get translation with context (simplified for MVP)
   * In P1, this will use Claude API for contextual translation
   */
  async translateWithContext(word: string, sentence: string, targetLang: string): Promise<string> {
    // For MVP, just translate the word
    return this.translate(word, targetLang);
  }
}
