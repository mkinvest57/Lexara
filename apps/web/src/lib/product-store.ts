'use client';

import type { StaticImageData } from 'next/image';
import { create } from 'zustand';
import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs';
import annaStation from '../../../mobile/assets/images/lesson-anna-station.jpg';
import dailyPodcast from '../../../mobile/assets/images/lesson-daily-podcast.jpg';
import marketNews from '../../../mobile/assets/images/lesson-market-news.jpg';
import mikeKitchen from '../../../mobile/assets/images/lesson-mike-kitchen.jpg';
import mikeMarket from '../../../mobile/assets/images/lesson-mike-market.jpg';
import stellaCity from '../../../mobile/assets/images/lesson-stella-city.jpg';

export type LearningStatus = 1 | 2 | 3 | 4 | 5;
import { formatDuration, getLessonsForLanguage } from './catalog';
export type SyncStatus = 'local' | 'syncing' | 'synced' | 'offline';

type PersistedFsrsCard = Omit<Card, 'due' | 'last_review'> & {
  due: string;
  last_review?: string;
};

export interface ProductLesson {
  id: string;
  title: string;
  collection: string;
  level: 'debutant-1' | 'debutant-2' | 'intermediaire-1' | 'intermediaire-2' | 'avance';
  levelLabel: string;
  type: string;
  image: StaticImageData | string;
  content: string;
  translation: string;
  wordCount: number;
  duration: string;
  unknownPercent: number;
  likes: number;
  imported?: boolean;
  sourceUrl?: string;
}

export interface SavedWord {
  id: string;
  term: string;
  pronunciation?: string;
  translation: string;
  context: string;
  lessonId: string;
  lessonTitle: string;
  status: LearningStatus;
  reviewCount: number;
  nextReview: string;
  fsrsCard?: PersistedFsrsCard;
  createdAt: string;
  remoteId?: string;
}

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

interface ProductPreferences {
  interfaceLanguage: string;
  theme: 'clair' | 'sombre';
  readerFontSize: number;
  showPronunciation: boolean;
  autoPlayAudio: boolean;
  speechRate: number;
  dailyReviewSize: number;
}

interface RemotePayload {
  lessons?: any[];
  words?: any[];
  profile?: any;
  stats?: any;
}

interface ProductState {
  lessons: ProductLesson[];
  words: SavedWord[];
  favorites: string[];
  playlist: string[];
  readingProgress: Record<string, number>;
  profile: ProductProfile;
  preferences: ProductPreferences;
  syncStatus: SyncStatus;
  lastSyncedAt?: string;
  setSyncStatus: (status: SyncStatus) => void;
  mergeRemote: (payload: RemotePayload) => void;
  importLesson: (
    lesson: Omit<ProductLesson, 'id' | 'wordCount' | 'unknownPercent' | 'likes' | 'imported'>
  ) => ProductLesson;
  toggleFavorite: (lessonId: string) => void;
  togglePlaylist: (lessonId: string) => void;
  saveWord: (
    word: Omit<SavedWord, 'id' | 'createdAt' | 'nextReview' | 'reviewCount'> & { remoteId?: string }
  ) => SavedWord;
  setWordStatus: (wordId: string, status: LearningStatus) => void;
  removeWord: (wordId: string) => void;
  reviewWord: (wordId: string, correct: boolean) => void;
  recordReading: (lessonId: string, exploredWords: number) => void;
  updateProfile: (patch: Partial<ProductProfile>) => void;
  updatePreferences: (patch: Partial<ProductPreferences>) => void;
}

const mikeStory = `Every morning, Mike opens the little kitchen before the city wakes. He checks the bread, warms the pans, and writes the menu on a small blackboard. Today, a new guest arrives early and asks about the soup. Mike smiles and explains that the vegetables came from the market across the river. The guest chooses a table near the window and listens while the first buses begin to move outside.`;

const marketStory = `Mike walks to the Saturday market with a short list in his pocket. The square is already bright with fruit, flowers, and people calling to their neighbours. He tastes a tomato, chooses fresh herbs, and speaks with Anna at the cheese stall. They compare recipes and decide to cook dinner together after work.`;

const stationStory = `Anna reaches the station just as the rain begins. Her train is delayed, so she buys a coffee and watches travellers hurry beneath the old clock. A child drops a red scarf near the platform. Anna picks it up and returns it to his father before her train finally appears.`;

