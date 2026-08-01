'use client';

/**
 * Product store — a cache and sync layer over Supabase, not a database.
 *
 * Lesson content lives in Supabase (see supabase/seed.sql). This store holds
 * what the UI needs right now, applies writes optimistically so the reader
 * never waits on the network, and reconciles with the server when it can.
 *
 * Word status is the important piece: `statusIndex` is an in-memory Map keyed
 * by lemma, because the reader resolves a status for every token on every
 * render. A 5000-word lesson makes that lookup 5000 times per paint.
 */

import { create } from 'zustand';
import {
  DEFAULT_APP_PREFERENCES,
  StatusIndex,
  advanceStatus,
  applyReview,
  coinsFor,
  isSavedStatus,
  lowerStatus,
  newCard,
  nextReviewForStatus,
  toLemma,
  tokenize,
  type AppPreferences,
  type Lesson,
  type ReviewGrade,
  type SyncStatus,
  type VocabItem,
  type WordStatus,
} from '@yapro/core';

import {
  bumpDailyStats,
  deleteVocabItem,
  fetchOwnedLessons,
  fetchPublishedLessons,
  fetchVocabulary,
  fetchWordStatuses,
  pushImportedLesson,
  pushVocabItem,
  pushVocabStatus,
  pushWordStatuses,
  type ImportLessonInput,
} from './repository';

export type { SyncStatus } from '@yapro/core';

interface ProductProfile {
  name: string;
  initials: string;
  targetLanguage: string;
  targetLanguageLabel: string;
  levelLabel: string;
  dailyGoal: number;
  coins: number;
  streak: number;
  totalWordsRead: number;
  minutesListened: number;
  cardsReviewed: number;
}

interface ProductState {
  lessons: Lesson[];
  words: VocabItem[];
  /** Lemma → status for the active language. Rebuilt on language change. */
  statusIndex: StatusIndex;
  /** Bumped whenever statusIndex mutates, so components re-render. */
  statusVersion: number;
  favorites: string[];
  playlist: string[];
  readingProgress: Record<string, number>;
  profile: ProductProfile;
  preferences: AppPreferences;
  equippedMascot: string;
  purchasedMascots: string[];
  syncStatus: SyncStatus;
  lastSyncedAt?: string;

  loadLanguage: (languageCode: string) => Promise<void>;
  setSyncStatus: (status: SyncStatus) => void;

  statusOf: (lemma: string) => WordStatus;
  setWordStatusByLemma: (lemma: string, status: WordStatus) => void;
  markPageKnown: (lemmas: string[]) => void;

  saveWord: (input: SaveWordInput) => VocabItem;
  setWordStatus: (wordId: string, status: WordStatus) => void;
  removeWord: (wordId: string) => void;
  reviewWord: (wordId: string, grade: ReviewGrade) => void;

  importLesson: (input: ImportLessonDraft) => Promise<Lesson>;
  toggleFavorite: (lessonId: string) => void;
  togglePlaylist: (lessonId: string) => void;
  reorderPlaylist: (from: number, to: number) => void;
  recordReading: (lessonId: string, wordsRead: number) => void;

  buyMascot: (id: string, price: number) => void;
  equipMascot: (id: string) => void;
  updateProfile: (patch: Partial<ProductProfile>) => void;
  updatePreferences: (patch: Partial<AppPreferences>) => void;
}

export interface SaveWordInput {
  term: string;
  translation: string;
  context: string;
  lessonId: string | null;
  lessonTitle: string | null;
  pronunciation?: string;
  status?: WordStatus;
}

export interface ImportLessonDraft {
  title: string;
  content: string;
  translation?: string;
  description?: string;
  sourceUrl?: string;
  coverImageUrl?: string;
  audioUrl?: string;
  kind?: string;
  level?: string;
}

const defaultProfile: ProductProfile = {
  name: 'Camille',
  initials: 'CA',
  targetLanguage: 'en',
  targetLanguageLabel: 'Anglais',
  levelLabel: 'Débutant 1',
  dailyGoal: 100,
  coins: 0,
  streak: 0,
  totalWordsRead: 0,
  minutesListened: 0,
  cardsReviewed: 0,
};

