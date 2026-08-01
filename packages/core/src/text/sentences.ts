/**
 * Sentence segmentation and pagination, used by sentence mode and the paged reader.
 */

import { countWords, scriptFor } from './tokenizer';

export interface SplitSentence {
  position: number;
  text: string;
}

const CJK_TERMINATORS = /(?<=[。！？…])\s*/u;
const LATIN_TERMINATORS = /(?<=[.!?…])\s+(?=[\p{Lu}\p{L}"'“«])/u;

export function splitSentences(text: string, languageCode: string): SplitSentence[] {
  const script = scriptFor(languageCode);
  const separator = script === 'cjk' ? CJK_TERMINATORS : LATIN_TERMINATORS;

  const parts = text
    .split(/\n{2,}/)
    .flatMap((paragraph) => paragraph.split(separator))
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 0);

  return parts.map((sentence, index) => ({ position: index, text: sentence }));
}

export interface LessonPage {
  pageNumber: number;
  sentences: SplitSentence[];
  wordCount: number;
}

/** Target words per reader page. LingQ keeps pages short enough to feel finishable. */
export const DEFAULT_WORDS_PER_PAGE = 250;

export function paginate(
  sentences: SplitSentence[],
  languageCode: string,
  wordsPerPage: number = DEFAULT_WORDS_PER_PAGE
): LessonPage[] {
  const pages: LessonPage[] = [];
  let current: SplitSentence[] = [];
  let currentWords = 0;

  for (const sentence of sentences) {
    const words = countWords(sentence.text, languageCode);
    // Never split a sentence across pages; overflow the page instead.
    if (current.length > 0 && currentWords + words > wordsPerPage) {
      pages.push({ pageNumber: pages.length + 1, sentences: current, wordCount: currentWords });
      current = [];
      currentWords = 0;
    }
    current.push(sentence);
    currentWords += words;
  }

  if (current.length > 0) {
    pages.push({ pageNumber: pages.length + 1, sentences: current, wordCount: currentWords });
  }

  return pages;
}
