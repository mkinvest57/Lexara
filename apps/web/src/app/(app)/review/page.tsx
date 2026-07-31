'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, CircleEllipsis, RotateCcw, Volume2, X } from 'lucide-react';
import { useProductStore, type SavedWord } from '@/lib/product-store';
import { speakEnglishWeb } from '@/lib/speech';

export default function ReviewPage() {
  const words = useProductStore((state) => state.words);
  const preferences = useProductStore((state) => state.preferences);
  const reviewWord = useProductStore((state) => state.reviewWord);
  const dueWords = useMemo(() => {
    const now = Date.now();
    const due = words.filter(
      (word) => word.status < 5 && new Date(word.nextReview).getTime() <= now
    );
    return due.slice(0, preferences.dailyReviewSize);
  }, [preferences.dailyReviewSize, words]);
  const [queue, setQueue] = useState<SavedWord[]>(dueWords);
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = queue[index];
  const options = useMemo(() => {
    if (!current) return [];
    const distractors = words
      .filter((word) => word.id !== current.id && word.translation !== current.translation)
      .map((word) => word.translation);
    const unique = [...new Set(distractors)].slice(0, 3);
    while (unique.length < 3) unique.push(['histoire', 'voyage', 'habitude'][unique.length]);
    const seededPosition = index % 4;
    unique.splice(seededPosition, 0, current.translation);
    return unique.slice(0, 4);
  }, [current, index, words]);

  const answer = (value: string) => {
    if (!current || choice) return;
    setChoice(value);
    const correct = value === current.translation;
    if (correct) setScore((valueScore) => valueScore + 1);
    reviewWord(current.id, correct);
    window.setTimeout(() => {
      if (index + 1 >= queue.length) setFinished(true);
      else {
        setIndex((valueIndex) => valueIndex + 1);
        setChoice(null);
      }
    }, 700);
  };

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key >= '1' && event.key <= '4' && !choice && options[Number(event.key) - 1])
        answer(options[Number(event.key) - 1]);
      if (event.key === ' ' && current) {
        event.preventDefault();
        void speakEnglishWeb(current.term, { rate: Math.min(0.86, preferences.speechRate) });
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const restart = () => {
    const nextQueue = dueWords;
    setQueue(nextQueue);
    setIndex(0);
    setChoice(null);
    setScore(0);
    setFinished(false);
  };

  const skipCurrent = () => {
    if (index + 1 >= queue.length) setFinished(true);
    else {
      setIndex((valueIndex) => valueIndex + 1);
      setChoice(null);
    }
  };

  const progress = queue.length
    ? Math.round(((index + (finished ? 1 : 0)) / queue.length) * 100)
    : 100;

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white px-4 py-6 sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-120px)] max-w-[1024px] flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <header className="flex items-center gap-4 px-5 py-5 sm:px-7">
          <Link
            href="/vocab"
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
            aria-label="Quitter la révision"
          >
            <X className="h-5 w-5" />
          </Link>
          <div className="flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <span
                className="block h-full rounded-full bg-emerald-500 transition-[width]"
                style={{ width: `${Math.max(queue.length ? 4 : 100, progress)}%` }}
              />
            </div>
            <span className="mt-2 inline-flex rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-bold text-white">
              {Math.min(index + 1, queue.length || 1)} / {queue.length || 0}
            </span>
          </div>
          <button
            type="button"
            onClick={restart}
            className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
            aria-label="Recommencer la session"
          >
            <CircleEllipsis className="h-5 w-5" />
          </button>
        </header>

        {finished || !current ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-10 w-10" />
            </span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
              Session terminée
            </p>
            <h1 className="mt-2 text-3xl font-bold">
              {score} bonne{score === 1 ? '' : 's'} réponse{score === 1 ? '' : 's'} sur{' '}
              {queue.length}
            </h1>
            <p className="mt-3 max-w-lg text-slate-500">
              Les prochaines dates de révision ont été ajustées selon vos réponses.
            </p>
            <div className="mt-7 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={restart}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-bold hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                Recommencer
              </button>
              <Link
                href="/vocab"
                className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white"
              >
                Retour au vocabulaire
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-1 flex-col px-6 pb-10 pt-4 sm:px-12 lg:px-40">
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <p className="text-xs font-semibold text-slate-400">{current.pronunciation}</p>
              <button
                type="button"
                onClick={() =>
                  void speakEnglishWeb(current.term, {
                    rate: Math.min(0.86, preferences.speechRate),
                  })
                }
                className="mt-4 flex items-center gap-5 rounded-2xl px-5 py-3 text-5xl font-bold tracking-tight hover:bg-slate-50"
                aria-label={`Écouter ${current.term}`}
              >
                <Volume2 className="h-7 w-7" />
                {current.term}
              </button>
            </div>
            <div className="mt-6">
              <h1 className="mb-3 text-base font-semibold">
                Sélectionnez la signification correcte
              </h1>
              <div className="space-y-3">
                {options.map((option, optionIndex) => {
                  const selected = choice === option;
                  const correct = choice && option === current.translation;
                  const wrong = selected && option !== current.translation;
                  return (
                    <button
                      key={`${option}-${optionIndex}`}
                      type="button"
                      disabled={Boolean(choice)}
                      onClick={() => answer(option)}
                      className={`flex min-h-[58px] w-full items-center justify-between rounded-xl border px-4 text-left text-[15px] font-medium shadow-[0_4px_14px_rgba(15,23,42,.05)] transition ${correct ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : wrong ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-300 bg-white hover:-translate-y-0.5 hover:border-blue-400 hover:shadow-md'}`}
                    >
                      <span>{option}</span>
                      <kbd className="grid h-7 w-7 place-items-center rounded-md border border-slate-400 bg-slate-50 text-xs font-bold text-slate-600">
                        {optionIndex + 1}
                      </kbd>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-auto pt-8">
              <button
                type="button"
                disabled={Boolean(choice)}
                onClick={skipCurrent}
                className="min-h-10 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-50"
              >
                Passer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
