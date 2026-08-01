/**
 * Coins, streak and activity score.
 *
 * Coins are the single currency behind the daily goal and the streak: every
 * learning action earns them, so the streak reflects real activity rather than
 * one narrow metric.
 */

export type CoinAction =
  | 'lingq_created'
  | 'status_increased'
  | 'marked_known'
  | 'words_read'
  | 'listening_minute'
  | 'review_completed'
  | 'lesson_completed';

/** Coins per unit of each action. */
export const COIN_RATES: Record<CoinAction, number> = {
  lingq_created: 1,
  status_increased: 1,
  marked_known: 1,
  words_read: 0.02, // 50 words read = 1 coin
  listening_minute: 1,
  review_completed: 1,
  lesson_completed: 5,
};

export function coinsFor(action: CoinAction, units: number = 1): number {
  return Math.floor(COIN_RATES[action] * units);
}

export interface DailyActivity {
  date: string; // ISO date, YYYY-MM-DD
  coins: number;
}

/** Activity score = coins earned over the trailing 30 days. */
export function activityScore(history: DailyActivity[], now: Date = new Date()): number {
  const cutoff = now.getTime() - 30 * 86_400_000;
  return history
    .filter((day) => new Date(day.date).getTime() >= cutoff)
    .reduce((total, day) => total + day.coins, 0);
}

export type StreakHeat = 'cold' | 'warm' | 'hot' | 'blazing';

/** Drives the colour of the flame icon in the header. */
export function streakHeat(score: number): StreakHeat {
  if (score >= 3000) return 'blazing';
  if (score >= 1000) return 'hot';
  if (score >= 250) return 'warm';
  return 'cold';
}

export const STREAK_HEAT_COLORS: Record<StreakHeat, string> = {
  cold: '#94a3b8',
  warm: '#fb923c',
  hot: '#ef4444',
  blazing: '#dc2626',
};

export interface DailyGoal {
  coins: number;
}

export const DEFAULT_DAILY_GOAL: DailyGoal = { coins: 30 };

export function goalMet(coinsToday: number, goal: DailyGoal = DEFAULT_DAILY_GOAL): boolean {
  return coinsToday >= goal.coins;
}

/**
 * Counts consecutive days meeting the goal, walking backwards from today.
 * Today not yet meeting the goal does not break a streak earned yesterday.
 */
export function computeStreak(
  history: DailyActivity[],
  goal: DailyGoal = DEFAULT_DAILY_GOAL,
  now: Date = new Date()
): number {
  const byDate = new Map(history.map((day) => [day.date, day.coins]));
  const cursor = new Date(now);
  let streak = 0;

  const key = (date: Date) => date.toISOString().slice(0, 10);

  if (!goalMet(byDate.get(key(cursor)) ?? 0, goal)) {
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  while (goalMet(byDate.get(key(cursor)) ?? 0, goal)) {
    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

/** Known-word milestones that award a badge. */
export const KNOWN_WORD_MILESTONES: readonly number[] = [
  1_000, 5_000, 10_000, 25_000, 50_000, 100_000,
];

export function milestonesReached(knownWords: number): number[] {
  return KNOWN_WORD_MILESTONES.filter((milestone) => knownWords >= milestone);
}

export function nextMilestone(knownWords: number): number | null {
  return KNOWN_WORD_MILESTONES.find((milestone) => knownWords < milestone) ?? null;
}
