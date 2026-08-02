import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { createEmptyCard, fsrs, Rating, type Card } from 'ts-fsrs';
import { dictionary, getLessonsForLanguage, getWordCount, normalizeWord, seedLessons, type Lesson, type LessonLevel } from './catalog';
import { productStorage } from './storage';

const STORAGE_KEY = 'yapro.product.v2';

export type VocabularyStatus = 1 | 2 | 3 | 4;

type PersistedFsrsCard = Omit<Card, 'due' | 'last_review'> & {
  due: string;
  last_review?: string;
};

export type VocabularyEntry = {
  id: string;
  term: string;
  normalizedTerm: string;
  translation: string;
  context: string;
  lessonId: string;
  status: VocabularyStatus;
  intervalDays: number;
  nextReview: string;
  fsrsCard?: PersistedFsrsCard;
  createdAt: string;
  updatedAt: string;
};

export type LessonProgress = {
  lessonId: string;
  wordsRead: number;
  progress: number;
  completed: boolean;
  secondsSpent: number;
  listenedSeconds: number;
  updatedAt: string;
};

export type LearnerProfile = {
  displayName: string;
  name?: string;
  targetLanguage: string;
  targetLanguageLabel: string;
  level: 'Débutant 1' | 'Débutant 2' | 'Intermédiaire' | 'Avancé';
  dailyMinutes: number;
  dailyWordGoal: number;
  interests: string[];
};

export type ProductPreferences = {
  autoplayAudio: boolean;
  dailyReminder: boolean;
  readerFontScale: number;
  phraseMode: boolean;
  speechRate: number;
  reviewSessionSize: number;
};

type ProductState = {
  hydrated: boolean;
  onboardingCompleted: boolean;
  profile: LearnerProfile;
  lessons: Lesson[];
  vocabulary: VocabularyEntry[];
  playlistIds: string[];
  likedLessonIds: string[];
  progress: Record<string, LessonProgress>;
  preferences: ProductPreferences;
  activityDates: string[];
  currentStreak: number;
  coins: number;
  equippedMascot: string;
  purchasedMascots: string[];
};

type PersistedState = Omit<ProductState, 'hydrated'>;

type Action =
  | { type: 'hydrate'; payload: PersistedState }
  | { type: 'finishOnboarding'; payload: Partial<LearnerProfile> }
  | { type: 'addLesson'; payload: Lesson }
  | { type: 'saveWord'; payload: VocabularyEntry }
  | { type: 'deleteVocabularyEntry'; payload: string }
  | { type: 'setVocabularyStatus'; payload: { id: string; status: VocabularyStatus } }
  | { type: 'gradeReview'; payload: { id: string; grade: 'again' | 'hard' | 'good' } }
  | { type: 'togglePlaylist'; payload: string }
  | { type: 'toggleLikeLesson'; payload: string }
  | { type: 'updateProgress'; payload: LessonProgress }
  | { type: 'updatePreference'; payload: Partial<ProductPreferences> }
  | { type: 'buyMascot'; payload: { id: string; price: number } }
  | { type: 'equipMascot'; payload: string }
  | { type: 'resetOnboarding' };

const defaultPersistedState: PersistedState = {
  onboardingCompleted: false,
  profile: {
    displayName: 'Alex',
    targetLanguage: 'en',
    targetLanguageLabel: 'anglais',
    level: 'Débutant 1',
    dailyMinutes: 20,
    dailyWordGoal: 100,
    interests: ['Voyage', 'Culture', 'Actualité'],
  },
  lessons: seedLessons,
  vocabulary: [],
  playlistIds: [],
  likedLessonIds: [],
  progress: {},
  preferences: {
    autoplayAudio: false,
    dailyReminder: false,
    readerFontScale: 1,
    phraseMode: true,
    speechRate: 0.9,
    reviewSessionSize: 10,
  },
  activityDates: [],
  currentStreak: 0,
  coins: 150,
  equippedMascot: 'outfit-default',
  purchasedMascots: ['outfit-default'],
};

const initialState: ProductState = {
  ...defaultPersistedState,
  hydrated: false,
};

const reviewScheduler = fsrs();