const createLocalId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const useProductStore = create<ProductState>()((set, get) => ({
  lessons: [],
  words: [],
  statusIndex: new StatusIndex(),
  statusVersion: 0,
  favorites: [],
  playlist: [],
  readingProgress: {},
  profile: defaultProfile,
  preferences: DEFAULT_APP_PREFERENCES,
  syncStatus: 'local',
  equippedMascot: 'outfit-default',
  purchasedMascots: ['outfit-default'],

  setSyncStatus: (status) => set({ syncStatus: status }),

  /**
   * Loads everything the UI needs for one language. Published and owned
   * lessons, saved vocabulary, and the full word-status set in one pass.
   */
  loadLanguage: async (languageCode) => {
    set({ syncStatus: 'syncing' });

    let published: Awaited<ReturnType<typeof fetchPublishedLessons>>;
    let owned: Awaited<ReturnType<typeof fetchOwnedLessons>>;
    let vocabulary: Awaited<ReturnType<typeof fetchVocabulary>>;
    let statuses: Awaited<ReturnType<typeof fetchWordStatuses>>;
    try {
      [published, owned, vocabulary, statuses] = await Promise.all([
        fetchPublishedLessons(languageCode),
        fetchOwnedLessons(),
        fetchVocabulary(languageCode),
        fetchWordStatuses(languageCode),
      ]);
    } catch {
      set({ syncStatus: 'offline' });
      return;
    }

    const online = published.online || vocabulary.online;

    // Saved words imply a status; merge them over the explicit status rows so a
    // LingQ always wins over a stale 'new'.
    const index = new StatusIndex(
      statuses.data.map((record) => ({ lemma: record.lemma, status: record.status }))
    );
    for (const word of vocabulary.data) {
      index.set(word.lemma, word.status);
    }

    set((state) => ({
      lessons: [...owned.data, ...published.data],
      words: vocabulary.data,
      statusIndex: index,
      statusVersion: state.statusVersion + 1,
      syncStatus: online ? 'synced' : 'offline',
      lastSyncedAt: online ? new Date().toISOString() : state.lastSyncedAt,
    }));
  },

  statusOf: (lemma) => get().statusIndex.get(lemma) ?? 'new',

  setWordStatusByLemma: (lemma, status) => {
    const { statusIndex, profile } = get();
    statusIndex.set(lemma, status);
    set((state) => ({ statusVersion: state.statusVersion + 1 }));

    void pushWordStatuses(profile.targetLanguage, [lemma], status);
  },

  /**
   * "Paging moves to known": every remaining new word on the page becomes
   * known in one write.
   */
  markPageKnown: (lemmas) => {
    const { statusIndex, profile } = get();
    const changed: string[] = [];

    for (const lemma of lemmas) {
      const current = statusIndex.get(lemma);
      if (current === undefined || current === 'new') {
        statusIndex.set(lemma, 'known');
        changed.push(lemma);
      }
    }

    if (changed.length === 0) return;

    set((state) => ({
      statusVersion: state.statusVersion + 1,
      profile: {
        ...state.profile,
        coins: state.profile.coins + coinsFor('marked_known', changed.length),
      },
    }));

    void pushWordStatuses(profile.targetLanguage, changed, 'known');
    void bumpDailyStats(profile.targetLanguage, {
      coins: coinsFor('marked_known', changed.length),
    });
  },

  saveWord: (input) => {
    const { profile, statusIndex, words } = get();
    const languageCode = profile.targetLanguage;
    const lemma = toLemma(input.term, languageCode);
    const status = input.status ?? 1;

    const existing = words.find((word) => word.lemma === lemma);

    if (existing) {
      const updated: VocabItem = {
        ...existing,
        translation: input.translation || existing.translation,
        context: input.context || existing.context,
        status,
        nextReviewAt: nextReviewForStatus(status),
      };

      statusIndex.set(lemma, status);
      set((state) => ({
        words: state.words.map((word) => (word.id === existing.id ? updated : word)),
        statusVersion: state.statusVersion + 1,
      }));

      if (existing.remoteId) {
        void pushVocabStatus(existing.remoteId, status, updated.nextReviewAt);
      }
      return updated;
    }

    const word: VocabItem = {
      id: createLocalId('word'),
      languageCode,
      lemma,
      term: input.term,
      translation: input.translation,
      pronunciation: input.pronunciation,
      context: input.context,
      tags: [],
      status,
      lessonId: input.lessonId,
      lessonTitle: input.lessonTitle,
      fsrsCard: newCard(),
      nextReviewAt: nextReviewForStatus(status),
      lastReviewedAt: null,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    statusIndex.set(lemma, status);
    set((state) => ({
      words: [word, ...state.words],
      statusVersion: state.statusVersion + 1,
      profile: {
        ...state.profile,
        coins: state.profile.coins + coinsFor('lingq_created'),
      },
    }));

    // Reconcile the local id with the remote one once the write lands.
    void pushVocabItem({
      languageCode,
      lemma,
      term: word.term,
      translation: word.translation,
      context: word.context,
      pronunciation: word.pronunciation,
      lessonId: word.lessonId,
      status,
      nextReviewAt: word.nextReviewAt,
      fsrsCard: word.fsrsCard,
    }).then((remoteId) => {
      if (!remoteId) return;
      set((state) => ({
        words: state.words.map((item) =>
          item.id === word.id ? { ...item, remoteId } : item
        ),
      }));
    });

    void bumpDailyStats(languageCode, {
      lingqsCreated: 1,
      coins: coinsFor('lingq_created'),
    });

    return word;
  },

  setWordStatus: (wordId, status) => {
    const { words, statusIndex, profile } = get();
    const word = words.find((item) => item.id === wordId);
    if (!word) return;

    const nextReviewAt = nextReviewForStatus(status);
    statusIndex.set(word.lemma, status);

    set((state) => ({
      words: state.words.map((item) =>
        item.id === wordId ? { ...item, status, nextReviewAt } : item
      ),
      statusVersion: state.statusVersion + 1,
    }));

    if (word.remoteId) {
      void pushVocabStatus(word.remoteId, status, nextReviewAt);
    } else {
      void pushWordStatuses(profile.targetLanguage, [word.lemma], status);
    }
  },

  removeWord: (wordId) => {
    const { words, statusIndex } = get();
    const word = words.find((item) => item.id === wordId);
    if (!word) return;

    // Deleting a LingQ returns the word to blue.
    statusIndex.delete(word.lemma);

    set((state) => ({
      words: state.words.filter((item) => item.id !== wordId),
      statusVersion: state.statusVersion + 1,
    }));

    if (word.remoteId) {
      void deleteVocabItem(word.remoteId);
    }
  },

  reviewWord: (wordId, grade) => {
    const { words, statusIndex, profile } = get();
    const word = words.find((item) => item.id === wordId);
    if (!word) return;

    const outcome = applyReview({
      status: word.status,
      card: word.fsrsCard,
      streak: word.reviewCount > 0 && word.lastReviewedAt ? 1 : 0,
      grade,
    });

    statusIndex.set(word.lemma, outcome.status);

    set((state) => ({
      words: state.words.map((item) =>
        item.id === wordId
          ? {
              ...item,
              status: outcome.status,
              fsrsCard: outcome.card,
              nextReviewAt: outcome.nextReviewAt,
              lastReviewedAt: new Date().toISOString(),
              reviewCount: item.reviewCount + 1,
            }
          : item
      ),
      statusVersion: state.statusVersion + 1,
      profile: {
        ...state.profile,
        cardsReviewed: state.profile.cardsReviewed + 1,
        coins: state.profile.coins + coinsFor('review_completed'),
      },
    }));

    if (word.remoteId) {
      void pushVocabStatus(word.remoteId, outcome.status, outcome.nextReviewAt, outcome.card);
    }

    void bumpDailyStats(profile.targetLanguage, {
      reviewsCompleted: 1,
      coins: coinsFor('review_completed'),
    });
  },

  importLesson: async (draft) => {
    const { profile } = get();
    const languageCode = profile.targetLanguage;
    const wordCount = tokenize(draft.content, languageCode).filter((t) => t.isWord).length;

    const payload: ImportLessonInput = {
      languageCode,
      title: draft.title,
      content: draft.content,
      description: draft.description,
      translation: draft.translation,
      sourceUrl: draft.sourceUrl,
      coverImageUrl: draft.coverImageUrl,
      audioUrl: draft.audioUrl,
      kind: draft.kind ?? 'article',
      level: draft.level ?? 'beginner',
      wordCount,
    };

    const remoteId = await pushImportedLesson(payload);

    const lesson: Lesson = {
      id: remoteId ?? createLocalId('lesson'),
      ownerId: null,
      languageCode,
      title: draft.title,
      description: draft.description ?? null,
      kind: (draft.kind ?? 'article') as Lesson['kind'],
      sourceUrl: draft.sourceUrl ?? null,
      coverImageUrl: draft.coverImageUrl ?? null,
      audioUrl: draft.audioUrl ?? null,
      level: (draft.level ?? 'beginner') as Lesson['level'],
      content: draft.content,
      translation: draft.translation ?? null,
      wordCount,
      durationSeconds: null,
      courseId: null,
      collection: 'Leçons importées',
      tags: [],
      isPublished: false,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ lessons: [lesson, ...state.lessons] }));
    return lesson;
  },

  toggleFavorite: (lessonId) =>
    set((state) => ({
      favorites: state.favorites.includes(lessonId)
        ? state.favorites.filter((id) => id !== lessonId)
        : [...state.favorites, lessonId],
    })),

  togglePlaylist: (lessonId) =>
    set((state) => ({
      playlist: state.playlist.includes(lessonId)
        ? state.playlist.filter((id) => id !== lessonId)
        : [...state.playlist, lessonId],
    })),

  reorderPlaylist: (from, to) =>
    set((state) => {
      const next = [...state.playlist];
      const [moved] = next.splice(from, 1);
      if (moved === undefined) return state;
      next.splice(to, 0, moved);
      return { playlist: next };
    }),

  recordReading: (lessonId, wordsRead) => {
    const previous = get().readingProgress[lessonId] ?? 0;
    const gain = Math.max(0, wordsRead - previous);
    if (gain === 0) return;

    const coins = coinsFor('words_read', gain);

    set((state) => ({
      readingProgress: { ...state.readingProgress, [lessonId]: Math.max(previous, wordsRead) },
      profile: {
        ...state.profile,
        totalWordsRead: state.profile.totalWordsRead + gain,
        coins: state.profile.coins + coins,
      },
    }));

    void bumpDailyStats(get().profile.targetLanguage, { wordsRead: gain, coins });
  },

  buyMascot: (id, price) =>
    set((state) => {
      if (state.profile.coins < price || state.purchasedMascots.includes(id)) return state;
      return {
        profile: { ...state.profile, coins: state.profile.coins - price },
        purchasedMascots: [...state.purchasedMascots, id],
        equippedMascot: id,
      };
    }),

  equipMascot: (id) =>
    set((state) => (state.purchasedMascots.includes(id) ? { equippedMascot: id } : state)),

  updateProfile: (patch) => {
    const previousLanguage = get().profile.targetLanguage;
    set((state) => ({ profile: { ...state.profile, ...patch } }));

    // Switching language invalidates every cached lesson and status.
    if (patch.targetLanguage && patch.targetLanguage !== previousLanguage) {
      void get().loadLanguage(patch.targetLanguage);
    }
  },

  updatePreferences: (patch) =>
    set((state) => ({ preferences: { ...state.preferences, ...patch } })),
}));

