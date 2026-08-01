/**
 * Supabase data access for YAPRO.
 *
 * Every function degrades gracefully: when Supabase is unconfigured or
 * unreachable it returns null/empty rather than throwing, so the app keeps
 * working from its local cache. Offline reading is a product requirement, not
 * an edge case.
 */

'use client';

import {
  mapDailyStats,
  mapLesson,
  mapPlaylist,
  mapVocabItem,
  fromWordStatus,
  toWordStatus,
  type LessonRow,
  type VocabularyEntryRow,
  type WordStatusRow,
} from '@yapro/core/supabase';
import type { DailyStats, Lesson, Playlist, VocabItem, WordStatusRecord } from '@yapro/core';
import type { WordStatus } from '@yapro/core';

import { getSupabase } from './supabase';

export interface LoadResult<T> {
  data: T;
  /** False when the remote call could not be made or failed. */
  online: boolean;
}

const offline = <T,>(fallback: T): LoadResult<T> => ({ data: fallback, online: false });

export async function fetchPublishedLessons(languageCode: string): Promise<LoadResult<Lesson[]>> {
  const supabase = getSupabase();
  if (!supabase) return offline([]);

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('language_code', languageCode)
    .eq('is_published', true)
    .order('course_position', { ascending: true });

  if (error || !data) return offline([]);
  return { data: (data as LessonRow[]).map((row) => mapLesson(row)), online: true };
}

export async function fetchOwnedLessons(): Promise<LoadResult<Lesson[]>> {
  const supabase = getSupabase();
  if (!supabase) return offline([]);

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return offline([]);

  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('owner_id', auth.user.id)
    .order('created_at', { ascending: false });

  if (error || !data) return offline([]);
  return { data: (data as LessonRow[]).map((row) => mapLesson(row)), online: true };
}

export async function fetchVocabulary(languageCode: string): Promise<LoadResult<VocabItem[]>> {
  const supabase = getSupabase();
  if (!supabase) return offline([]);

  const { data, error } = await supabase
    .from('vocabulary_entries')
    .select('*')
    .eq('language_code', languageCode)
    .order('created_at', { ascending: false });

  if (error || !data) return offline([]);
  return { data: (data as VocabularyEntryRow[]).map((row) => mapVocabItem(row)), online: true };
}

/**
 * Loads every word status for a language in one query. The reader needs the
 * whole set in memory to colour tokens without a lookup per word.
 */
export async function fetchWordStatuses(
  languageCode: string
): Promise<LoadResult<WordStatusRecord[]>> {
  const supabase = getSupabase();
  if (!supabase) return offline([]);

  const response = await supabase
    .from('word_statuses')
    .select('lemma, status, updated_at, language_code')
    .eq('language_code', languageCode);

  const { error } = response;
  const data = response.data as unknown as
    | { lemma: string; status: WordStatusRow; updated_at: string; language_code: string }[]
    | null;

  if (error || !data) return offline([]);

  return {
    data: data.map((row) => ({
      languageCode: row.language_code,
      lemma: row.lemma,
      status: toWordStatus(row.status),
      updatedAt: row.updated_at,
    })),
    online: true,
  };
}

/** Bulk status write, used by "paging moves to known" and batch actions. */
export async function pushWordStatuses(
  languageCode: string,
  lemmas: string[],
  status: WordStatus
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase || lemmas.length === 0) return false;

  const { error } = await supabase.rpc('set_word_statuses', {
    p_language_code: languageCode,
    p_lemmas: lemmas,
    p_status: fromWordStatus(status),
  } as never);

  return !error;
}

export async function fetchDailyStats(
  languageCode: string,
  days: number = 90
): Promise<LoadResult<DailyStats[]>> {
  const supabase = getSupabase();
  if (!supabase) return offline([]);

  const since = new Date(Date.now() - days * 86_400_000).toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('daily_stats')
    .select('*')
    .eq('language_code', languageCode)
    .gte('stat_date', since)
    .order('stat_date', { ascending: true });

  if (error || !data) return offline([]);
  return { data: data.map(mapDailyStats), online: true };
}

export async function fetchPlaylists(): Promise<LoadResult<Playlist[]>> {
  const supabase = getSupabase();
  if (!supabase) return offline([]);

  const { data, error } = await supabase
    .from('playlists')
    .select('*, playlist_items(lesson_id, position)')
    .order('created_at', { ascending: false });

  if (error || !data) return offline([]);

  const playlists = data.map((row) => {
    const items = ((row as { playlist_items?: { lesson_id: string; position: number }[] })
      .playlist_items ?? [])
      .slice()
      .sort((a, b) => a.position - b.position)
      .map((item) => item.lesson_id);
    return mapPlaylist(row, items);
  });

  return { data: playlists, online: true };
}

