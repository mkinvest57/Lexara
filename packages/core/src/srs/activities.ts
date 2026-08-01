/**
 * Review activity generation. Mirrors the `review_activity` enum already
 * present in the Supabase migration.
 */

export type ReviewActivity =
  | 'flashcard'
  | 'reverse_flashcard'
  | 'cloze'
  | 'dictation'
  | 'multiple_choice'
  | 'matching';

export const ALL_ACTIVITIES: readonly ReviewActivity[] = [
  'flashcard',
  'reverse_flashcard',
  'cloze',
  'dictation',
  'multiple_choice',
  'matching',
];

export interface ReviewConfig {
  enabled: ReviewActivity[];
  multipleChoiceOptions: number;
  dailyLimit: number;
  autoPlayTts: boolean;
  flashcardFront: Array<'term' | 'phrase'>;
  flashcardBack: Array<'term' | 'translation' | 'phrase' | 'status'>;
}

export const DEFAULT_REVIEW_CONFIG: ReviewConfig = {
  enabled: ['flashcard', 'cloze', 'multiple_choice'],
  multipleChoiceOptions: 4,
  dailyLimit: 25,
  autoPlayTts: true,
  flashcardFront: ['term'],
  flashcardBack: ['translation', 'phrase', 'status'],
};

/** Upper bound enforced on "LingQs of the Day". */
export const MAX_DAILY_LIMIT = 200;

export interface ReviewCandidate {
  id: string;
  term: string;
  translation: string;
  context: string;
  languageCode: string;
}

export interface ClozeQuestion {
  activity: 'cloze';
  item: ReviewCandidate;
  /** Context sentence with the target term replaced by a blank. */
  prompt: string;
  answer: string;
}

const BLANK = '____';

export function buildCloze(item: ReviewCandidate): ClozeQuestion | null {
  if (!item.context) return null;
  // Escape the term before building the matcher so punctuation is literal.
  const escaped = item.term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(escaped, 'iu');
  if (!matcher.test(item.context)) return null;

  return {
    activity: 'cloze',
    item,
    prompt: item.context.replace(matcher, BLANK),
    answer: item.term,
  };
}

export interface MultipleChoiceQuestion {
  activity: 'multiple_choice';
  item: ReviewCandidate;
  prompt: string;
  options: string[];
  answer: string;
}

/**
 * Builds a multiple-choice question, drawing distractors from other saved
 * translations so the options stay plausible.
 */
export function buildMultipleChoice(
  item: ReviewCandidate,
  pool: ReviewCandidate[],
  optionCount: number,
  random: () => number = Math.random
): MultipleChoiceQuestion {
  const distractors = pool
    .filter((candidate) => candidate.id !== item.id && candidate.translation !== item.translation)
    .map((candidate) => candidate.translation);

  const chosen = shuffle(unique(distractors), random).slice(0, Math.max(0, optionCount - 1));
  const options = shuffle([item.translation, ...chosen], random);

  return {
    activity: 'multiple_choice',
    item,
    prompt: item.term,
    options,
    answer: item.translation,
  };
}

export interface UnscrambleQuestion {
  activity: 'unscramble';
  sentence: string;
  parts: string[];
  answer: string[];
}

/** Sentence-level activity used in sentence mode. */
export function buildUnscramble(
  sentence: string,
  words: string[],
  random: () => number = Math.random
): UnscrambleQuestion {
  return {
    activity: 'unscramble',
    sentence,
    parts: shuffle(words, random),
    answer: words,
  };
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const result = [...values];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** Cycles activities across a session so consecutive items vary. */
export function activityForIndex(config: ReviewConfig, index: number): ReviewActivity {
  const enabled = config.enabled.length > 0 ? config.enabled : DEFAULT_REVIEW_CONFIG.enabled;
  return enabled[index % enabled.length];
}
