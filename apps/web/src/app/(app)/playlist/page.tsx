'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpDown, ChevronDown, ChevronUp, ListMusic, Play, Shuffle, Trash2 } from 'lucide-react';
import { coverImage } from '@yapro/core';
import { useProductStore } from '@/lib/product-store';

export default function PlaylistPage() {
  const lessons = useProductStore((s) => s.lessons);
  const playlist = useProductStore((s) => s.playlist);
  const togglePlaylist = useProductStore((s) => s.togglePlaylist);
  const reorderPlaylist = useProductStore((s) => s.reorderPlaylist);
  const [shuffle, setShuffle] = useState(false);

  const playlistLessons = useMemo(() => {
    const ordered = playlist
      .map((id) => lessons.find((l) => l.id === id))
      .filter(Boolean) as typeof lessons;
    if (shuffle) return [...ordered].sort(() => Math.random() - 0.5);
    return ordered;
  }, [lessons, playlist, shuffle]);

  const move = (idx: number, dir: -1 | 1) => {
    const targetIdx = playlist.indexOf(playlistLessons[idx].id);
    const swapIdx = playlist.indexOf(playlistLessons[idx + dir].id);
    reorderPlaylist(targetIdx, swapIdx);
  };

  if (!playlist.length) {
    return (
      <div className="grid min-h-[calc(100vh-72px)] place-items-center bg-[#f1f3f4] px-6 text-center">
        <div>
          <ListMusic className="mx-auto h-12 w-12 text-slate-400" />
          <h1 className="mt-4 text-2xl font-bold">Playlist vide</h1>
          <p className="mt-2 text-slate-500">Ajoutez des leçons depuis la bibliothèque ou en les terminant.</p>
          <Link href="/library" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white">
            Bibliothèque
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f1f3f4] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ListMusic className="h-6 w-6 text-[#0b1c2d]" />
            <h1 className="text-xl font-bold">{playlist.length} leçon{playlist.length > 1 ? 's' : ''}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShuffle((v) => !v)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-xl border px-4 text-sm font-semibold transition-colors ${shuffle ? 'border-[#0b1c2d] bg-[#0b1c2d] text-white' : 'border-slate-300 bg-white hover:bg-slate-50'}`}
            >
              <Shuffle className="h-4 w-4" /> Aléatoire
            </button>
            <Link
              href={`/lesson/${playlistLessons[0]?.id}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700"
            >
              <Play className="h-4 w-4 fill-current ml-0.5" /> Tout lire
            </Link>
          </div>
        </header>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {playlistLessons.map((lesson, idx) => (
            <article
              key={lesson.id}
              className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50/60"
            >
              <span className="w-6 shrink-0 text-center text-sm font-bold text-slate-400">{idx + 1}</span>
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                <Image src={coverImage(lesson)} alt="" fill sizes="48px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <Link href={`/lesson/${lesson.id}`} className="block truncate text-sm font-semibold hover:underline">
                  {lesson.title}
                </Link>
                <p className="truncate text-xs text-slate-500">{lesson.wordCount} mots</p>
              </div>
              {!shuffle && (
                <div className="flex flex-col gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-20"
                    aria-label="Monter"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    disabled={idx === playlistLessons.length - 1}
                    className="grid h-6 w-6 place-items-center rounded text-slate-400 hover:bg-slate-100 disabled:opacity-20"
                    aria-label="Descendre"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                </div>
              )}
              <Link
                href={`/lesson/${lesson.id}`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0b1c2d] text-white hover:bg-slate-800"
                aria-label={`Lire ${lesson.title}`}
              >
                <Play className="ml-0.5 h-4 w-4 fill-current" />
              </Link>
              <button
                type="button"
                onClick={() => togglePlaylist(lesson.id)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                aria-label={`Retirer ${lesson.title} de la playlist`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ArrowUpDown className="h-3 w-3" />
          Glissez avec les flèches pour réordonner
        </div>
      </div>
    </div>
  );
}