const cityStory = `Stella loves walking through the city at the quiet end of the afternoon. She notices balconies full of plants, small cafés preparing for dinner, and musicians testing their instruments. Each street feels familiar, but there is always one doorway or conversation she has never noticed before.`;

const podcastStory = `Welcome to the Daily Five, a short podcast for curious language learners. In today's episode, we look at five simple habits that make reading easier: choose a calm place, read a little every day, keep moving when a word is unclear, save only useful vocabulary, and return to stories you genuinely enjoy.`;

const newsStory = `The neighbourhood market will stay open later this summer after residents asked for more evening hours. Local farmers say the change will help people shop after work. The council will test the new schedule for six weeks and collect feedback from visitors and stall owners.`;

export const seedLessons: ProductLesson[] = [
  {
    id: 'mini-1a',
    title: '1a · Mike est cuisinier, première partie',
    collection: 'Mini-histoires',
    level: 'debutant-1',
    levelLabel: 'Débutant 1',
    type: 'Mini-histoire',
    image: mikeKitchen,
    content: mikeStory,
    translation: `Chaque matin, Mike ouvre la petite cuisine avant le réveil de la ville. Il vérifie le pain, chauffe les poêles et écrit le menu sur un petit tableau noir.`,
    wordCount: 94,
    duration: '02:48',
    unknownPercent: 89,
    likes: 708,
  },
  {
    id: 'mini-1b',
    title: '1b · Mike au marché, deuxième partie',
    collection: 'Mini-histoires',
    level: 'debutant-1',
    levelLabel: 'Débutant 1',
    type: 'Mini-histoire',
    image: mikeMarket,
    content: marketStory,
    translation: `Mike va au marché du samedi avec une courte liste dans sa poche. La place est déjà pleine de fruits, de fleurs et de voisins.`,
    wordCount: 82,
    duration: '02:31',
    unknownPercent: 93,
    likes: 180,
  },
  {
    id: 'mini-1c',
    title: '1c · Anna attend son train',
    collection: 'Mini-histoires',
    level: 'debutant-1',
    levelLabel: 'Débutant 1',
    type: 'Mini-histoire',
    image: annaStation,
    content: stationStory,
    translation: `Anna arrive à la gare au moment où la pluie commence. Son train est retardé, alors elle achète un café.`,
    wordCount: 76,
    duration: '02:16',
    unknownPercent: 87,
    likes: 145,
  },
  {
    id: 'mini-2',
    title: '2 · Stella redécouvre sa ville',
    collection: 'Mini-histoires',
    level: 'debutant-2',
    levelLabel: 'Débutant 2',
    type: 'Mini-histoire',
    image: stellaCity,
    content: cityStory,
    translation: `Stella aime marcher dans la ville à la fin tranquille de l'après-midi. Elle remarque les balcons pleins de plantes.`,
    wordCount: 71,
    duration: '02:07',
    unknownPercent: 78,
    likes: 427,
  },
  {
    id: 'mini-3',
    title: '3 · Cinq habitudes pour mieux lire',
    collection: 'Mini-histoires',
    level: 'debutant-2',
    levelLabel: 'Débutant 2',
    type: 'Podcast',
    image: dailyPodcast,
    content: podcastStory,
    translation: `Bienvenue dans le Daily Five, un court podcast pour les apprenants curieux. Aujourd'hui, nous observons cinq habitudes simples.`,
    wordCount: 86,
    duration: '03:04',
    unknownPercent: 74,
    likes: 304,
  },
  {
    id: 'mini-4',
    title: '4 · Le marché ouvre plus tard',
    collection: 'Mini-histoires',
    level: 'intermediaire-1',
    levelLabel: 'Intermédiaire 1',
    type: 'Actualité',
    image: marketNews,
    content: newsStory,
    translation: `Le marché du quartier restera ouvert plus tard cet été après la demande des habitants.`,
    wordCount: 69,
    duration: '02:39',
    unknownPercent: 62,
    likes: 221,
  },
  {
    id: 'guided-reading',
    title: 'Lire sans tout traduire',
    collection: 'Pour vous',
    level: 'debutant-1',
    levelLabel: 'Débutant 1',
    type: 'Formation guidée',
    image: dailyPodcast,
    content: podcastStory,
    translation: `Une méthode courte pour conserver le rythme et comprendre le sens général sans interrompre chaque phrase.`,
    wordCount: 104,
    duration: '04:12',
    unknownPercent: 56,
    likes: 382,
  },
  {
    id: 'guided-listening',
    title: 'Écouter avec le texte',
    collection: 'Pour vous',
    level: 'debutant-2',
    levelLabel: 'Débutant 2',
    type: 'Formation guidée',
    image: annaStation,
    content: stationStory,
    translation: `Écoutez une première fois, puis relisez le texte en remarquant le rythme des phrases.`,
    wordCount: 88,
    duration: '03:46',
    unknownPercent: 48,
    likes: 256,
  },
  {
    id: 'guided-context',
    title: 'Comprendre les mots en contexte',
    collection: 'Pour vous',
    level: 'intermediaire-1',
    levelLabel: 'Intermédiaire 1',
    type: 'Formation guidée',
    image: mikeKitchen,
    content: mikeStory,
    translation: `Appuyez-vous sur la phrase complète avant de sauvegarder une nouvelle signification.`,
    wordCount: 118,
    duration: '05:02',
    unknownPercent: 41,
    likes: 198,
  },
  {
    id: 'guided-retell',
    title: 'Raconter une histoire simple',
    collection: 'Pour vous',
    level: 'intermediaire-1',
    levelLabel: 'Intermédiaire 1',
    type: 'Expression orale',
    image: stellaCity,
    content: cityStory,
    translation: `Relisez, fermez le texte, puis racontez l'idée principale avec vos propres mots.`,
    wordCount: 97,
    duration: '04:37',
    unknownPercent: 39,
    likes: 174,
  },
  {
    id: 'news-neighbourhood',
    title: 'Nouvelles du quartier',
    collection: 'Actualités faciles',
    level: 'debutant-2',
    levelLabel: 'Débutant 2',
    type: 'Actualité',
    image: marketNews,
    content: newsStory,
    translation: `Une actualité locale courte, pensée pour développer le vocabulaire du quotidien.`,
    wordCount: 69,
    duration: '02:39',
    unknownPercent: 52,
    likes: 109,
  },
  {
    id: 'city-notebook',
    title: 'Carnet de ville',
    collection: 'Actualités faciles',
    level: 'intermediaire-2',
    levelLabel: 'Intermédiaire 2',
    type: 'Article',
    image: stellaCity,
    content: cityStory,
    translation: `Un portrait attentif de la ville, de ses voix et des petits détails que l'on oublie de regarder.`,
    wordCount: 121,
    duration: '05:18',
    unknownPercent: 34,
    likes: 92,
  },
];

