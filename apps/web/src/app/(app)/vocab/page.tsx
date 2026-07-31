'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Check, Download, ExternalLink, Search, SlidersHorizontal, Trash2 } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useProductStore, type LearningStatus, type SavedWord } from '@/lib/product-store';

type VocabTab = 'all' | 'phrases' | 'due';

const statusLabels: Record<LearningStatus, string> = {
  1: 'Nouveau',
  2: 'En apprentissage',
  3: 'En progression',
  4: 'Presque connu',
  5: 'Connu',
};

export default function VocabPage() {
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const words = useProductStore((state) => state.words);
  const setWordStatus = useProductStore((state) => state.setWordStatus);
  const removeWord = useProductStore((state) => state.removeWord);
  const [tab, setTab] = useState<VocabTab>('all');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | LearningStatus>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const visibleWords = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const now = Date.now();
    return words.filter((word) => {
      if (
        query &&
        !`${word.term} ${word.translation} ${word.context}`.toLocaleLowerCase().includes(query)
      )
        return false;
      if (statusFilter !== 'all' && word.status !== statusFilter) return false;
      if (tab === 'phrases' && !word.term.includes(' ')) return false;
      if (tab === 'due' && new Date(word.nextReview).getTime() > now) return false;
      return true;
    });
  }, [search, statusFilter, tab, words]);

  const updateStatus = (word: SavedWord, status: LearningStatus) => {
    setWordStatus(word.id, status);
    if (token && word.remoteId) {
      void apiClient
        .updateVocabStatus(token, word.remoteId, Math.min(status, 4))
        .catch(() => undefined);
    }
  };

  const toggleSelected = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (visibleWords.length && visibleWords.every((word) => selected.has(word.id)))
      setSelected(new Set());
    else setSelected(new Set(visibleWords.map((word) => word.id)));
  };

  const deleteSelected = () => {
    if (
      !window.confirm(
        `Supprimer ${selected.size} terme${selected.size > 1 ? 's' : ''} du vocabulaire ?`
      )
    )
      return;
    selected.forEach(removeWord);
    setSelected(new Set());
  };

  const exportVocabulary = () => {
    const escapeCell = (value: string) => `"${value.replaceAll('"', '""')}"`;
    const rows = [
      ['Terme', 'Sens', 'Contexte', 'Statut'],
      ...visibleWords.map((word) => [
        word.term,
        word.translation,
        word.context,
        statusLabels[word.status],
      ]),
    ];
    const csv = rows.map((row) => row.map(escapeCell).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'immerli-vocabulaire.csv';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f1f3f4] px-4 py-5 sm:px-6 lg:px-8">
      <h1 className="sr-only">Vocabulaire</h1>
      <div className="mx-auto max-w-[1720px]">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-sm ring-1 ring-slate-200">
            <Link
              href="/library"
              className="min-h-10 rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Bibliothèque
            </Link>
            <span className="min-h-10 rounded-lg bg-slate-200 px-4 py-2 text-sm font-bold text-[#0b1c2d]">
              Vocabulaire
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={exportVocabulary}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-50"
            >
              <Download className="h-4 w-4" />
              Exporter
            </button>
            <Link
              href="/review"
              className="inline-flex min-h-11 items-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white hover:bg-slate-800"
            >
              Réviser
            </Link>
          </div>
        </header>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 px-4 pt-3 sm:flex-row sm:items-end sm:px-5">
            <div className="flex overflow-x-auto" role="tablist" aria-label="Vues du vocabulaire">
              {(
                [
                  ['all', 'Tous'],
                  ['phrases', 'Phrases'],
                  ['due', 'Prêt à réviser (SRS)'],
                ] as [VocabTab, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => setTab(value)}
                  className={`min-h-12 whitespace-nowrap border-b-2 px-5 text-sm font-semibold ${tab === value ? 'border-[#0b1c2d] text-[#0b1c2d]' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pb-3">
              <label className="relative block">
                <span className="sr-only">Chercher un mot</span>
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Chercher…"
                  name="vocabulary-search"
                  autoComplete="off"
                  className="h-10 w-44 rounded-xl border border-slate-300 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                />
              </label>
              <label className="relative">
                <span className="sr-only">Filtrer par statut</span>
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value === 'all'
                        ? 'all'
                        : (Number(event.target.value) as LearningStatus)
                    )
                  }
                  className="h-10 appearance-none rounded-xl border border-slate-300 bg-white pl-9 pr-8 text-sm font-semibold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                >
                  <option value="all">Tous les statuts</option>
                  {([1, 2, 3, 4, 5] as LearningStatus[]).map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {selected.size > 0 && (
            <div className="flex min-h-12 items-center justify-between bg-blue-50 px-5 text-sm">
              <span className="font-semibold text-blue-900">
                {selected.size} terme{selected.size > 1 ? 's' : ''} sélectionné
                {selected.size > 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={deleteSelected}
                className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Supprimer
              </button>
            </div>
          )}

          <div className="overflow-x-auto">
            <div className="min-w-[980px]">
              <div className="grid grid-cols-[36px_1.1fr_1fr_1.1fr_340px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-[0.08em] text-slate-500">
                <input
                  type="checkbox"
                  checked={Boolean(
                    visibleWords.length && visibleWords.every((word) => selected.has(word.id))
                  )}
                  onChange={toggleAll}
                  className="h-4 w-4 accent-[#0b1c2d]"
                  aria-label="Sélectionner tous les termes visibles"
                />
                <span>Terme</span>
                <span>Sens</span>
                <span>Texte source</span>
                <span>Statut</span>
              </div>
              {visibleWords.map((word) => (
                <article
                  key={word.id}
                  className="mx-4 my-1.5 grid min-h-[88px] grid-cols-[36px_1.1fr_1fr_1.1fr_340px] items-center gap-4 rounded-xl border border-slate-200 px-3 py-3 [content-visibility:auto] transition-colors hover:border-slate-300 hover:bg-slate-50/60"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(word.id)}
                    onChange={() => toggleSelected(word.id)}
                    className="h-4 w-4 accent-[#0b1c2d]"
                    aria-label={`Sélectionner ${word.term}`}
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400">{word.pronunciation}</p>
                    <h2 className="mt-1 truncate text-base font-bold">{word.term}</h2>
                  </div>
                  <p className="truncate text-sm">
                    <span aria-hidden="true">🇫🇷 </span>
                    {word.translation}
                  </p>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm italic text-slate-500">“{word.context}”</p>
                    <Link
                      href={`/lesson/${word.lessonId}`}
                      className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      {word.lessonTitle}
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Supprimer « ${word.term} » du vocabulaire ?`))
                          removeWord(word.id);
                      }}
                      className="grid h-10 w-10 place-items-center rounded-full border border-slate-300 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      aria-label={`Supprimer ${word.term}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {([1, 2, 3, 4, 5] as LearningStatus[]).map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => updateStatus(word, status)}
                        className={`grid h-10 w-10 place-items-center rounded-full border text-sm font-bold transition ${word.status === status ? (status === 1 ? 'border-amber-400 bg-amber-200' : status === 5 ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-blue-400 bg-blue-50 text-blue-700') : 'border-slate-300 text-slate-500 hover:border-blue-400'}`}
                        aria-label={`Marquer ${word.term} comme ${statusLabels[status]}`}
                        title={statusLabels[status]}
                      >
                        {status === 5 ? <Check className="h-4 w-4" /> : status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>

          {!visibleWords.length && (
            <div className="px-6 py-20 text-center">
              <h2 className="text-lg font-bold">Aucun terme dans cette vue</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sélectionnez un autre filtre ou sauvegardez un mot depuis le lecteur.
              </p>
              <Link
                href="/library"
                className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-[#0b1c2d] px-4 text-sm font-bold text-white"
              >
                Ouvrir une leçon
              </Link>
            </div>
          )}

          <div className="m-4 rounded-xl bg-slate-100 px-5 py-4 text-sm text-slate-600">
            <strong className="text-slate-800">Astuce :</strong> utilisez les boutons 1 à 4 pour
            suivre votre confiance, puis ✓ quand le mot est connu.
          </div>
        </div>
      </div>
    </div>
  );
}
