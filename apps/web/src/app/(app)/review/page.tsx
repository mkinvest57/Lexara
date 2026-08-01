'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronRight,
  EyeOff,
  RotateCcw,
  Volume2,
  X,
} from 'lucide-react';
import {
  buildCloze,
  buildMultipleChoice,
  activityForIndex,
  isDue,
  isSavedStatus,
  paintFor,
  STATUS_LABELS,
  type WordStatus,
} from '@yapro/core';
import { useProductStore, type SavedWord } from '@/lib/product-store';
import { speakEnglishWeb } from '@/lib/speech';

type Phase = 'question' | 'reveal' | 'correct' | 'wrong';

export default function ReviewPage() {
  const words = useProductStore((s) => s.words);
  const preferences = useProductStore((s) => s.preferences);
  const reviewWord = useProductStore((s) => s.reviewWord);

  const dueWords = useMemo(() => {
    const now = new Date();
    return words
      .filter((w) => isSavedStatus(w.status) && isDue(w.nextReviewAt, now))
      .slice(0, preferences.dailyReviewSize);
  }, [preferences.dailyReviewSize, words]);

  const pool = useMemo(
    (): import('@yapro/core').ReviewCandidate[] =>
      words.map((w) => ({
        id: w.id,
        term: w.term,
        translation: w.translation,
        context: w.context ?? '',
        languageCode: w.languageCode,
      })),
    [words]
  );

  const [queue] = useState<SavedWord[]>(dueWords);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('question');
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [clozeInput, setClozeInput] = useState('');
  const [mcqChoice, setMcqChoice] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const current = queue[index];
  const activity = activityForIndex(
    { enabled: ['flashcard', 'reverse_flashcard', 'cloze', 'dictation', 'multiple_choice'], multipleChoiceOptions: 4, dailyLimit: 200, autoPlayTts: true, flashcardFront: ['term'], flashcardBack: ['translation'] },
    index
  );

  const candidate = useMemo(
    () =>
      current
        ? { id: current.id, term: current.term, translation: current.translation, context: current.context ?? '', languageCode: current.languageCode }
        : null,
    [current]
  );

  const cloze = useMemo(
    () => (candidate && activity === 'cloze' ? buildCloze(candidate) : null),
    [candidate, activity]
  );

  const mcq = useMemo(
    () =>
      candidate && activity === 'multiple_choice'
        ? buildMultipleChoice(candidate, pool, 4)
        : null,
    [candidate, pool, activity]
  );

  // Effective activity — fall back to flashcard if cloze context is missing
  const effective: 'flashcard' | 'reverse_flashcard' | 'cloze' | 'dictation' | 'multiple_choice' =
    activity === 'cloze'
      ? cloze
        ? 'cloze'
        : 'flashcard'
      : (activity as 'flashcard' | 'reverse_flashcard' | 'cloze' | 'dictation' | 'multiple_choice');

  const advance = useCallback(
    (correct: boolean) => {
      if (!current) return;
      reviewWord(current.id, correct ? 'good' : 'again');
      if (correct) setScore((s) => s + 1);
      setPhase(correct ? 'correct' : 'wrong');
      setTimeout(() => {
        if (index + 1 >= queue.length) {
          setFinished(true);
        } else {
          setIndex((i) => i + 1);
          setPhase('question');
          setClozeInput('');
          setMcqChoice(null);
        }
      }, 900);
    },
    [current, index, queue.length, reviewWord]
  );

  useEffect(() => {
    if ((effective === 'cloze' || effective === 'dictation') && phase === 'question') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
    if (effective === 'dictation' && phase === 'question' && current) {
      void speakEnglishWeb(current.term, { rate: Math.min(0.86, preferences.speechRate) });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effective, phase, index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (phase !== 'question' || !current) return;
      if (e.key === ' ') {
        e.preventDefault();
        void speakEnglishWeb(current.term, { rate: Math.min(0.86, preferences.speechRate) });
      }
      if (effective === 'multiple_choice' && e.key >= '1' && e.key <= '4') {
        const opt = mcq?.options[Number(e.key) - 1];
        if (opt) { setMcqChoice(opt); advance(opt === current.translation); }
      }
      if (effective === 'flashcard' && e.key === 'Enter') setPhase('reveal');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, current, effective, mcq, advance, preferences.speechRate]);

  const progress = queue.length
    ? Math.round(((index + (finished ? 1 : 0)) / queue.length) * 100)
    : 100;

  const statusPaint = current ? paintFor(current.status as WordStatus) : null;

  if (finished || !current) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center bg-white px-6">
        <div className="w-full max-w-md text-center">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
            <Check className="h-10 w-10" />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Session terminée</p>
          <h1 className="mt-2 text-3xl font-bold">
            {score} bonne{score === 1 ? '' : 's'} réponse{score === 1 ? '' : 's'} sur {queue.length}
          </h1>
          <p className="mt-3 text-slate-500">Les prochaines dates de révision ont été ajustées.</p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <button
              type="button"
              onClick={() => { setFinished(false); setIndex(0); setPhase('question'); setScore(0); setClozeInput(''); setMcqChoice(null); }}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-bold hover:bg-slate-50"
            >
              <RotateCcw className="h-4 w-4" /> Recommencer
            </button>
            <Link href="/vocab" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white">
              Retour au vocabulaire
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] flex-col bg-white">
      {/* Header */}
      <header className="flex shrink-0 items-center gap-4 border-b border-slate-100 px-5 py-4 sm:px-7">
        <Link href="/vocab" className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100" aria-label="Quitter la révision">
          <X className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <span className="block h-full rounded-full bg-emerald-400 transition-[width]" style={{ width: `${Math.max(4, progress)}%` }} />
          </div>
        </div>
        <span className="text-sm font-semibold text-slate-500">{index + 1}/{queue.length}</span>
      </header>

      {/* Card area */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 pb-4 pt-8">
        <div className="w-full max-w-lg">
          {/* Status badge */}
          <div className="mb-5 flex items-center gap-2">
            <span
              className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold"
              style={statusPaint?.background ? { backgroundColor: statusPaint.background, color: statusPaint.text } : { backgroundColor: '#e2e8f0', color: '#475569' }}
            >
              {STATUS_LABELS[current.status as WordStatus]}
            </span>
            <span className="text-xs text-slate-400">
              {effective === 'flashcard' ? 'Carte mémoire' : effective === 'reverse_flashcard' ? 'Carte inverse' : effective === 'cloze' ? 'Lacune' : effective === 'dictation' ? 'Dictée' : 'Choix multiple'}
            </span>
          </div>

          {/* Flashcard */}
          {effective === 'flashcard' && (
            <div
              className={`cursor-pointer rounded-3xl border-2 p-10 text-center transition-all ${phase === 'question' ? 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30' : phase === 'reveal' ? 'border-emerald-200 bg-emerald-50/50' : ''}`}
              onClick={() => phase === 'question' && setPhase('reveal')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && phase === 'question' && setPhase('reveal')}
            >
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); void speakEnglishWeb(current.term, { rate: Math.min(0.86, preferences.speechRate) }); }}
                className="mx-auto flex items-center gap-3 rounded-xl px-4 py-2 text-4xl font-bold tracking-tight hover:bg-white/60"
              >
                <Volume2 className="h-6 w-6 shrink-0 text-slate-400" />
                {current.term}
              </button>
              {phase === 'question' ? (
                <p className="mt-6 text-sm text-slate-400">Appuyez pour révéler la traduction</p>
              ) : (
                <div className="mt-6">
                  <p className="text-2xl font-semibold text-emerald-700">{current.translation}</p>
                  {current.context && (
                    <p className="mt-3 text-sm italic text-slate-500">&ldquo;{current.context}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Cloze */}
          {effective === 'cloze' && cloze && (
            <div className="space-y-5">
              <p className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-5 text-xl leading-8">
                {cloze.prompt.split('____').map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className={`inline-block min-w-[80px] border-b-2 px-1 font-bold ${phase !== 'question' ? (phase === 'correct' ? 'border-emerald-500 text-emerald-700' : 'border-red-400 text-red-600') : 'border-blue-400 text-blue-700'}`}>
                        {phase !== 'question' ? cloze.answer : clozeInput || '          '}
                      </span>
                    )}
                  </span>
                ))}
              </p>
              {phase === 'question' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const ok = clozeInput.trim().toLocaleLowerCase() === cloze.answer.toLocaleLowerCase();
                  advance(ok);
                }}>
                  <input
                    ref={inputRef}
                    value={clozeInput}
                    onChange={(e) => setClozeInput(e.target.value)}
                    placeholder={`Tapez le mot manquant…`}
                    className="h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                    autoComplete="off"
                    disabled={phase !== 'question'}
                  />
                </form>
              )}
            </div>
          )}

          {/* Reverse flashcard — show translation, guess term */}
          {effective === 'reverse_flashcard' && (
            <div
              className={`cursor-pointer rounded-3xl border-2 p-10 text-center transition-all ${phase === 'question' ? 'border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/30' : phase === 'reveal' ? 'border-emerald-200 bg-emerald-50/50' : ''}`}
              onClick={() => phase === 'question' && setPhase('reveal')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && phase === 'question' && setPhase('reveal')}
            >
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-400">Traduction</p>
              <p className="mt-3 text-3xl font-bold text-slate-700">{current.translation}</p>
              {phase === 'question' ? (
                <p className="mt-6 text-sm text-slate-400">Appuyez pour révéler le terme</p>
              ) : (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); void speakEnglishWeb(current.term, { rate: Math.min(0.86, preferences.speechRate) }); }}
                    className="mx-auto flex items-center gap-3 rounded-xl px-4 py-2 text-4xl font-bold tracking-tight hover:bg-white/60"
                  >
                    <Volume2 className="h-6 w-6 shrink-0 text-slate-400" />
                    {current.term}
                  </button>
                  {current.context && (
                    <p className="mt-3 text-sm italic text-slate-500">&ldquo;{current.context}&rdquo;</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Dictation — TTS plays, user types the word */}
          {effective === 'dictation' && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-4 rounded-3xl border-2 border-slate-200 bg-slate-50 p-10">
                <button
                  type="button"
                  onClick={() => void speakEnglishWeb(current.term, { rate: Math.min(0.86, preferences.speechRate) })}
                  className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0b1c2d] text-white shadow-lg hover:bg-slate-800 active:scale-95 transition-transform"
                  aria-label="Écouter le mot"
                >
                  <Volume2 className="h-9 w-9" />
                </button>
                <p className="text-sm text-slate-500">Écoutez et tapez le mot</p>
              </div>
              {phase === 'question' ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const ok = clozeInput.trim().toLocaleLowerCase() === current.term.toLocaleLowerCase();
                  advance(ok);
                }}>
                  <input
                    ref={inputRef}
                    value={clozeInput}
                    onChange={(e) => setClozeInput(e.target.value)}
                    placeholder="Tapez ce que vous entendez…"
                    className="h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                    autoComplete="off"
                  />
                </form>
              ) : (
                <p className={`text-center text-xl font-bold ${phase === 'correct' ? 'text-emerald-700' : 'text-red-600'}`}>
                  {current.term}
                </p>
              )}
            </div>
          )}

          {/* MCQ */}
          {effective === 'multiple_choice' && mcq && (
            <div className="space-y-3">
              <p className="mb-6 text-center text-2xl font-bold">{mcq.prompt}</p>
              {mcq.options.map((option, i) => {
                const selected = mcqChoice === option;
                const correct = mcqChoice !== null && option === current.translation;
                const wrong = selected && option !== current.translation;
                return (
                  <button
                    key={`${option}-${i}`}
                    type="button"
                    disabled={mcqChoice !== null}
                    onClick={() => { setMcqChoice(option); advance(option === current.translation); }}
                    className={`flex min-h-[58px] w-full items-center justify-between rounded-xl border px-4 text-left text-[15px] font-medium transition ${correct ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : wrong ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}
                  >
                    <span>{option}</span>
                    <kbd className="grid h-7 w-7 place-items-center rounded-md border border-slate-300 bg-slate-50 text-xs font-bold text-slate-500">{i + 1}</kbd>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={`flex shrink-0 items-center justify-between border-t px-5 py-4 transition-colors sm:px-7 ${phase === 'correct' ? 'border-emerald-200 bg-emerald-50' : phase === 'wrong' ? 'border-red-200 bg-red-50' : 'border-slate-100 bg-white'}`}>
        <button
          type="button"
          onClick={() => {
            reviewWord(current.id, 'again');
            if (index + 1 >= queue.length) setFinished(true);
            else { setIndex((i) => i + 1); setPhase('question'); setClozeInput(''); setMcqChoice(null); }
          }}
          disabled={phase !== 'question'}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
        >
          <EyeOff className="h-4 w-4" /> Passer
        </button>

        {phase === 'question' && (effective === 'flashcard' || effective === 'reverse_flashcard') && (
          <button
            type="button"
            onClick={() => setPhase('reveal')}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b1c2d] px-6 text-sm font-bold text-white hover:bg-slate-800"
          >
            Révéler <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {phase === 'reveal' && (
          <div className="flex gap-3">
            <button type="button" onClick={() => advance(false)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-red-300 bg-white px-5 text-sm font-bold text-red-600 hover:bg-red-50">
              <X className="h-4 w-4" /> Difficile
            </button>
            <button type="button" onClick={() => advance(true)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700">
              <Check className="h-4 w-4" /> Correct
            </button>
          </div>
        )}
        {phase === 'question' && effective === 'cloze' && (
          <button
            type="button"
            onClick={() => {
              const ok = clozeInput.trim().toLocaleLowerCase() === (cloze?.answer ?? '').toLocaleLowerCase();
              advance(ok);
            }}
            disabled={!clozeInput.trim()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b1c2d] px-6 text-sm font-bold text-white disabled:opacity-40"
          >
            Vérifier <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {phase === 'question' && effective === 'dictation' && (
          <button
            type="button"
            onClick={() => {
              const ok = clozeInput.trim().toLocaleLowerCase() === current.term.toLocaleLowerCase();
              advance(ok);
            }}
            disabled={!clozeInput.trim()}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b1c2d] px-6 text-sm font-bold text-white disabled:opacity-40"
          >
            Vérifier <ChevronRight className="h-4 w-4" />
          </button>
        )}
        {(phase === 'correct' || phase === 'wrong') && (
          <p className={`text-sm font-bold ${phase === 'correct' ? 'text-emerald-700' : 'text-red-600'}`}>
            {phase === 'correct' ? '✓ Correct !' : `✗ Réponse : ${current.translation}`}
          </p>
        )}
      </footer>
    </div>
  );
}
