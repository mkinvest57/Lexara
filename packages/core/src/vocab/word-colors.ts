/**
 * Reader colour mapping. Platform-agnostic: exposes semantic tokens plus raw
 * hex values so web (Tailwind/CSS) and mobile (StyleSheet) stay in sync.
 */

import { isSavedStatus, statusBarLevel, type WordStatus } from './word-status';

export type WordPaintToken =
  | 'new'
  | 'saved-1'
  | 'saved-2'
  | 'saved-3'
  | 'saved-4'
  | 'known'
  | 'ignored'
  | 'phrase-candidate';

export interface WordPaint {
  token: WordPaintToken;
  /** Background fill. `null` means no highlight (known / ignored words). */
  background: string | null;
  text: string;
  /** True when the word should invite a tap in the reader. */
  interactive: boolean;
}

/**
 * Yellow deepens as the learner progresses 1 → 4, so the page visibly
 * lightens over time. Known words carry no highlight at all.
 */
const PAINT: Record<WordPaintToken, Omit<WordPaint, 'token'>> = {
  new: { background: '#cfe4ff', text: '#0b1c2d', interactive: true },
  'saved-1': { background: '#ffe08a', text: '#4a3200', interactive: true },
  'saved-2': { background: '#ffe9a8', text: '#4a3200', interactive: true },
  'saved-3': { background: '#fff2c8', text: '#4a3200', interactive: true },
  'saved-4': { background: '#fff8e4', text: '#4a3200', interactive: true },
  known: { background: null, text: 'inherit', interactive: true },
  ignored: { background: null, text: 'inherit', interactive: true },
  'phrase-candidate': { background: '#e2e8f0', text: '#0b1c2d', interactive: true },
};

export function paintTokenFor(status: WordStatus): WordPaintToken {
  if (status === 'new') return 'new';
  if (status === 'ignored') return 'ignored';
  if (status === 'known') return 'known';
  if (isSavedStatus(status)) {
    const level = statusBarLevel(status);
    return (`saved-${Math.min(level, 4)}` as WordPaintToken);
  }
  return 'new';
}

export function paintFor(status: WordStatus): WordPaint {
  const token = paintTokenFor(status);
  return { token, ...PAINT[token] };
}

export const WORD_PAINT = PAINT;
