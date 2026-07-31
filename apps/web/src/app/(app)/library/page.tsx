'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  BookOpen,
  ChevronRight,
  Clock3,
  FilePlus2,
  Filter,
  Heart,
  ListMusic,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { LessonCard } from '@/components/library/LessonCard';
import { useProductStore, type ProductLesson } from '@/lib/product-store';

const levels = [
  ['tous', 'Tous niveaux'],
  ['debutant-1', 'Débutant 1'],
  ['debutant-2', 'Débutant 2'],
  ['intermediaire-1', 'Intermédiaire 1'],
  ['intermediaire-2', 'Intermédiaire 2'],
  ['avance', 'Avancé'],
] as const;

type LibraryView = 'continue' | 'lessons' | 'playlist' | 'imports';

export default function LibraryPage() {
  const lessons = useProductStore((state) => state.lessons);
  const favorites = useProductStore((state) => state.favorites);
  const playlist = useProductStore((state) => state.playlist);
  const readingProgress = useProductStore((state) => state.readingProgress);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('tous');
  const [view, setView] = useState<LibraryView>('continue');
  const [showFilters, setShowFilters] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const filteredLessons = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const searchingEntireLibrary = Boolean(
      query || level !== 'tous' || onlyFavorites || showFilters
    );

    return lessons.filter((lesson) => {
      const matchesQuery =
        !query ||
        `${lesson.title} ${lesson.collection} ${lesson.type}`.toLocaleLowerCase().includes(query);
      const matchesLevel = level === 'tous' || lesson.level === level;
      const matchesFavorites = !onlyFavorites || favorites.includes(lesson.id);
      const matchesView = searchingEntireLibrary
        ? true
        : view === 'lessons' ||
          (view === 'playlist' && playlist.includes(lesson.id)) ||
          (view === 'imports' && lesson.imported) ||
          (view === 'continue' && (readingProgress[lesson.id] || playlist.includes(lesson.id)));
      return matchesQuery && matchesLevel && matchesFavorites && matchesView;
    });
  }, [
    favorites,
    lessons,
    level,
    onlyFavorites,
    playlist,
    readingProgress,
    search,
    showFilters,
    view,
  ]);

  const searchMode = Boolean(search.trim() || level !== 'tous' || onlyFavorites || showFilters);
  const collections = useMemo(() => {
    const groups = new Map<string, ProductLesson[]>();
    lessons.forEach((lesson) => {
      if (view === 'playlist' && !playlist.includes(lesson.id)) return;
      if (view === 'imports' && !lesson.imported) return;
      const key =
        view === 'continue'
          ? lesson.collection === 'Mini-histoires'
            ? 'Mini-histoires'
            : 'Pour vous'
          : lesson.collection;
      groups.set(key, [...(groups.get(key) || []), lesson]);
    });
    return [...groups.entries()];
  }, [lessons, playlist, view]);

  const resetFilters = () => {
    setSearch('');
    setLevel('tous');
    setOnlyFavorites(false);
    setShowFilters(false);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f1f3f4]">
      <h1 className="sr-only">Bibliothèque YAPRO</h1>
      <section className="sticky top-[72px] z-30 border-b border-slate-300 bg-[#eef0f1]/95 shadow-sm backdrop-blur-xl">
        <div className="flex min-h-[64px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <label className="relative w-full max-w-[420px]">
            <span className="sr-only">Rechercher dans la bibliothèque</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Recherche dans la Bibliothèque…"
              name="library-search"
              autoComplete="off"
              className="h-11 w-full rounded-xl border border-slate-300 bg-white pl-4 pr-11 text-[15px] shadow-sm outline-none transition-colors placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
            />
            {search ? (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-1 top-1 grid h-9 w-9 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <Search className="absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
            )}
          </label>

          <div
            className="hidden flex-1 items-center justify-center gap-2 xl:flex"
            aria-label="Niveau de difficulté"
          >
            {levels.slice(1, 5).map(([value, labelValue]) => (
              <button
                key={value}
                type="button"
                onClick={() => setLevel(level === value ? 'tous' : value)}
                className={`min-h-9 rounded-full px-3 text-xs font-semibold transition ${level === value ? 'bg-[#0b1c2d] text-white' : 'text-slate-600 hover:bg-white'}`}
              >
                {labelValue}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition ${showFilters ? 'border-[#0b1c2d] bg-[#0b1c2d] text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'}`}
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Filtres</span>
          </button>
          <Link
            href="/import"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-[#0b1c2d] px-4 text-sm font-bold text-white transition hover:bg-slate-800"
          >
            <FilePlus2 className="h-4 w-4" />
            <span className="hidden sm:inline">Importer</span>
          </Link>
        </div>
      </section>

      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <div
          className="mb-6 flex items-center gap-1 overflow-x-auto"
          role="tablist"
          aria-label="Sections de la bibliothèque"
        >
          {(
            [
              ['continue', 'Continuer à étudier'],
              ['lessons', 'Leçons'],
              ['playlist', 'Playlist'],
              ['imports', 'Leçons importées'],
            ] as [LibraryView, string][]
          ).map(([value, labelValue]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={view === value}
              onClick={() => setView(value)}
              className={`min-h-10 whitespace-nowrap rounded-xl px-4 text-sm font-semibold transition ${view === value ? 'bg-white text-[#0b1c2d] shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'}`}
            >
              {labelValue}
            </button>
          ))}
        </div>

        {searchMode ? (
          <SearchResults
            lessons={filteredLessons}
            level={level}
            setLevel={setLevel}
            onlyFavorites={onlyFavorites}
            setOnlyFavorites={setOnlyFavorites}
            resetFilters={resetFilters}
            showFilters={showFilters}
          />
        ) : view === 'imports' && !collections.length ? (
          <EmptyImports />
        ) : (
          <div className="space-y-8">
            {view === 'continue' && (
              <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
                    <ListMusic className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="font-bold">Votre playlist est prête</p>
                    <p className="mt-0.5 text-sm text-slate-500">
                      {playlist.length} leçons à lire ou écouter, dans l’ordre de votre choix.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setView('playlist')}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50"
                >
                  Ouvrir la playlist <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
            {collections.map(([collection, collectionLessons], collectionIndex) => (
              <section key={collection} aria-labelledby={`collection-${collection}`}>
                <div className="mb-4 flex items-center justify-between">
                  <h2
                    id={`collection-${collection}`}
                    className="text-xl font-bold tracking-tight text-[#0b1c2d]"
                  >
                    {collection}
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setSearch(collection);
                      setView('lessons');
                    }}
                    className="min-h-9 rounded-lg px-3 text-sm font-semibold text-slate-600 hover:bg-white hover:text-[#0b1c2d]"
                  >
                    Tout voir
                  </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-3 sm:gap-3">
                  {collectionLessons.slice(0, 8).map((lesson, lessonIndex) => (
                    <LessonCard
                      key={lesson.id}
                      lesson={lesson}
                      priority={collectionIndex === 0 && lessonIndex === 0}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SearchResults({
  lessons,
  level,
  setLevel,
  onlyFavorites,
  setOnlyFavorites,
  resetFilters,
  showFilters,
}: {
  lessons: ProductLesson[];
  level: string;
  setLevel: (level: string) => void;
  onlyFavorites: boolean;
  setOnlyFavorites: (value: boolean) => void;
  resetFilters: () => void;
  showFilters: boolean;
}) {
  return (
    <div
      className={`mx-auto grid max-w-[1320px] gap-6 ${showFilters ? 'lg:grid-cols-[minmax(0,1fr)_330px]' : ''}`}
    >
      <section>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.12em] text-slate-500">
              Résultats
            </p>
            <h1 className="mt-1 text-2xl font-bold">
              {lessons.length} leçon{lessons.length === 1 ? '' : 's'} trouvée
              {lessons.length === 1 ? '' : 's'}
            </h1>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="min-h-10 rounded-xl px-3 text-sm font-semibold text-blue-600 hover:bg-blue-50"
          >
            Réinitialiser
          </button>
        </div>
        {lessons.length ? (
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <SearchLessonRow key={lesson.id} lesson={lesson} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-bold">Aucune leçon ne correspond</h2>
            <p className="mt-2 text-sm text-slate-500">
              Essayez une recherche plus courte ou retirez un filtre.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 min-h-10 rounded-xl bg-[#0b1c2d] px-4 text-sm font-bold text-white"
            >
              Afficher toute la bibliothèque
            </button>
          </div>
        )}
      </section>
      {showFilters && (
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <h2 className="font-bold">Affiner les résultats</h2>
          </div>
          <label className="mt-6 block text-sm font-bold" htmlFor="library-level">
            Niveau
          </label>
          <select
            id="library-level"
            value={level}
            onChange={(event) => setLevel(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
          >
            {levels.map(([value, labelValue]) => (
              <option key={value} value={value}>
                {labelValue}
              </option>
            ))}
          </select>
          <label className="mt-6 flex min-h-11 cursor-pointer items-center justify-between rounded-xl border border-slate-200 px-3 text-sm font-semibold">
            <span className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoris uniquement
            </span>
            <input
              type="checkbox"
              checked={onlyFavorites}
              onChange={(event) => setOnlyFavorites(event.target.checked)}
              className="h-4 w-4 accent-[#0b1c2d]"
            />
          </label>
        </aside>
      )}
    </div>
  );
}

function SearchLessonRow({ lesson }: { lesson: ProductLesson }) {
  const playlist = useProductStore((state) => state.playlist);
  const togglePlaylist = useProductStore((state) => state.togglePlaylist);
  const inPlaylist = playlist.includes(lesson.id);
  return (
    <article className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:grid-cols-[152px_1fr_auto]">
      <div className="relative min-h-36 sm:min-h-0">
        <Image src={lesson.image} alt="" fill sizes="152px" className="object-cover" />
      </div>
      <div className="min-w-0 p-4">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
          {lesson.collection}
        </p>
        <h2 className="mt-1 truncate text-lg font-bold">{lesson.title}</h2>
        <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
          <span>{lesson.wordCount} mots</span>
          <span>{lesson.levelLabel}</span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-4 w-4" />
            {lesson.duration}
          </span>
        </p>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 p-4 sm:border-l sm:border-t-0">
        <button
          type="button"
          onClick={() => togglePlaylist(lesson.id)}
          className="min-h-10 rounded-xl border border-slate-300 px-3 text-sm font-semibold hover:bg-slate-50"
        >
          {inPlaylist ? 'Retirer' : 'Playlist +'}
        </button>
        <Link
          href={`/lesson/${lesson.id}`}
          className="inline-flex min-h-10 items-center rounded-xl bg-[#0b1c2d] px-4 text-sm font-bold text-white hover:bg-slate-800"
        >
          Ouvrir
        </Link>
      </div>
    </article>
  );
}

function EmptyImports() {
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <span className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-[#0b1c2d] text-white">
        <FilePlus2 className="h-8 w-8" />
      </span>
      <h1 className="mt-5 text-xl font-bold">Votre espace d’import est vide</h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Transformez un texte que vous aimez en leçon interactive, puis retrouvez-le ici.
      </p>
      <Link
        href="/import"
        className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
      >
        Importer une leçon
      </Link>
    </div>
  );
}
