'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookOpenText,
  Check,
  ChevronRight,
  CircleEllipsis,
  ListPlus,
  Pause,
  Play,
  Type,
  Volume2,
} from 'lucide-react';
import { coverImage, lessonView } from '@yapro/core';
import { TranslationPanel } from '@/components/reader/TranslationPanel';
import { speakEnglishWeb, stopWebSpeech } from '@/lib/speech';
import {
  normalizeWord,
  translations,
  useProductStore,
  type LearningStatus,
} from '@/lib/product-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ReaderToken {
  id: string;
  raw: string;
  normalized: string;
  punctuation: boolean;
  sentence: string;
}

export default function LessonPage() {
  const params = useParams<{ id: string }>();
  const lesson = useProductStore((state) => state.lessons.find((item) => item.id === params.id));
  const words = useProductStore((state) => state.words);
  const playlist = useProductStore((state) => state.playlist);
  const preferences = useProductStore((state) => state.preferences);
  const saveWord = useProductStore((state) => state.saveWord);
  const removeWord = useProductStore((state) => state.removeWord);
  const togglePlaylist = useProductStore((state) => state.togglePlaylist);
  const recordReading = useProductStore((state) => state.recordReading);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [exploredIds, setExploredIds] = useState<Set<string>>(new Set());
  const [showMeaning, setShowMeaning] = useState(false);
  const [fontTools, setFontTools] = useState(false);
  const [fontSize, setFontSize] = useState(preferences.fontSize);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [remoteLessonError, setRemoteLessonError] = useState('');
  const readingRef = useRef<HTMLDivElement>(null);
  const initializedLesson = useRef<string | null>(null);
  const autoPlayedLesson = useRef<string | null>(null);

  const view = useMemo(
    () => (lesson ? lessonView(lesson) : null),
    [lesson]
  );

  const readerTokens = useMemo(() => {
    if (!lesson) return [];
    const sentenceMatches = lesson.content.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [lesson.content];
    return sentenceMatches.flatMap((sentence, sentenceIndex) =>
      (sentence.trim().match(/[\p{L}\p{N}'’-]+|[^\s\p{L}\p{N}'’-]+/gu) || []).map(
        (raw, tokenIndex) => {
          const normalized = normalizeWord(raw);
          return {
            id: `${sentenceIndex}-${tokenIndex}-${normalized || 'punctuation'}`,
            raw,
            normalized,
            punctuation: !normalized,
            sentence: sentence.trim(),
          } satisfies ReaderToken;
        }
      )
    );
  }, [lesson]);

  useEffect(() => {
    if (lesson && initializedLesson.current !== lesson.id && readerTokens.length) {
      const initial =
        readerTokens.find((item) => item.normalized === 'morning') ||
        readerTokens.find((item) => !item.punctuation);
      setSelectedTokenId(initial?.id || null);
      initializedLesson.current = lesson.id;
    }
  }, [lesson, readerTokens]);

  useEffect(() => {
    return () => {
      stopWebSpeech();
    };
  }, []);

  useEffect(() => {
    if (
      !lesson ||
      !preferences.autoPlayAudio ||
      autoPlayedLesson.current === lesson.id
    )
      return;
    autoPlayedLesson.current = lesson.id;
    void speakEnglishWeb(lesson.content, {
      rate: preferences.speechRate,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  }, [lesson, preferences.autoPlayAudio, preferences.speechRate]);

  // The store loads full lesson content from Supabase up front, so an empty
  // body here means the row itself is incomplete rather than not yet fetched.
  useEffect(() => {
    if (!lesson || lesson.content) return;
    setRemoteLessonError(
      'Cette leçon ne contient pas de texte. Revenez à la bibliothèque et réessayez quand le service est disponible.'
    );
  }, [lesson]);

  const selectedToken = readerTokens.find((item) => item.id === selectedTokenId);
  const savedByTerm = useMemo(
    () => new Map(words.map((word) => [normalizeWord(word.term), word])),
    [words]
  );
  const selectedSavedWord = selectedToken ? savedByTerm.get(selectedToken.normalized) : undefined;
  const lexicalTokenCount = readerTokens.filter((item) => !item.punctuation).length;
  const progress = lexicalTokenCount
    ? Math.min(100, Math.round((exploredIds.size / lexicalTokenCount) * 100))
    : 0;

  if (!lesson) {
    return (
      <div className="grid min-h-[calc(100vh-72px)] place-items-center bg-white px-6 text-center">
        <div>
          <BookOpenText className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-bold">Leçon introuvable</h1>
          <p className="mt-2 text-slate-500">Cette leçon n’est plus disponible sur cet appareil.</p>
          <Link
            href="/library"
            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white"
          >
            Retour à la bibliothèque
          </Link>
        </div>
      </div>
    );
  }

  if (!lesson.content) {
    return (
      <div className="grid min-h-[calc(100vh-72px)] place-items-center bg-white px-6 text-center">
        <div className="max-w-md">
          <BookOpenText className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-bold">Chargement de la leçon…</h1>
          <p className={`mt-2 ${remoteLessonError ? 'text-red-600' : 'text-slate-500'}`}>
            {remoteLessonError || 'Le texte complet est en cours de récupération.'}
          </p>
          {remoteLessonError && (
            <Link
              href="/library"
              className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white"
            >
              Retour à la bibliothèque
            </Link>
          )}
        </div>
      </div>
    );
  }

  const selectToken = (readerToken: ReaderToken) => {
    if (readerToken.punctuation) return;
    setSelectedTokenId(readerToken.id);
    setExploredIds((current) => new Set([...current, readerToken.id]));
  };

  const saveSelectedWord = async (meaning: string, status: LearningStatus) => {
    if (!selectedToken) return;
    saveWord({
      term: selectedToken.normalized,
      pronunciation: undefined,
      translation: meaning,
      context: selectedToken.sentence,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      status,
    });
  };

  const speak = () => {
    if (isPlaying) {
      stopWebSpeech();
      setIsPlaying(false);
      return;
    }
    void speakEnglishWeb(lesson.content, {
      rate: preferences.speechRate,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const finishLesson = () => {
    recordReading(lesson.id, Math.max(exploredIds.size, Math.round(lesson.wordCount * 0.8)));
    if (!playlist.includes(lesson.id)) togglePlaylist(lesson.id);
    setCompleted(true);
  };

  return (
    <div className="flex h-[calc(100vh-72px)] min-h-[620px] flex-col bg-white">
      <div className="flex h-[58px] shrink-0 items-center gap-3 border-b border-slate-200 px-4 sm:px-6">
        <Link
          href="/library"
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
          aria-label="Retour à la bibliothèque"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="h-1.5 max-w-[408px] overflow-hidden rounded-full bg-slate-200">
            <span
              className="block h-full rounded-full bg-emerald-500 transition-[width]"
              style={{ width: `${Math.max(4, progress)}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFontTools((value) => !value)}
          className={`grid h-10 w-10 place-items-center rounded-full ${fontTools ? 'bg-slate-200' : 'hover:bg-slate-100'}`}
          aria-label="Réglages du texte"
          aria-expanded={fontTools}
        >
          <Type className="h-4 w-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
              aria-label="Options de la leçon"
            >
              <CircleEllipsis className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
            <DropdownMenuItem
              className="min-h-10 rounded-lg"
              onClick={() => togglePlaylist(lesson.id)}
            >
              <ListPlus className="mr-2 h-4 w-4" />
              {playlist.includes(lesson.id) ? 'Retirer de la playlist' : 'Ajouter à la playlist'}
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-10 rounded-lg">
              <Link href="/vocab">
                <BookOpenText className="mr-2 h-4 w-4" />
                Ouvrir le vocabulaire
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {fontTools && (
        <div className="flex min-h-14 items-center justify-center gap-4 border-b border-slate-200 bg-slate-50 px-4">
          <span className="text-sm font-semibold">Taille du texte</span>
          <input
            type="range"
            min="16"
            max="30"
            step="1"
            value={fontSize}
            onChange={(event) => setFontSize(Number(event.target.value))}
            className="w-48 accent-[#0b1c2d]"
            aria-label="Taille du texte"
          />
          <span className="w-8 text-sm font-bold">{fontSize}</span>
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto" ref={readingRef}>
          <div className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10 lg:pt-14">
            <header className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image
                  src={coverImage(lesson)}
                  alt=""
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold">{lesson.title}</h1>
                <p className="mt-1 text-base text-slate-500">{view?.collection}</p>
              </div>
            </header>

            {completed ? (
              <div className="mt-14 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-2xl font-bold">Leçon terminée</h2>
                <p className="mt-2 text-slate-600">
                  Votre progression et les mots explorés sont enregistrés sur cet appareil.
                </p>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  <Link
                    href="/vocab"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 text-sm font-bold text-emerald-800"
                  >
                    Voir le vocabulaire
                  </Link>
                  <Link
                    href="/library"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white"
                  >
                    Choisir une autre leçon
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="mt-12 font-medium leading-[2.15] text-[#101923]"
                  style={{ fontSize }}
                >
                  {readerTokens.map((readerToken, index) => {
                    const saved = savedByTerm.get(readerToken.normalized);
                    const selected = selectedTokenId === readerToken.id;
                    const previous = readerTokens[index - 1];
                    const noSpace =
                      readerToken.punctuation || readerToken.raw === '’' || previous?.raw === '’';
                    const color = !saved
                      ? 'bg-[#cfe6ff] border-blue-400'
                      : saved.status === 1
                        ? 'bg-[#ffe188] border-amber-400'
                        : saved.status === 2
                          ? 'bg-[#fff0b8] border-amber-300'
                          : saved.status === 3
                            ? 'bg-[#e6f4bd] border-lime-400'
                            : saved.status === 4
                              ? 'bg-[#e9f4e7] border-emerald-300'
                              : 'border-transparent';
                    return (
                      <span key={readerToken.id}>
                        {!noSpace && index > 0 ? ' ' : ''}
                        {readerToken.punctuation ? (
                          <span>{readerToken.raw}</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => selectToken(readerToken)}
                            className={`relative inline rounded-[4px] border-b-2 px-0.5 py-0.5 text-inherit transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/25 ${color} ${selected ? 'ring-2 ring-[#0b1c2d]/70' : ''}`}
                            title={
                              saved?.translation ||
                              translations[readerToken.normalized] ||
                              'Sélectionner le mot'
                            }
                          >
                            {readerToken.raw}
                          </button>
                        )}
                      </span>
                    );
                  })}
                </div>
                {showMeaning && (
                  <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-base leading-7 text-slate-600">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                      Traduction de la leçon
                    </p>
                    <p className="mt-3">{lesson.translation}</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={finishLesson}
                  className="mt-12 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700"
                >
                  Terminer la leçon <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {selectedToken && (
          <div className="fixed inset-0 z-50 bg-white lg:static lg:z-auto lg:block">
            <TranslationPanel
              word={selectedToken.raw}
              sentence={selectedToken.sentence}
              sourceLanguage="en"
              savedWord={selectedSavedWord}
              onSave={saveSelectedWord}
              onRemove={
                selectedSavedWord
                  ? () => {
                      if (
                        window.confirm(`Supprimer « ${selectedSavedWord.term} » du vocabulaire ?`)
                      )
                        removeWord(selectedSavedWord.id);
                    }
                  : undefined
              }
              onClose={() => setSelectedTokenId(null)}
            />
          </div>
        )}
      </div>

      <footer className="flex h-[64px] shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 sm:px-8">
        <button
          type="button"
          onClick={speak}
          className="grid h-11 w-11 place-items-center rounded-full bg-[#0b1c2d] text-white hover:bg-slate-800"
          aria-label={isPlaying ? 'Arrêter la lecture audio' : 'Écouter la leçon'}
        >
          {isPlaying ? (
            <Pause className="h-5 w-5 fill-current" />
          ) : (
            <Play className="ml-0.5 h-5 w-5 fill-current" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setShowMeaning((value) => !value)}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-slate-100"
        >
          <BookOpenText className="h-4 w-4" />
          {showMeaning ? 'Masquer la traduction' : 'Vue phrase'}
        </button>
        <div className="hidden items-center gap-2 text-sm font-semibold text-slate-600 sm:flex">
          <Volume2 className="h-4 w-4" />
          {exploredIds.size} explorés · {words.length} sauvegardés
        </div>
      </footer>
    </div>
  );
}
