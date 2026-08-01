/**
 * Phrase detection. When a learner taps a word, nearby tokens that could form a
 * known or candidate multi-word expression are greyed so the phrase can be
 * selected instead of the single word.
 */

import type { RawToken } from './tokenizer';

/** Longest phrase, in words, that we attempt to match. */
export const MAX_PHRASE_WORDS = 6;

export interface PhraseMatch {
  /** Index into the word-only token list. */
  startIndex: number;
  endIndex: number;
  lemma: string;
}

function joinLemmas(tokens: RawToken[], start: number, end: number): string {
  return tokens
    .slice(start, end + 1)
    .map((token) => token.lemma)
    .join(' ');
}

/**
 * Finds saved phrases overlapping the tapped token.
 * `savedPhrases` holds space-joined lemma keys of existing multi-word LingQs.
 */
export function findPhrasesAt(
  tokens: RawToken[],
  tappedIndex: number,
  savedPhrases: ReadonlySet<string>
): PhraseMatch[] {
  const matches: PhraseMatch[] = [];

  for (let start = Math.max(0, tappedIndex - MAX_PHRASE_WORDS + 1); start <= tappedIndex; start++) {
    for (let end = tappedIndex; end < Math.min(tokens.length, start + MAX_PHRASE_WORDS); end++) {
      if (end < tappedIndex) continue;
      if (start === end) continue;
      const lemma = joinLemmas(tokens, start, end);
      if (savedPhrases.has(lemma)) {
        matches.push({ startIndex: start, endIndex: end, lemma });
      }
    }
  }

  // Prefer the longest match so "in spite of" wins over "in spite".
  return matches.sort((a, b) => b.endIndex - b.startIndex - (a.endIndex - a.startIndex));
}

/**
 * Candidate window highlighted in grey around the tapped word, letting the user
 * extend the selection into a phrase. Independent of what is already saved.
 */
export function phraseCandidateRange(
  tokens: RawToken[],
  tappedIndex: number,
  span: number = 3
): { startIndex: number; endIndex: number } {
  return {
    startIndex: Math.max(0, tappedIndex - span),
    endIndex: Math.min(tokens.length - 1, tappedIndex + span),
  };
}

export function phraseLemma(tokens: RawToken[], startIndex: number, endIndex: number): string {
  return joinLemmas(tokens, startIndex, endIndex);
}

export function isPhrase(lemma: string): boolean {
  return lemma.trim().includes(' ');
}
