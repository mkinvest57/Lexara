/**
 * Word status model — the core of the LingQ reading experience.
 *
 * Every token in every lesson resolves to one of these statuses, keyed by
 * (user, language, lemma). Status therefore follows the learner across
 * lessons: this cross-lesson continuity is the central product value.
 */

export type WordStatus =
  | 'new' // never encountered — rendered blue
  | 1 // saved, barely known — 1 day
  | 2 // learning — 3 days
  | 3 // familiar — 7 days
  | 4 // nearly known — 15 days
  | '4a' // 30 days
  | '4b' // 90 days
  | '4c' // never reviewed again
  | 'known' // fully learned — rendered white/plain
  | 'ignored'; // names, numbers, native words — never highlighted

/** Statuses that represent a saved vocabulary item (a "LingQ"). */
export type SavedWordStatus = 1 | 2 | 3 | 4 | '4a' | '4b' | '4c';

export const SAVED_STATUSES: readonly SavedWordStatus[] = [1, 2, 3, 4, '4a', '4b', '4c'];

/** Ordered progression used when advancing or lowering a status. */
export const STATUS_LADDER: readonly WordStatus[] = [1, 2, 3, 4, '4a', '4b', '4c', 'known'];

/** SRS interval in days per status. `null` means never scheduled again. */
export const STATUS_INTERVAL_DAYS: Record<SavedWordStatus, number | null> = {
  1: 1,
  2: 3,
  3: 7,
  4: 15,
  '4a': 30,
  '4b': 90,
  '4c': null,
};

/**
 * Correct answers required in a single session to auto-advance.
 * LingQ requires two in a row up to status 4, then a single correct answer.
 */
export function requiredStreakToAdvance(status: WordStatus): number {
  if (status === 4 || status === '4a' || status === '4b') return 1;
  return 2;
}

export function isSavedStatus(status: WordStatus): status is SavedWordStatus {
  return SAVED_STATUSES.includes(status as SavedWordStatus);
}

/** Human labels for the status bar and vocabulary filters. */
export const STATUS_LABELS: Record<WordStatus, string> = {
  new: 'Nouveau',
  1: 'Découvert',
  2: 'En apprentissage',
  3: 'En progression',
  4: 'Presque connu',
  '4a': 'Consolidé',
  '4b': 'Bien ancré',
  '4c': 'Acquis',
  known: 'Connu',
  ignored: 'Ignoré',
};

/** Statuses offered in the vocabulary filter dropdown. */
export const FILTERABLE_STATUSES: readonly WordStatus[] = [1, 2, 3, 4, 'known'];

/** Sortable rank, for ordering a vocabulary list by progress. */
export function statusRank(status: WordStatus): number {
  if (status === 'new') return -1;
  if (status === 'ignored') return -2;
  if (status === 'known') return 100;
  return STATUS_LADDER.indexOf(status);
}

export function isKnown(status: WordStatus): boolean {
  return status === 'known';
}

/** The four numeric levels shown in the 1-2-3-4 status bar UI. */
export function statusBarLevel(status: WordStatus): number {
  if (status === 'new' || status === 'ignored') return 0;
  if (status === 'known') return 5;
  if (status === '4a' || status === '4b' || status === '4c') return 4;
  return status;
}

export function advanceStatus(status: WordStatus): WordStatus {
  if (status === 'new') return 1;
  if (status === 'ignored' || status === 'known') return status;
  const next = STATUS_LADDER.indexOf(status) + 1;
  return next < STATUS_LADDER.length ? STATUS_LADDER[next] : 'known';
}

export function lowerStatus(status: WordStatus): WordStatus {
  if (status === 'new' || status === 'ignored') return status;
  const index = STATUS_LADDER.indexOf(status);
  if (index <= 0) return 1;
  return STATUS_LADDER[index - 1];
}

/** Whether a saved word is due for review at the given moment. */
export function isDue(nextReviewAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!nextReviewAt) return false;
  return new Date(nextReviewAt).getTime() <= now.getTime();
}

/** Next review date implied by a status, used when the FSRS card is absent. */
export function nextReviewForStatus(status: WordStatus, from: Date = new Date()): string | null {
  if (!isSavedStatus(status)) return null;
  const days = STATUS_INTERVAL_DAYS[status];
  if (days === null) return null;
  const due = new Date(from.getTime() + days * 86_400_000);
  return due.toISOString();
}
