'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { FilePlus2, Search, X } from 'lucide-react';
import { lessonView, type Lesson, type LessonKind } from '@yapro/core';
import { LessonCard } from '@/components/library/LessonCard';
import { LessonShelf } from '@/components/library/LessonShelf';
import { useProductStore } from '@/lib/product-store';

export default function LibraryPage() {
  const lessons = useProductStore((s) => s.lessons);
  const playlist = useProductStore((s) => s.playlist);
  const readingProgress = useProductStore((s) => s.readingProgress);
  const [search, setSearch] = useState('');

  // Shelf data — each shelf filters the full lesson catalogue
  const inProgress = useMemo(
    () =>
      lessons
        .filter((l) => readingProgress[l.id] && readingProgress[l.id] > 0)
        .sort((a, b) => (readingProgress[b.id] ?? 0) - (readingProgress[a.id] ?? 0))
        .slice(0, 20),
    [lessons, readingProgress]
  );

  const queued = useMemo(
    () => lessons.filter((l) => playlist.includes(l.id)).slice(0, 20),
    [lessons, playlist]
  );

  const byKind = (kind: LessonKind) =>
    lessons.filter((l) => l.kind === kind && l.isPublished).slice(0, 20);

  const miniStories = useMemo(() => byKind('mini_story'), [lessons]);
  const articles = useMemo(() => byKind('article'), [lessons]);
  const stories = useMemo(() => byKind('story'), [lessons]);
  const imported = useMemo(
    () => lessons.filter((l) => lessonView(l).imported).slice(0, 20),
    [lessons]
  );

  const allPublished = useMemo(
    () => lessons.filter((l) => l.isPublished).sort(() => Math.random() - 0.5).slice(0, 20),
    [lessons]
  );

  // Search mode — flat grid across all lessons
  const searchResults = useMemo(() => {
    const q = search.trim().toLocaleLowerCase();
    if (!q) return [];
    return lessons.filter(
      (l) =>
        `${l.title} ${l.collection ?? ''} ${l.kind} ${l.description ?? ''}`
          .toLocaleLowerCase()
          .includes(q)
    );
  }, [lessons, search]);

  const searching = Boolean(search.trim());

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f1f3f4]">
      {/* Search bar */}
      <div className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-3 sm:px-8">
        <div className="mx-auto flex max-w-[1260px] items-center gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une leçon, une collection…"
              className="h-11 w-full rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2"
                aria-label="Effacer la recherche"
              >
                <X className="h-4 w-4 text-slate-400" />
              </button>
            )}
          </div>
          <Link
            href="/import"
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-[#0b1c2d] px-4 text-sm font-bold text-white hover:bg-slate-800"
          >
            <FilePlus2 className="h-4 w-4" />
            <span className="hidden sm:inline">Importer</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-[1260px] px-4 py-8 sm:px-8">
        {searching ? (
          /* Flat search results */
          <section>
            <h2 className="mb-4 text-lg font-bold">
              {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''} pour «&nbsp;{search}&nbsp;»
            </h2>
            {searchResults.length === 0 ? (
              <p className="py-16 text-center text-slate-500">Aucune leçon ne correspond.</p>
            ) : (
              <div className="flex flex-wrap gap-4">
                {searchResults.map((lesson, idx) => (
                  <LessonCard key={lesson.id} lesson={lesson} priority={idx < 4} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Shelf mode */
          <div className="space-y-10">
            {inProgress.length > 0 && (
              <LessonShelf
                title="Continuer à étudier"
                lessons={inProgress}
                priority
              />
            )}
            {queued.length > 0 && (
              <LessonShelf title="Ma liste" lessons={queued} />
            )}
            {miniStories.length > 0 && (
              <LessonShelf title="Mini-histoires" lessons={miniStories} />
            )}
            {stories.length > 0 && (
              <LessonShelf title="Histoires et récits" lessons={stories} />
            )}
            {articles.length > 0 && (
              <LessonShelf title="Articles" lessons={articles} />
            )}
            {imported.length > 0 && (
              <LessonShelf title="Mes imports" lessons={imported} viewAllHref="/import" />
            )}
            {lessons.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-24 text-center">
                <p className="text-xl font-bold text-slate-700">Votre bibliothèque est vide.</p>
                <p className="text-slate-500">
                  Importez votre premier texte pour commencer.
                </p>
                <Link
                  href="/import"
                  className="mt-2 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white"
                >
                  <FilePlus2 className="h-4 w-4" /> Importer un texte
                </Link>
              </div>
            ) : (
              allPublished.length > 0 && inProgress.length === 0 && (
                <LessonShelf
                  title="Explorer la bibliothèque"
                  lessons={allPublished}
                  priority={inProgress.length === 0}
                />
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