const seedLessonIds = new Set(seedLessons.map((lesson) => lesson.id));

const today = new Date();
const dueToday = today.toISOString();

const seedWords: SavedWord[] = [
  {
    id: 'word-morning',
    term: 'morning',
    pronunciation: 'ˈmɔːnɪŋ',
    translation: 'matin',
    context: 'Every morning, Mike opens the little kitchen before the city wakes.',
    lessonId: 'mini-1a',
    lessonTitle: '1a · Mike est cuisinier, première partie',
    status: 1,
    reviewCount: 2,
    nextReview: dueToday,
    createdAt: today.toISOString(),
  },
  {
    id: 'word-kitchen',
    term: 'kitchen',
    pronunciation: 'ˈkɪtʃən',
    translation: 'cuisine',
    context: 'Every morning, Mike opens the little kitchen before the city wakes.',
    lessonId: 'mini-1a',
    lessonTitle: '1a · Mike est cuisinier, première partie',
    status: 2,
    reviewCount: 3,
    nextReview: dueToday,
    createdAt: today.toISOString(),
  },
  {
    id: 'word-market',
    term: 'market',
    pronunciation: 'ˈmɑːkɪt',
    translation: 'marché',
    context: 'Mike walks to the Saturday market with a short list in his pocket.',
    lessonId: 'mini-1b',
    lessonTitle: '1b · Mike au marché, deuxième partie',
    status: 3,
    reviewCount: 5,
    nextReview: dueToday,
    createdAt: today.toISOString(),
  },
  {
    id: 'word-neighbour',
    term: 'neighbour',
    pronunciation: 'ˈneɪbə',
    translation: 'voisin',
    context: 'The square is already bright with people calling to their neighbours.',
    lessonId: 'mini-1b',
    lessonTitle: '1b · Mike au marché, deuxième partie',
    status: 4,
    reviewCount: 7,
    nextReview: dueToday,
    createdAt: today.toISOString(),
  },
  {
    id: 'word-platform',
    term: 'platform',
    pronunciation: 'ˈplætfɔːm',
    translation: 'quai',
    context: 'A child drops a red scarf near the platform.',
    lessonId: 'mini-1c',
    lessonTitle: '1c · Anna attend son train',
    status: 1,
    reviewCount: 1,
    nextReview: dueToday,
    createdAt: today.toISOString(),
  },
  {
    id: 'word-balcony',
    term: 'balcony',
    pronunciation: 'ˈbælkəni',
    translation: 'balcon',
    context: 'She notices balconies full of plants.',
    lessonId: 'mini-2',
    lessonTitle: '2 · Stella redécouvre sa ville',
    status: 5,
    reviewCount: 9,
    nextReview: new Date(today.getTime() + 7 * 86_400_000).toISOString(),
    createdAt: today.toISOString(),
  },
];

