'use client';

import { useMemo } from 'react';
import { BookMarked, X } from 'lucide-react';
import { paintFor, STATUS_LABELS, type WordStatus } from '@yapro/core';
import { useProductStore, type SavedWord } from '@/lib/product-store';

interface VocabSidebarProps {
  lessonId: string;
  pageLemmas: Set<string>;
  onClose: () => void;
  onWordClick: (lemma: string) => void;
}

export function VocabSidebar({ lessonId, pageLemmas, onClose, onWordClick }: VocabSidebarProps) {
  const words = useProductStore((s) => s.words);

  const lessonWords = useMemo(
    () => words.filter((w) => w.lessonId === lessonId || pageLemmas.has(w.lemma ?? '')),
    [words, lessonId, pageLemmas]
  );

  const onPage = useMemo(
    () => lessonWords.filter((w) => pageLemmas.has(w.lemma ?? '')),
    [lessonWords, pageLemmas]
  );

  const elsewhere = useMemo(
    () =>
      lessonWords.filter(
        (w) => !pageLemmas.has(w.lemma ?? '') && w.lessonId === lessonId
      ),
    [lessonWords, lessonId, pageLemmas]
  );

  const renderWord = (word: SavedWord) => {
    const status = word.status as WordStatus;
    const paint = paintFor(status);
    return (
      <button
        key={word.id}
        type="button"
        onClick={() => onWordClick(word.lemma ?? word.term)}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-slate-50"
      >
        <span
          className="shrink-0 rounded px-1.5 py-0.5 text-sm font-medium"
          style={
            paint.background
              ? { backgroundColor: paint.background, color: paint.text }
              : undefined
          }
        >
          {word.term}
        </span>
        <span className="flex-1 truncate text-sm text-slate-500">{word.translation}</span>
        <span className="shrink-0 text-xs text-slate-400">{STATUS_LABELS[status]}</span>
      </button>
    );
  };

  return (
    <aside className="flex h-full w-full flex-col bg-white lg:w-[360px] lg:border-l lg:border-slate-300">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-base font-bold">Vocabulaire ({lessonWords.length})</h2>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
          aria-label="Fermer le vocabulaire"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-3">
        {onPage.length > 0 && (
          <section className="mb-4">
            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Page actuelle · {onPage.length}
            </p>
            {onPage.map(renderWord)}
          </section>
        )}

        {elsewhere.length > 0 && (
          <section>
            <p className="px-3 pb-1 text-xs font-bold uppercase tracking-wide text-slate-400">
              Leçon · {elsewhere.length}
            </p>
            {elsewhere.map(renderWord)}
          </section>
        )}

        {lessonWords.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-slate-400">
            <BookMarked className="h-8 w-8" />
            <p className="text-sm">Aucun mot sauvegardé dans cette leçon.</p>
          </div>
        )}
      </div>
    </aside>
  );
}
