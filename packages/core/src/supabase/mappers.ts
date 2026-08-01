/**
 * Row → domain mappers. Keeps snake_case database shapes out of the UI layer.
 */

import type { PersistedFsrsCard } from '../srs/engine';
import type { DailyStats, Lesson, Playlist, Sentence, UserLanguage, VocabItem } from '../types';
import type { WordStatus } from '../vocab/word-status';

import type {
  DailyStatsRow,
  LessonRow,
  PlaylistRow,
  SentenceRow,
  UserLanguageRow,
  VocabularyEntryRow,
  WordStatusRow,
} from './database.types';

/** The enum is stored as text; numeric levels come back as strings. */
export function toWordStatus(value: WordStatusRow): WordStatus {
  switch (value) {
    case '1':
      return 1;
    case '2':
      return 2;
    case '3':
      return 3;
    case '4':
      return 4;
    default:
      return value as WordStatus;
  }
}

export function fromWordStatus(status: WordStatus): WordStatusRow {
  return String(status) as WordStatusRow;
}

export function mapLesson(row: LessonRow, tags: string[] = []): Lesson {
  return {
    id: row.id,
    ownerId: row.owner_id,
    languageCode: row.language_code,
    title: row.title,
    description: row.description,
    kind: row.kind,
    sourceUrl: row.source_url,
    coverImageUrl: row.cover_image_url,
    audioUrl: row.audio_url,
    level: row.level,
    content: row.content,
    translation: row.translation,
    wordCount: row.word_count,
    durationSeconds: row.duration_seconds,
    courseId: row.course_id,
    collection: row.collection,
    tags,
    isPublished: row.is_published,
    createdAt: row.created_at,
  };
}

export function mapSentence(row: SentenceRow): Sentence {
  return {
    id: row.id,
    lessonId: row.lesson_id,
    position: row.position,
    text: row.text,
    translation: row.translation,
    note: row.note,
    audioStartSeconds: row.audio_start_seconds,
    audioEndSeconds: row.audio_end_seconds,
  };
}

export function mapVocabItem(
  row: VocabularyEntryRow,
  lessonTitle: string | null = null
): VocabItem {
  return {
    id: row.id,
    remoteId: row.id,
    languageCode: row.language_code ?? '',
    lemma: row.lemma ?? row.normalized_term,
    term: row.term,
    translation: row.translation,
    pronunciation: row.pronunciation ?? undefined,
    context: row.first_context ?? '',
    notes: row.notes ?? undefined,
    tags: row.tags ?? [],
    status: toWordStatus(row.word_status),
    lessonId: row.lesson_id,
    lessonTitle,
    fsrsCard: (row.fsrs_card as PersistedFsrsCard | null) ?? undefined,
    nextReviewAt: row.next_review_at,
    lastReviewedAt: row.last_reviewed_at,
    reviewCount: row.review_count,
    createdAt: row.created_at,
  };
}

export function mapUserLanguage(row: UserLanguageRow): UserLanguage {
  return {
    id: row.id,
    languageCode: row.language_code,
    level: row.level,
    isActive: row.is_active,
    dailyGoalWords: row.daily_goal_words,
    dailyGoalMinutes: row.daily_goal_minutes,
    dailyGoalReviews: row.daily_goal_reviews,
    interests: row.interests ?? [],
    learningSince: row.learning_since,
  };
}

export function mapPlaylist(row: PlaylistRow, lessonIds: string[] = []): Playlist {
  return { id: row.id, name: row.name, lessonIds, createdAt: row.created_at };
}

export function mapDailyStats(row: DailyStatsRow): DailyStats {
  return {
    date: row.stat_date,
    languageCode: row.language_code,
    wordsRead: row.words_read,
    listeningSeconds: row.listening_seconds,
    lingqsCreated: row.lingqs_created,
    reviewsCompleted: row.reviews_completed,
    knownWords: row.known_words,
    coins: row.coins,
  };
}
