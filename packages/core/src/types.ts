/**
 * Shared domain types. Aligned with the Supabase schema, consumed by both apps.
 */

import type { PersistedFsrsCard } from './srs/engine';
import type { WordStatus } from './vocab/word-status';

export type ProficiencyLevel =
  | 'beginner'
  | 'beginner_2'
  | 'intermediate'
  | 'intermediate_2'
  | 'advanced'
  | 'advanced_2';

export type LessonKind =
  | 'story'
  | 'article'
  | 'podcast'
  | 'video'
  | 'book'
  | 'mini_story'
  | 'grammar'
  | 'news'
  | 'song';

export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline';

export interface Language {
  code: string;
  englishName: string;
  nativeName: string;
  flagEmoji: string;
  isEnabled: boolean;
}

export interface UserLanguage {
  id: string;
  languageCode: string;
  level: ProficiencyLevel;
  isActive: boolean;
  dailyGoalWords: number;
  dailyGoalMinutes: number;
  dailyGoalReviews: number;
  interests: string[];
  learningSince: string;
}

export interface Lesson {
  id: string;
  ownerId: string | null;
  languageCode: string;
  title: string;
  description: string | null;
  kind: LessonKind;
  sourceUrl: string | null;
  coverImageUrl: string | null;
  audioUrl: string | null;
  level: ProficiencyLevel;
  content: string;
  translation: string | null;
  wordCount: number;
  durationSeconds: number | null;
  courseId: string | null;
  collection: string | null;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

export interface Sentence {
  id: string;
  lessonId: string;
  position: number;
  text: string;
  translation: string | null;
  note: string | null;
  audioStartSeconds: number | null;
  audioEndSeconds: number | null;
}

export interface Course {
  id: string;
  languageCode: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  lessonCount: number;
  level: ProficiencyLevel;
}

/** A saved vocabulary item — a "LingQ". */
export interface VocabItem {
  id: string;
  remoteId?: string;
  languageCode: string;
  /** Lookup key: lowercased single word, or space-joined lemmas for a phrase. */
  lemma: string;
  term: string;
  translation: string;
  pronunciation?: string;
  context: string;
  notes?: string;
  tags: string[];
  status: WordStatus;
  lessonId: string | null;
  lessonTitle: string | null;
  fsrsCard?: PersistedFsrsCard;
  nextReviewAt: string | null;
  lastReviewedAt: string | null;
  reviewCount: number;
  createdAt: string;
}

/** Status of a word the user marked known or ignored without saving a LingQ. */
export interface WordStatusRecord {
  languageCode: string;
  lemma: string;
  status: WordStatus;
  updatedAt: string;
}

export interface LessonProgress {
  lessonId: string;
  lastPage: number;
  lastSentence: number;
  wordsRead: number;
  completed: boolean;
  updatedAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  lessonIds: string[];
  createdAt: string;
}

export interface DailyStats {
  date: string;
  languageCode: string;
  wordsRead: number;
  listeningSeconds: number;
  lingqsCreated: number;
  reviewsCompleted: number;
  knownWords: number;
  coins: number;
}

export interface ReaderPreferences {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  pageWidth: 'single' | 'double';
  highlightStyle: 'standard' | 'underline';
  showRelatedPhrases: boolean;
  pagingMovesToKnown: boolean;
  showVocabInSentenceView: boolean;
  mergeSeparateMeanings: boolean;
  phoneticMode: 'off' | 'pinyin' | 'furigana' | 'romaji';
  theme: 'light' | 'dark' | 'system';
  /** Text direction; derived from the language but overridable. */
  textDirection: 'ltr' | 'rtl' | 'auto';
  showPronunciation: boolean;
}

export interface AudioPreferences {
  autoPlayAudio: boolean;
  autoPlayTts: boolean;
  /** Playback rate applied to both lesson audio and TTS. */
  speechRate: number;
  stopLessonAudioForTts: boolean;
  suppressTtsDuringLessonAudio: boolean;
}

export interface AppPreferences extends ReaderPreferences, AudioPreferences {
  interfaceLanguage: string;
  /** "LingQs of the Day" size, capped at 200. */
  dailyReviewSize: number;
}

export const DEFAULT_READER_PREFERENCES: ReaderPreferences = {
  fontFamily: 'system',
  fontSize: 18,
  lineHeight: 1.8,
  pageWidth: 'single',
  highlightStyle: 'standard',
  showRelatedPhrases: true,
  pagingMovesToKnown: false,
  showVocabInSentenceView: true,
  mergeSeparateMeanings: false,
  phoneticMode: 'off',
  theme: 'system',
  textDirection: 'auto',
  showPronunciation: true,
};

export const DEFAULT_AUDIO_PREFERENCES: AudioPreferences = {
  autoPlayAudio: false,
  autoPlayTts: true,
  speechRate: 0.9,
  stopLessonAudioForTts: true,
  suppressTtsDuringLessonAudio: false,
};

export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  ...DEFAULT_READER_PREFERENCES,
  ...DEFAULT_AUDIO_PREFERENCES,
  interfaceLanguage: 'fr',
  dailyReviewSize: 25,
};
