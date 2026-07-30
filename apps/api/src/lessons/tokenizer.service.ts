import { Injectable } from '@nestjs/common';

@Injectable()
export class TokenizerService {
  /**
   * Simple tokenizer for MVP
   * Splits text by whitespace and punctuation
   * TODO: Add proper NLP libraries for different languages in P1
   */
  tokenizeSentence(text: string): string[] {
    // Basic tokenization: split by spaces and handle punctuation
    const tokens = text
      .replace(/([.,!?;:])/g, ' $1 ') // Add spaces around punctuation
      .split(/\s+/) // Split by whitespace
      .filter((token) => token.length > 0); // Remove empty tokens

    return tokens;
  }

  /**
   * Split text into sentences
   * Simple implementation for MVP
   */
  tokenizeText(text: string): string[] {
    // Basic sentence splitting
    const sentences = text
      .replace(/([.!?])\s+/g, '$1|') // Mark sentence boundaries
      .split('|')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    return sentences;
  }

  /**
   * Count words in text
   */
  countWords(text: string): number {
    return text
      .split(/\s+/)
      .filter((word) => word.length > 0 && /\w/.test(word)).length;
  }
}