function serializeFsrsCard(card: Card): PersistedFsrsCard {
  return {
    ...card,
    due: card.due.toISOString(),
    last_review: card.last_review?.toISOString(),
  };
}

function getFsrsCard(entry: VocabularyEntry): Card {
  if (!entry.fsrsCard) return createEmptyCard(new Date(entry.createdAt));
  return {
    ...entry.fsrsCard,
    due: new Date(entry.fsrsCard.due),
    last_review: entry.fsrsCard.last_review
      ? new Date(entry.fsrsCard.last_review)
      : undefined,
  };
}

function mergePersistedState(value: Partial<PersistedState>): PersistedState {
  const imported = (value.lessons ?? []).filter((lesson) => lesson.imported);
  return {
    ...defaultPersistedState,
    ...value,
    profile: { ...defaultPersistedState.profile, ...value.profile },
    preferences: { ...defaultPersistedState.preferences, ...value.preferences },
    lessons: [...seedLessons, ...imported.filter((lesson) => !seedLessons.some((seed) => seed.id === lesson.id))],
    vocabulary: value.vocabulary ?? [],
    playlistIds: value.playlistIds ?? [],
    progress: value.progress ?? {},
    activityDates: value.activityDates ?? [],
  };
}

function recordActivity(state: ProductState) {
  const today = new Date().toISOString().slice(0, 10);
  const activityDates = state.activityDates.includes(today)
    ? state.activityDates
    : [...state.activityDates, today].slice(-366);
  let currentStreak = 0;
  const activeDays = new Set(activityDates);
  const cursor = new Date(`${today}T12:00:00.000Z`);
  while (activeDays.has(cursor.toISOString().slice(0, 10))) {
    currentStreak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return { activityDates, currentStreak };
}

function reducer(state: ProductState, action: Action): ProductState {
  switch (action.type) {
    case 'hydrate':
      return { ...action.payload, hydrated: true };
    case 'finishOnboarding': {
      const newProfile = { ...state.profile, ...action.payload };
      const langChanged = Boolean(
        action.payload.targetLanguage && action.payload.targetLanguage !== state.profile.targetLanguage,
      );
      const lessons = langChanged
        ? getLessonsForLanguage(newProfile.targetLanguage)
        : state.lessons;
      return {
        ...state,
        onboardingCompleted: true,
        profile: newProfile,
        lessons,
      };
    }
    case 'addLesson':
      return { ...state, lessons: [action.payload, ...state.lessons] };
    case 'saveWord': {
      const existing = state.vocabulary.find(
        (item) => item.normalizedTerm === action.payload.normalizedTerm,
      );
      return {
        ...state,
        vocabulary: existing
          ? state.vocabulary.map((item) =>
              item.id === existing.id
                ? {
                    ...item,
                    translation: action.payload.translation,
                    context: action.payload.context,
                    lessonId: action.payload.lessonId,
                    updatedAt: action.payload.updatedAt,
                  }
                : item,
            )
          : [action.payload, ...state.vocabulary],
        coins: state.coins + (existing ? 0 : 1),
      };
    }
    case 'setVocabularyStatus':
      return {
        ...state,
        vocabulary: state.vocabulary.map((item) =>
          item.id === action.payload.id
            ? { ...item, status: action.payload.status, updatedAt: new Date().toISOString() }
            : item,
        ),
      };
    case 'deleteVocabularyEntry':
      return { ...state, vocabulary: state.vocabulary.filter((item) => item.id !== action.payload) };
    case 'gradeReview': {
      const now = new Date();
      const activity = recordActivity(state);
      return {
        ...state,
        ...activity,
        vocabulary: state.vocabulary.map((item) => {
          if (item.id !== action.payload.id) return item;
          const rating =
            action.payload.grade === 'again'
              ? Rating.Again
              : action.payload.grade === 'hard'
                ? Rating.Hard
                : Rating.Good;
          const result = reviewScheduler.next(getFsrsCard(item), now, rating);
          const status =
            action.payload.grade === 'again'
              ? 1
              : action.payload.grade === 'good'
                ? (Math.min(4, item.status + 1) as VocabularyStatus)
                : item.status;
          return {
            ...item,
            intervalDays: result.card.scheduled_days,
            nextReview: result.card.due.toISOString(),
            fsrsCard: serializeFsrsCard(result.card),
            status,
            updatedAt: now.toISOString(),
          };
        }),
        coins: state.coins + (action.payload.grade === 'good' ? 2 : 1),
      };
    }
    case 'togglePlaylist':
      return {
        ...state,
        playlistIds: state.playlistIds.includes(action.payload)
          ? state.playlistIds.filter((id) => id !== action.payload)
          : [...state.playlistIds, action.payload],
      };
    case 'toggleLikeLesson':
      const currentLiked = state.likedLessonIds ?? [];
      return {
        ...state,
        likedLessonIds: currentLiked.includes(action.payload)
          ? currentLiked.filter((id) => id !== action.payload)
          : [...currentLiked, action.payload],
      };
    case 'updateProgress':
      const activity = recordActivity(state);
      return {
        ...state,
        ...activity,
        progress: {
          ...state.progress,
          [action.payload.lessonId]: {
            ...state.progress[action.payload.lessonId],
            ...action.payload,
          },
        },
        coins:
          state.coins +
          (action.payload.completed && !state.progress[action.payload.lessonId]?.completed ? 25 : 0),
      };
    case 'updatePreference':
      return { ...state, preferences: { ...state.preferences, ...action.payload } };
    case 'buyMascot':
      if (state.coins >= action.payload.price && !state.purchasedMascots.includes(action.payload.id)) {
        return {
          ...state,
          coins: state.coins - action.payload.price,
          purchasedMascots: [...state.purchasedMascots, action.payload.id],
          equippedMascot: action.payload.id,
        };
      }
      return state;
    case 'equipMascot':
      if (state.purchasedMascots.includes(action.payload)) {
        return { ...state, equippedMascot: action.payload };
      }
      return state;
    case 'resetOnboarding':
      return { ...state, onboardingCompleted: false };
    default:
      return state;
  }
}

type ProductContextValue = ProductState & {
  likedLessonIds: string[];
  toggleLikeLesson(id: string): void;
  finishOnboarding(profile: Partial<LearnerProfile>): void;
  importLesson(input: { title: string; content: string; level?: string; sourceUrl?: string }): Lesson;
  saveWord(input: { term: string; translation?: string; context: string; lessonId: string }): void;
  setVocabularyStatus(id: string, status: VocabularyStatus): void;
  deleteVocabularyEntry(id: string): void;
  gradeReview(id: string, grade: 'again' | 'hard' | 'good'): void;
  togglePlaylist(id: string): void;
  updateLessonProgress(
    lessonId: string,
    input: Partial<Omit<LessonProgress, 'lessonId' | 'updatedAt'>>,
  ): void;
  updatePreferences(input: Partial<ProductPreferences>): void;
  resetOnboarding(): void;
  dispatch: React.Dispatch<Action>;
  playlist: string[];
  removeFromPlaylist(id: string): void;
  stats: { wordsRead: number; streakDays: number };
  dueVocabulary: VocabularyEntry[];
  knownWords: number;
  totalWordsRead: number;
};

const ProductContext = createContext<ProductContextValue | null>(null);

export function ProductStoreProvider({ children }: PropsWithChildren) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    let active = true;
    productStorage
      .getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (!raw) {
          dispatch({ type: 'hydrate', payload: defaultPersistedState });
          return;
        }
        try {
          dispatch({ type: 'hydrate', payload: mergePersistedState(JSON.parse(raw)) });
        } catch {
          dispatch({ type: 'hydrate', payload: defaultPersistedState });
        }
      })
      .catch(() => {
        if (active) dispatch({ type: 'hydrate', payload: defaultPersistedState });
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    const { hydrated: _hydrated, ...persisted } = state;
    productStorage.setItem(STORAGE_KEY, JSON.stringify(persisted)).catch(() => undefined);
  }, [state]);

  useEffect(() => {
    const updateClock = () => setCurrentTime(Date.now());
    const initialTimer = setTimeout(updateClock, 0);
    const interval = setInterval(updateClock, 60_000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  const importLesson = useCallback(
    ({ title, content, level, sourceUrl }: { title: string; content: string; level?: string; sourceUrl?: string }) => {
      const lesson: Lesson = {
        id: `imported-${Date.now()}`,
        title: title.trim(),
        collection: 'Mes leçons importées',
        language: 'en',
        level: (level as LessonLevel) || state.profile.level,
        kind: 'Cours',
        content: content.trim(),
        durationSeconds: Math.max(20, Math.round(getWordCount(content) / 2.5)),
        imagePosition: 'center',
        imported: true,
        sourceUrl,
      };
      dispatch({ type: 'addLesson', payload: lesson });
      return lesson;
    },
    [state.profile.level],
  );

  const saveWord = useCallback(
    ({
      term,
      translation,
      context,
      lessonId,
    }: {
      term: string;
      translation?: string;
      context: string;
      lessonId: string;
    }) => {
      const normalizedTerm = normalizeWord(term);
      if (!normalizedTerm) return;
      const now = new Date().toISOString();
      dispatch({
        type: 'saveWord',
        payload: {
          id: `word-${normalizedTerm}`,
          term: normalizedTerm,
          normalizedTerm,
          translation: translation || dictionary[normalizedTerm]?.translation || 'À traduire',
          context,
          lessonId,
          status: 1,
          intervalDays: 1,
          nextReview: now,
          fsrsCard: serializeFsrsCard(createEmptyCard(new Date(now))),
          createdAt: now,
          updatedAt: now,
        },
      });
    },
    [],
  );

  const updateLessonProgress = useCallback(
    (
      lessonId: string,
      input: Partial<Omit<LessonProgress, 'lessonId' | 'updatedAt'>>,
    ) => {
      const current = state.progress[lessonId];
      dispatch({
        type: 'updateProgress',
        payload: {
          lessonId,
          wordsRead: input.wordsRead ?? current?.wordsRead ?? 0,
          progress: input.progress ?? current?.progress ?? 0,
          completed: input.completed ?? current?.completed ?? false,
          secondsSpent: input.secondsSpent ?? current?.secondsSpent ?? 0,
          listenedSeconds: input.listenedSeconds ?? current?.listenedSeconds ?? 0,
          updatedAt: new Date().toISOString(),
        },
      });
    },
    [state.progress],
  );

  const dueVocabulary = useMemo(() => {
    return state.vocabulary.filter(
      (item) => item.status < 4 && new Date(item.nextReview).getTime() <= currentTime,
    );
  }, [currentTime, state.vocabulary]);

  const knownWords = useMemo(
    () => state.vocabulary.filter((item) => item.status === 4).length,
    [state.vocabulary],
  );
  const totalWordsRead = useMemo(
    () => Object.values(state.progress).reduce((sum, item) => sum + item.wordsRead, 0),
    [state.progress],
  );

  const value = useMemo<ProductContextValue>(
    () => ({
      ...state,
      likedLessonIds: state.likedLessonIds ?? [],
      toggleLikeLesson: (id) => dispatch({ type: 'toggleLikeLesson', payload: id }),
      finishOnboarding: (profile) => dispatch({ type: 'finishOnboarding', payload: profile }),
      importLesson,
      saveWord,
      setVocabularyStatus: (id, status) =>
        dispatch({ type: 'setVocabularyStatus', payload: { id, status } }),
      deleteVocabularyEntry: (id) => dispatch({ type: 'deleteVocabularyEntry', payload: id }),
      gradeReview: (id, grade) => dispatch({ type: 'gradeReview', payload: { id, grade } }),
      togglePlaylist: (id) => dispatch({ type: 'togglePlaylist', payload: id }),
      removeFromPlaylist: (id) => dispatch({ type: 'togglePlaylist', payload: id }),
      playlist: state.playlistIds,
      stats: { wordsRead: totalWordsRead, streakDays: state.currentStreak },
      updateLessonProgress,
      updatePreferences: (input) => dispatch({ type: 'updatePreference', payload: input }),
      resetOnboarding: () => dispatch({ type: 'resetOnboarding' }),
      dueVocabulary,
      knownWords,
      totalWordsRead,
      dispatch,
    }),
    [dueVocabulary, importLesson, knownWords, saveWord, state, totalWordsRead, updateLessonProgress, dispatch],
  );

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

export function useProduct() {
  const value = useContext(ProductContext);
  if (!value) throw new Error('useProduct must be used inside ProductStoreProvider');
  return value;
}