// ---------------------------------------------------------------------------
// Writes
// ---------------------------------------------------------------------------

/** Resolves the active user_language row, required by vocabulary_entries. */
async function activeUserLanguageId(languageCode: string): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const response = await supabase
    .from('user_languages')
    .select('id')
    .eq('language_code', languageCode)
    .maybeSingle();

  const row = response.data as unknown as { id: string } | null;
  return row?.id ?? null;
}

export interface SaveVocabInput {
  languageCode: string;
  lemma: string;
  term: string;
  translation: string;
  context: string;
  pronunciation?: string;
  lessonId?: string | null;
  status: WordStatus;
  nextReviewAt: string | null;
  fsrsCard?: unknown;
}

/** Upserts a LingQ. Returns the remote id, or null when offline. */
export async function pushVocabItem(input: SaveVocabInput): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const userLanguageId = await activeUserLanguageId(input.languageCode);
  if (!userLanguageId) return null;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from('vocabulary_entries')
    .upsert(
      {
        user_id: auth.user.id,
        user_language_id: userLanguageId,
        language_code: input.languageCode,
        lemma: input.lemma,
        normalized_term: input.lemma,
        term: input.term,
        translation: input.translation,
        pronunciation: input.pronunciation ?? null,
        first_context: input.context,
        word_status: fromWordStatus(input.status),
        lesson_id: input.lessonId ?? null,
        next_review_at: input.nextReviewAt,
        fsrs_card: input.fsrsCard ?? null,
      } as never,
      { onConflict: 'user_id,language_code,lemma' }
    )
    .select('id')
    .maybeSingle();

  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function pushVocabStatus(
  remoteId: string,
  status: WordStatus,
  nextReviewAt: string | null,
  fsrsCard?: unknown
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase
    .from('vocabulary_entries')
    .update({
      word_status: fromWordStatus(status),
      next_review_at: nextReviewAt,
      last_reviewed_at: new Date().toISOString(),
      ...(fsrsCard ? { fsrs_card: fsrsCard } : {}),
    } as never)
    .eq('id', remoteId);

  return !error;
}

export async function deleteVocabItem(remoteId: string): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from('vocabulary_entries').delete().eq('id', remoteId);
  return !error;
}

export interface StatsDelta {
  wordsRead?: number;
  listeningSeconds?: number;
  lingqsCreated?: number;
  reviewsCompleted?: number;
  coins?: number;
}

/** Increments today's aggregated stats in a single round-trip. */
export async function bumpDailyStats(
  languageCode: string,
  delta: StatsDelta
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.rpc('bump_daily_stats', {
    p_language_code: languageCode,
    p_words_read: delta.wordsRead ?? 0,
    p_listening_seconds: delta.listeningSeconds ?? 0,
    p_lingqs_created: delta.lingqsCreated ?? 0,
    p_reviews_completed: delta.reviewsCompleted ?? 0,
    p_coins: delta.coins ?? 0,
  } as never);

  return !error;
}

export interface ImportLessonInput {
  languageCode: string;
  title: string;
  content: string;
  description?: string;
  translation?: string;
  sourceUrl?: string;
  coverImageUrl?: string;
  audioUrl?: string;
  level?: string;
  kind?: string;
  wordCount: number;
}

/** Creates a private imported lesson owned by the current user. */
export async function pushImportedLesson(input: ImportLessonInput): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;

  const { data, error } = await supabase
    .from('lessons')
    .insert({
      owner_id: auth.user.id,
      language_code: input.languageCode,
      title: input.title,
      description: input.description ?? null,
      content: input.content,
      translation: input.translation ?? null,
      source_url: input.sourceUrl ?? null,
      cover_image_url: input.coverImageUrl ?? null,
      audio_url: input.audioUrl ?? null,
      level: input.level ?? 'beginner',
      kind: input.kind ?? 'article',
      word_count: input.wordCount,
      is_published: false,
    } as never)
    .select('id')
    .maybeSingle();

  if (error || !data) return null;
  return (data as { id: string }).id;
}

export async function pushLessonProgress(
  lessonId: string,
  languageCode: string,
  progress: { lastPage?: number; lastSentence?: number; wordsRead?: number }
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const userLanguageId = await activeUserLanguageId(languageCode);
  if (!userLanguageId) return false;

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return false;

  const { error } = await supabase.from('lesson_progress').upsert(
    {
      user_id: auth.user.id,
      user_language_id: userLanguageId,
      language_code: languageCode,
      lesson_id: lessonId,
      last_page: progress.lastPage ?? 1,
      last_sentence: progress.lastSentence ?? 0,
      words_read: progress.wordsRead ?? 0,
      last_opened_at: new Date().toISOString(),
    } as never,
    { onConflict: 'user_id,lesson_id' }
  );

  return !error;
}
