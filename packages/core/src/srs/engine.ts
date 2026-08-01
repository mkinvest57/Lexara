/**
 * SRS engine.
 *
 * Two schedulers coexist by design:
 *  - FSRS drives the actual review dates (better retention than fixed steps).
 *  - The LingQ status ladder drives what the learner *sees* (1-2-3-4-known).
 *
 * A correct-answer streak advances the visible status; FSRS independently
 * decides when the card comes back.
 */

import { createEmptyCard, fsrs, Rating, type Card, type Grade } from 'ts-fsrs';

import {
  advanceStatus,
  lowerStatus,
  nextReviewForStatus,
  requiredStreakToAdvance,
  type WordStatus,
} from '../vocab/word-status';

export type PersistedFsrsCard = Omit<Card, 'due' | 'last_review'> & {
  due: string;
  last_review?: string;
};

const scheduler = fsrs();

export function newCard(now: Date = new Date()): PersistedFsrsCard {
  return serializeCard(createEmptyCard(now));
}

export function serializeCard(card: Card): PersistedFsrsCard {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review ? card.last_review.toISOString() : undefined,
  };
}

export function deserializeCard(card: PersistedFsrsCard): Card {
  return {
    ...card,
    due: new Date(card.due),
    last_review: card.last_review ? new Date(card.last_review) : undefined,
  } as Card;
}

export type ReviewGrade = 'again' | 'hard' | 'good' | 'easy';

const GRADE_TO_RATING: Record<ReviewGrade, Grade> = {
  again: Rating.Again,
  hard: Rating.Hard,
  good: Rating.Good,
  easy: Rating.Easy,
};

export function isCorrect(grade: ReviewGrade): boolean {
  return grade !== 'again';
}

export interface ReviewInput {
  status: WordStatus;
  card?: PersistedFsrsCard;
  /** Consecutive correct answers so far in the current session. */
  streak: number;
  grade: ReviewGrade;
  now?: Date;
}

export interface ReviewOutcome {
  status: WordStatus;
  card: PersistedFsrsCard;
  streak: number;
  nextReviewAt: string;
  advanced: boolean;
}

/**
 * Applies one review answer, returning the new status, FSRS card and streak.
 */
export function applyReview(input: ReviewInput): ReviewOutcome {
  const now = input.now ?? new Date();
  const current = input.card ? deserializeCard(input.card) : createEmptyCard(now);

  const result = scheduler.next(current, now, GRADE_TO_RATING[input.grade]);
  const card = serializeCard(result.card);

  if (!isCorrect(input.grade)) {
    // A miss resets the streak and walks the visible status back one step.
    return {
      status: lowerStatus(input.status),
      card,
      streak: 0,
      nextReviewAt: card.due,
      advanced: false,
    };
  }

  const streak = input.streak + 1;
  const needed = requiredStreakToAdvance(input.status);

  if (streak >= needed) {
    const status = advanceStatus(input.status);
    return {
      status,
      card,
      streak: 0,
      nextReviewAt: nextReviewForStatus(status, now) ?? card.due,
      advanced: status !== input.status,
    };
  }

  return { status: input.status, card, streak, nextReviewAt: card.due, advanced: false };
}

/** Resets the SRS timer without touching the status ("Mark as Reviewed"). */
export function markReviewed(
  status: WordStatus,
  now: Date = new Date()
): { nextReviewAt: string | null; card: PersistedFsrsCard } {
  return { nextReviewAt: nextReviewForStatus(status, now), card: newCard(now) };
}
