/**
 * Per-lesson vocabulary breakdown, shown on lesson cards and info pages before
 * the learner opens a lesson.
 */

import { tokenize } from '../text/tokenizer';
import { isSavedStatus, type WordStatus } from './word-status';

export interface LessonVocabStats {
  totalWords: number;
  uniqueWords: number;
  newWords: number;
  savedWords: number;
  knownWords: number;
  newPercent: number;
  savedPercent: number;
  knownPercent: number;
}

/**
 * `statusLookup` resolves a lemma to its status, or undefined when the learner
 * has never seen the word.
 */
export function computeLessonStats(
  content: string,
  languageCode: string,
  statusLookup: (lemma: string) => WordStatus | undefined
): LessonVocabStats {
  const tokens = tokenize(content, languageCode).filter((token) => token.isWord);
  const unique = new Set(tokens.map((token) => token.lemma));

  let newWords = 0;
  let savedWords = 0;
  let knownWords = 0;

  for (const lemma of unique) {
    const status = statusLookup(lemma);
    if (status === undefined || status === 'new') {
      newWords += 1;
    } else if (status === 'known' || status === 'ignored') {
      knownWords += 1;
    } else if (isSavedStatus(status)) {
      savedWords += 1;
    }
  }

  const uniqueWords = unique.size;
  const pct = (value: number) => (uniqueWords === 0 ? 0 : Math.round((value / uniqueWords) * 100));

  return {
    totalWords: tokens.length,
    uniqueWords,
    newWords,
    savedWords,
    knownWords,
    newPercent: pct(newWords),
    savedPercent: pct(savedWords),
    knownPercent: pct(knownWords),
  };
}

/**
 * In-memory status index. The reader resolves a status per token on every
 * render, so lookups must be O(1) — a 5000-word lesson would otherwise stall.
 */
export class StatusIndex {
  private readonly map = new Map<string, WordStatus>();

  constructor(entries: Iterable<{ lemma: string; status: WordStatus }> = []) {
    for (const entry of entries) this.set(entry.lemma, entry.status);
  }

  private key(lemma: string): string {
    return lemma;
  }

  get(lemma: string): WordStatus | undefined {
    return this.map.get(this.key(lemma));
  }

  set(lemma: string, status: WordStatus): void {
    this.map.set(this.key(lemma), status);
  }

  delete(lemma: string): void {
    this.map.delete(this.key(lemma));
  }

  has(lemma: string): boolean {
    return this.map.has(this.key(lemma));
  }

  get size(): number {
    return this.map.size;
  }

  entries(): IterableIterator<[string, WordStatus]> {
    return this.map.entries();
  }

  /** Total words the learner has marked known or fully learned. */
  knownCount(): number {
    let count = 0;
    for (const status of this.map.values()) {
      if (status === 'known' || status === '4c') count += 1;
    }
    return count;
  }

  /** Space-joined lemma keys of saved phrases, used by phrase detection. */
  phraseKeys(): Set<string> {
    const phrases = new Set<string>();
    for (const lemma of this.map.keys()) {
      if (lemma.includes(' ')) phrases.add(lemma);
    }
    return phrases;
  }
}