// ---------------------------------------------------------------------------
// Local persistence
// ---------------------------------------------------------------------------
//
// Supabase is the source of truth, but the learner must be able to read and
// save vocabulary offline. We persist the working set and reconcile on load.

interface PersistedSlice {
  words: VocabItem[];
  statuses: Array<{ lemma: string; status: WordStatus }>;
  favorites: string[];
  playlist: string[];
  readingProgress: Record<string, number>;
  profile: ProductProfile;
  preferences: AppPreferences;
  lastSyncedAt?: string;
}

const STORAGE_KEY = 'yapro-product-v3';
let persistenceStarted = false;

export function hydrateProductStore(): void {
  if (typeof window === 'undefined' || persistenceStarted) return;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { state?: Partial<PersistedSlice> };
      const persisted = parsed.state ?? {};

      const index = new StatusIndex(persisted.statuses ?? []);
      for (const word of persisted.words ?? []) {
        index.set(word.lemma, word.status);
      }

      useProductStore.setState((state) => ({
        words: persisted.words ?? state.words,
        statusIndex: index,
        statusVersion: state.statusVersion + 1,
        favorites: persisted.favorites ?? state.favorites,
        playlist: persisted.playlist ?? state.playlist,
        readingProgress: persisted.readingProgress ?? state.readingProgress,
        profile: { ...state.profile, ...(persisted.profile ?? {}) },
        preferences: { ...state.preferences, ...(persisted.preferences ?? {}) },
        lastSyncedAt: persisted.lastSyncedAt,
        syncStatus: 'local',
      }));
    }
  } catch {
    // Corrupt or unavailable storage must never block the learning loop.
  }

  persistenceStarted = true;

  useProductStore.subscribe((state) => {
    try {
      // Persist the statuses that no LingQ implies — words marked known or
      // ignored outright. Without these, every known word reverts to blue offline.
      const lemmasWithWords = new Set(state.words.map((word) => word.lemma));
      const statuses: Array<{ lemma: string; status: WordStatus }> = [];
      for (const [lemma, status] of state.statusIndex.entries()) {
        if (!lemmasWithWords.has(lemma)) statuses.push({ lemma, status });
      }

      const slice: PersistedSlice = {
        words: state.words,
        statuses,
        favorites: state.favorites,
        playlist: state.playlist,
        readingProgress: state.readingProgress,
        profile: state.profile,
        preferences: state.preferences,
        lastSyncedAt: state.lastSyncedAt,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: slice, version: 3 }));
    } catch {
      // Private browsing and storage quotas are not errors worth surfacing.
    }
  });
}