const defaultProfile: ProductProfile = {
  name: 'Camille',
  initials: 'CA',
  targetLanguage: 'en',
  targetLanguageLabel: 'Anglais',
  levelLabel: 'Débutant 1',
  dailyGoal: 100,
  coins: 33,
  streak: 3,
  totalWordsRead: 465,
  minutesListened: 46,
  cardsReviewed: 24,
};

const defaultPreferences: ProductPreferences = {
  interfaceLanguage: 'Français',
  theme: 'clair',
  readerFontSize: 20,
  showPronunciation: true,
  autoPlayAudio: false,
  speechRate: 0.9,
  dailyReviewSize: 12,
};

const normalizeTerm = (value: string) => value.toLocaleLowerCase().replace(/[^\p{L}\p{N}'-]/gu, '');

const reviewScheduler = fsrs();

const serializeFsrsCard = (card: Card): PersistedFsrsCard => ({
  ...card,
  due: card.due.toISOString(),
  last_review: card.last_review?.toISOString(),
});

const getFsrsCard = (word: SavedWord): Card =>
  word.fsrsCard
    ? {
        ...word.fsrsCard,
        due: new Date(word.fsrsCard.due),
        last_review: word.fsrsCard.last_review
          ? new Date(word.fsrsCard.last_review)
          : undefined,
      }
    : createEmptyCard(new Date(word.createdAt));

const getWordCount = (content: string) => content.trim().split(/\s+/).filter(Boolean).length;

const createLocalId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const mapRemoteLesson = (lesson: any): ProductLesson => ({
  id: String(lesson.id),
  title: lesson.title || 'Leçon importée',
  collection: lesson.imported ? 'Leçons importées' : 'Ma bibliothèque',
  level:
    lesson.level === 'advanced'
      ? 'avance'
      : lesson.level === 'intermediate'
        ? 'intermediaire-1'
        : 'debutant-1',
  levelLabel:
    lesson.level === 'advanced'
      ? 'Avancé'
      : lesson.level === 'intermediate'
        ? 'Intermédiaire 1'
        : 'Débutant 1',
  type: lesson.type || 'Article',
  image: lesson.imageUrl || '/brand/immerli-hero.png',
  content:
    lesson.content || lesson.sentences?.map((sentence: any) => sentence.text).join(' ') || '',
  translation: lesson.translation || 'Ajoutez une traduction depuis le lecteur.',
  wordCount: lesson.wordCount || getWordCount(lesson.content || ''),
  duration: lesson.duration || '03:00',
  unknownPercent: lesson.unknownPercent ?? 80,
  likes: lesson.likes || 0,
  imported: Boolean(lesson.imported || lesson.sourceUrl),
  sourceUrl: lesson.sourceUrl,
});

const mapRemoteWord = (word: any): SavedWord => ({
  id: `remote-${word.id}`,
  remoteId: String(word.id),
  term: word.term,
  pronunciation: word.pronunciation,
  translation: word.translation || '',
  context: word.occurrences?.[0]?.context || word.context || '',
  lessonId: word.occurrences?.[0]?.lesson?.id || word.lessonId || '',
  lessonTitle: word.occurrences?.[0]?.lesson?.title || word.lessonTitle || 'Leçon',
  status: Math.min(5, Math.max(1, word.status || 1)) as LearningStatus,
  reviewCount: word.srsItem?.successCount || 0,
  nextReview: word.srsItem?.nextReview || dueToday,
  createdAt: word.createdAt || today.toISOString(),
});

export const useProductStore = create<ProductState>()((set, get) => ({
  lessons: seedLessons,
  words: seedWords,
  favorites: ['mini-1a', 'mini-2'],
  playlist: ['mini-1a', 'mini-1c'],
  readingProgress: { 'mini-1a': 24 },
  profile: defaultProfile,
  preferences: defaultPreferences,
  syncStatus: 'local',
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  mergeRemote: ({ lessons, words, profile, stats }) =>
    set((state) => {
      const remoteLessons = lessons?.map(mapRemoteLesson) || [];
      const remoteWords = words?.map(mapRemoteWord) || [];
      const knownLessonIds = new Set(remoteLessons.map((lesson) => lesson.id));
      const knownWordTerms = new Set(remoteWords.map((word) => normalizeTerm(word.term)));

      return {
        lessons: remoteLessons.length
          ? [...remoteLessons, ...state.lessons.filter((lesson) => !knownLessonIds.has(lesson.id))]
          : state.lessons,
        words: remoteWords.length
          ? [
              ...remoteWords,
              ...state.words.filter((word) => !knownWordTerms.has(normalizeTerm(word.term))),
            ]
          : state.words,
        profile: {
          ...state.profile,
          name: profile?.user?.name || profile?.name || state.profile.name,
          targetLanguage: profile?.targetLanguage || state.profile.targetLanguage,
          levelLabel: profile?.level || state.profile.levelLabel,
          dailyGoal: profile?.dailyGoalWords || state.profile.dailyGoal,
          totalWordsRead: stats?.totalWordsRead ?? state.profile.totalWordsRead,
          cardsReviewed: stats?.cardsReviewed ?? state.profile.cardsReviewed,
        },
        syncStatus: 'synced',
        lastSyncedAt: new Date().toISOString(),
      };
    }),
  importLesson: (lessonInput) => {
    const lesson: ProductLesson = {
      ...lessonInput,
      id: createLocalId('lesson'),
      wordCount: getWordCount(lessonInput.content),
      unknownPercent: 100,
      likes: 0,
      imported: true,
    };
    set((state) => ({
      lessons: [lesson, ...state.lessons],
      playlist: [lesson.id, ...state.playlist],
    }));
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
  saveWord: (wordInput) => {
    const existing = get().words.find(
      (word) => normalizeTerm(word.term) === normalizeTerm(wordInput.term)
    );
    if (existing) {
      set((state) => ({
        words: state.words.map((word) =>
          word.id === existing.id
            ? {
                ...word,
                translation: wordInput.translation,
                context: wordInput.context,
                status: wordInput.status,
              }
            : word
        ),
      }));
      return { ...existing, ...wordInput };
    }

    const word: SavedWord = {
      ...wordInput,
      id: wordInput.remoteId ? `remote-${wordInput.remoteId}` : createLocalId('word'),
      reviewCount: 0,
      nextReview: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      fsrsCard: serializeFsrsCard(createEmptyCard(new Date())),
    };
    set((state) => ({ words: [word, ...state.words] }));
    return word;
  },
  setWordStatus: (wordId, status) =>
    set((state) => ({
      words: state.words.map((word) => (word.id === wordId ? { ...word, status } : word)),
    })),
  removeWord: (wordId) =>
    set((state) => ({ words: state.words.filter((word) => word.id !== wordId) })),
  reviewWord: (wordId, correct) =>
    set((state) => {
      return {
        words: state.words.map((word) => {
          if (word.id !== wordId) return word;
          const result = reviewScheduler.next(
            getFsrsCard(word),
            new Date(),
            correct ? Rating.Good : Rating.Again
          );
          const status = (
            correct ? Math.min(5, word.status + 1) : Math.max(1, word.status - 1)
          ) as LearningStatus;
          return {
            ...word,
            status,
            reviewCount: word.reviewCount + 1,
            nextReview: result.card.due.toISOString(),
            fsrsCard: serializeFsrsCard(result.card),
          };
        }),
        profile: {
          ...state.profile,
          cardsReviewed: state.profile.cardsReviewed + 1,
          coins: state.profile.coins + (correct ? 2 : 1),
        },
      };
    }),
  recordReading: (lessonId, exploredWords) =>
    set((state) => {
      const previous = state.readingProgress[lessonId] || 0;
      const gain = Math.max(0, exploredWords - previous);
      return {
        readingProgress: {
          ...state.readingProgress,
          [lessonId]: Math.max(previous, exploredWords),
        },
        profile: {
          ...state.profile,
          totalWordsRead: state.profile.totalWordsRead + gain,
          coins: state.profile.coins + Math.ceil(gain / 5),
        },
      };
    }),
  updateProfile: (patch) =>
    set((state) => {
      const nextProfile = { ...state.profile, ...patch };
      const langChanged = Boolean(
        patch.targetLanguage && patch.targetLanguage !== state.profile.targetLanguage
      );
      let lessons = state.lessons;
      if (langChanged && patch.targetLanguage) {
        const rawLessons = getLessonsForLanguage(patch.targetLanguage);
        lessons = rawLessons.map((l: any) => ({
          id: l.id,
          title: l.title,
          collection: l.collection,
          level:
            l.level === 'Débutant 1'
              ? 'debutant-1'
              : l.level === 'Débutant 2'
                ? 'debutant-2'
                : l.level === 'Intermédiaire'
                  ? 'intermediaire-1'
                  : 'avance',
          levelLabel: l.level,
          type: l.kind,
          image: l.imagePosition === 'center' ? mikeKitchen : stellaCity,
          content: l.content,
          translation: l.translation || '',
          wordCount: getWordCount(l.content),
          duration: formatDuration(l.durationSeconds),
          unknownPercent: 100,
          likes: 0,
        }));
      }
      return { profile: nextProfile, lessons };
    }),
  updatePreferences: (patch) =>
    set((state) => ({ preferences: { ...state.preferences, ...patch } })),
}));

type PersistedProductState = Pick<
  ProductState,
  | 'lessons'
  | 'words'
  | 'favorites'
  | 'playlist'
  | 'readingProgress'
  | 'profile'
  | 'preferences'
  | 'lastSyncedAt'
>;

const PRODUCT_STORAGE_KEY = 'immerli-product-v2';
let persistenceStarted = false;

const getPersistedSlice = (state: ProductState): PersistedProductState => ({
  lessons: state.lessons.filter((lesson) => !seedLessonIds.has(lesson.id)),
  words: state.words,
  favorites: state.favorites,
  playlist: state.playlist,
  readingProgress: state.readingProgress,
  profile: state.profile,
  preferences: state.preferences,
  lastSyncedAt: state.lastSyncedAt,
});

export function hydrateProductStore() {
  if (typeof window === 'undefined' || persistenceStarted) return;

  try {
    const rawValue = window.localStorage.getItem(PRODUCT_STORAGE_KEY);
    if (rawValue) {
      const parsed = JSON.parse(rawValue) as {
        state?: Partial<PersistedProductState>;
      } & Partial<PersistedProductState>;
      const persisted = (parsed.state || parsed) as Partial<PersistedProductState>;
      const persistedLessons = persisted.lessons || [];
      const persistedLessonIds = new Set(persistedLessons.map((lesson) => lesson.id));
      const defaultPrefs: ProductPreferences = {
        interfaceLanguage: 'fr',
        theme: 'clair',
        readerFontSize: 18,
        showPronunciation: true,
        autoPlayAudio: false,
        speechRate: 0.9,
        dailyReviewSize: 10,
      };
      useProductStore.setState({
        ...persisted,
        preferences: {
          ...defaultPrefs,
          ...(persisted.preferences || {}),
        },
        lessons: [
          ...persistedLessons,
          ...seedLessons.filter((lesson) => !persistedLessonIds.has(lesson.id)),
        ],
        syncStatus: 'local',
      });
    }
  } catch {
    // Invalid or unavailable browser storage falls back to the in-memory product state.
  }

  persistenceStarted = true;
  useProductStore.subscribe((state) => {
    try {
      window.localStorage.setItem(
        PRODUCT_STORAGE_KEY,
        JSON.stringify({ state: getPersistedSlice(state), version: 2 })
      );
    } catch {
      // Private browsing and storage quotas should never block the learning loop.
    }
  });
}

export const translations: Record<string, string> = {
  every: 'chaque',
  morning: 'matin',
  mike: 'Mike',
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

export const normalizeWord = normalizeTerm;
