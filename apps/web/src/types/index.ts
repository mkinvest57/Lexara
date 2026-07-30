export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface LanguageProfile {
  id: string;
  userId: string;
  targetLanguage: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  dailyGoalWords: number;
  dailyGoalMinutes: number;
  dailyGoalCards: number;
}

export interface Lesson {
  id: string;
  profileId: string;
  title: string;
  type: string;
  sourceUrl?: string;
  imageUrl?: string;
  level: string;
  content: string;
  wordCount: number;
  createdAt: string;
  sentences?: Sentence[];
}

export interface Sentence {
  id: string;
  lessonId: string;
  index: number;
  text: string;
  audioUrl?: string;
  audioStart?: number;
  audioEnd?: number;
  tokens: Token[];
}

export interface Token {
  id: string;
  sentenceId: string;
  index: number;
  form: string;
  lemma?: string;
}

export interface VocabEntry {
  id: string;
  userId: string;
  term: string;
  language: string;
  translation: string;
  notes?: string;
  status: number;
  createdAt: string;
  occurrences?: VocabOccurrence[];
  srsItem?: SRSItem;
}

export interface VocabOccurrence {
  id: string;
  vocabEntryId: string;
  tokenId: string;
  lessonId: string;
  context: string;
  encounteredAt: string;
  lesson?: {
    id: string;
    title: string;
  };
}

export interface SRSItem {
  id: string;
  vocabEntryId: string;
  nextReview: string;
  lastReview?: string;
  interval: number;
  successCount: number;
  failCount: number;
  vocabEntry?: VocabEntry;
}

export interface ReviewSession {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  itemsCount: number;
  correctCount: number;
  type: string;
}

export interface TodayStats {
  wordsRead: number;
  minutesListened: number;
  cardsReviewed: number;
}

export interface OverviewStats {
  knownWords: number;
  totalLingqs: number;
  totalWordsRead: number;
  dueCards: number;
}