export { advanceStatus, isSavedStatus, lowerStatus };

// ---------------------------------------------------------------------------
// Compatibility surface
// ---------------------------------------------------------------------------

/** Aliases kept so existing pages compile against the new domain types. */
export type SavedWord = VocabItem;
export type ProductLesson = Lesson;
export type LearningStatus = WordStatus;

export const normalizeWord = (value: string, languageCode: string = 'en') =>
  toLemma(value, languageCode);

/**
 * Stopgap glossary used by the reader when no dictionary is reachable.
 * Phase 1 replaces this with real dictionary lookups.
 */
export const translations: Record<string, string> = {
  every: 'chaque',
  morning: 'matin',
  opens: 'ouvre',
  the: 'le / la',
  little: 'petit',
  kitchen: 'cuisine',
  before: 'avant',
  city: 'ville',
  wakes: 'se réveille',
  checks: 'vérifie',
  bread: 'pain',
  warms: 'chauffe',
  pans: 'poêles',
  writes: 'écrit',
  menu: 'menu',
  small: 'petit',
  blackboard: 'tableau noir',
  today: "aujourd'hui",
  new: 'nouveau',
  guest: 'client',
  arrives: 'arrive',
  early: 'tôt',
  asks: 'demande',
  about: 'au sujet de',
  soup: 'soupe',
  smiles: 'sourit',
  explains: 'explique',
  vegetables: 'légumes',
  came: 'sont venus',
  from: 'de',
  market: 'marché',
  across: 'de l’autre côté',
  river: 'rivière',
  train: 'train',
  rain: 'pluie',
  delayed: 'retardé',
  coffee: 'café',
  travellers: 'voyageurs',
  platform: 'quai',
  story: 'histoire',
  reading: 'lecture',
  word: 'mot',
  language: 'langue',
};
