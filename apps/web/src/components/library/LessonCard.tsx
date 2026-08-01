'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookmarkPlus, Check, Clock3, Heart, ListPlus } from 'lucide-react';
import { computeLessonStats, lessonView, type Lesson } from '@yapro/core';
import { useProductStore } from '@/lib/product-store';

export function LessonCard({ lesson, priority = false }: { lesson: Lesson; priority?: boolean }) {
  const favorites = useProductStore((state) => state.favorites);
  const playlist = useProductStore((state) => state.playlist);
  const progress = useProductStore((state) => state.readingProgress[lesson.id] || 0);
  const toggleFavorite = useProductStore((state) => state.toggleFavorite);
  const togglePlaylist = useProductStore((state) => state.togglePlaylist);
  const statusIndex = useProductStore((state) => state.statusIndex);
  // statusVersion is the render trigger: statusIndex mutates in place.
  useProductStore((state) => state.statusVersion);

  const isFavorite = favorites.includes(lesson.id);
  const isQueued = playlist.includes(lesson.id);
  const view = lessonView(lesson);

  // Percentages reflect this learner's vocabulary, not a static field.
  const stats = computeLessonStats(lesson.content, lesson.languageCode, (lemma) =>
    statusIndex.get(lemma)
  );

  const progressPercent = Math.min(
    100,
    Math.round((progress / Math.max(1, lesson.wordCount)) * 100)
  );

  return (
    <article className="group relative w-[278px] shrink-0 overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_2px_4px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,.12)]">
      <Link
        href={`/lesson/${lesson.id}`}
        className="block focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
      >
        <div className="relative h-[154px] overflow-hidden bg-slate-200">
          <Image
            src={view.image}
            alt=""
            fill
            sizes="278px"
            priority={priority}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
          />
          <span className="absolute left-3 top-3 rounded-full border-2 border-white bg-[#0b1c2d]/85 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
            YAPRO
          </span>
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-black/50 px-3 py-2 text-xs font-semibold text-white backdrop-blur-sm">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-5 rounded-full bg-blue-500" />
              {lesson.wordCount}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5" />
              {view.duration}
            </span>
          </div>
          {progressPercent > 0 && (
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/40">
              <span
                className="block h-full bg-emerald-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          )}
        </div>
        <div className="min-h-[126px] px-4 pb-3 pt-4">
          <h3 className="line-clamp-2 min-h-11 text-[15px] font-bold leading-5 text-[#0b1c2d]">
            {lesson.title}
          </h3>
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-slate-600">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            {stats.newPercent}% nouveaux mots
          </p>
          <p className="mt-2 truncate text-[13px] text-slate-400">{view.collection}</p>
        </div>
      </Link>
      <div className="absolute right-2.5 top-2.5 flex gap-1.5">
        <button
          type="button"
          onClick={() => togglePlaylist(lesson.id)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#0b1c2d] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          aria-label={
            isQueued
              ? `Retirer ${lesson.title} de la playlist`
              : `Ajouter ${lesson.title} à la playlist`
          }
          title={isQueued ? 'Retirer de la playlist' : 'Ajouter à la playlist'}
        >
          {isQueued ? (
            <Check className="h-4 w-4 text-emerald-700" />
          ) : (
            <ListPlus className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(lesson.id)}
          className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-[#0b1c2d] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30"
          aria-label={
            isFavorite
              ? `Retirer ${lesson.title} des favoris`
              : `Ajouter ${lesson.title} aux favoris`
          }
          title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {isFavorite ? (
            <Heart className="h-4 w-4 fill-rose-500 text-rose-500" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
        </button>
      </div>
    </article>
  );
}
