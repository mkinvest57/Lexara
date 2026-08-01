'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  BookMarked,
  BookOpenText,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleEllipsis,
  ListPlus,
  Pause,
  Play,
  Type,
  Volume2,
} from 'lucide-react';
import {
  coverImage,
  splitSentences,
  paginate,
  tokenize,
  computeLessonStats,
  isRtl,
  type WordStatus,
  type RawToken,
} from '@yapro/core';
import { TranslationPanel } from '@/components/reader/TranslationPanel';
import { ReaderText } from '@/components/reader/ReaderText';
import { VocabSidebar } from '@/components/reader/VocabSidebar';
import { speakEnglishWeb, stopWebSpeech } from '@/lib/speech';
import { useProductStore, type LearningStatus, type SavedWord } from '@/lib/product-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function LessonPage() {
  const params = useParams<{ id: string }>();

  const lesson = useProductStore((s) => s.lessons.find((l) => l.id === params.id));
  const words = useProductStore((s) => s.words);
  const playlist = useProductStore((s) => s.playlist);
  const preferences = useProductStore((s) => s.preferences);
  const statusOf = useProductStore((s) => s.statusOf);
  const statusVersion = useProductStore((s) => s.statusVersion);
  const setWordStatusByLemma = useProductStore((s) => s.setWordStatusByLemma);
  const markPageKnown = useProductStore((s) => s.markPageKnown);
  const saveWord = useProductStore((s) => s.saveWord);
  const removeWord = useProductStore((s) => s.removeWord);
  const togglePlaylist = useProductStore((s) => s.togglePlaylist);
  const recordReading = useProductStore((s) => s.recordReading);

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedToken, setSelectedToken] = useState<RawToken | null>(null);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [showVocabSidebar, setShowVocabSidebar] = useState(false);
  const [fontTools, setFontTools] = useState(false);
  const [fontSize, setFontSize] = useState(preferences.fontSize);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  const pages = useMemo(() => {
    if (!lesson?.content) return [];
    return paginate(splitSentences(lesson.content, lesson.languageCode), lesson.languageCode);
  }, [lesson?.content, lesson?.languageCode]);

  const currentPageData = pages[currentPage] ?? { sentences: [], wordCount: 0, pageNumber: 1 };

  const pageWordLemmas = useMemo((): string[] => {
    if (!lesson) return [];
    return currentPageData.sentences.flatMap((s) =>
      tokenize(s.text, lesson.languageCode).filter((t) => t.isWord).map((t) => t.lemma)
    );
  }, [currentPageData.sentences, lesson]);

  const pageLemmaSet = useMemo(() => new Set(pageWordLemmas), [pageWordLemmas]);

  const stats = useMemo(() => {
    if (!lesson?.content) return null;
    return computeLessonStats(lesson.content, lesson.languageCode, statusOf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.content, lesson?.languageCode, statusVersion]);

  // Stable callback; statusVersion causes re-renders of ReaderText colour pass
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getStatus = useCallback((lemma: string): WordStatus => statusOf(lemma), [statusOf, statusVersion]);

  useEffect(() => () => { stopWebSpeech(); }, []);

  useEffect(() => {
    if (!lesson || !preferences.autoPlayAudio) return;
    void speakEnglishWeb(lesson.content, {
      rate: preferences.speechRate,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
    // autoplay once on lesson mount only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson?.id]);

  if (!lesson) {
    return (
      <div className="grid min-h-[calc(100vh-72px)] place-items-center bg-white px-6 text-center">
        <div>
          <BookOpenText className="mx-auto h-10 w-10 text-slate-400" />
          <h1 className="mt-4 text-2xl font-bold">Leçon introuvable</h1>
          <p className="mt-2 text-slate-500">Cette leçon n'est plus disponible sur cet appareil.</p>
          <Link href="/library" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white">
            Retour à la bibliothèque
          </Link>
        </div>
      </div>
    );
  }

  const handleTokenClick = (token: RawToken, sentenceText: string) => {
    setSelectedToken(token);
    setSelectedSentence(sentenceText);
    setShowVocabSidebar(false);
  };

  const handleSave = async (translation: string, status: LearningStatus) => {
    if (!selectedToken) return;
    if (status === 'known' || status === 'ignored') {
      setWordStatusByLemma(selectedToken.lemma, status as WordStatus);
      return;
    }
    saveWord({
      term: selectedToken.form,
      translation,
      context: selectedSentence,
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      status: status as WordStatus,
    });
  };

  const handleRemove = () => {
    const word = words.find((w) => w.lemma === selectedToken?.lemma);
    if (word && window.confirm(`Supprimer « ${word.term} » du vocabulaire ?`)) {
      removeWord(word.id);
    }
  };

  const goToPage = (nextIdx: number) => {
    if (preferences.pagingMovesToKnown) markPageKnown(pageWordLemmas);
    setCurrentPage(nextIdx);
    setSelectedToken(null);
    textRef.current?.scrollTo({ top: 0 });
  };

  const finishLesson = () => {
    if (preferences.pagingMovesToKnown) markPageKnown(pageWordLemmas);
    recordReading(lesson.id, stats?.totalWords ?? lesson.wordCount);
    if (!playlist.includes(lesson.id)) togglePlaylist(lesson.id);
    setCompleted(true);
  };

  const speak = () => {
    if (isPlaying) { stopWebSpeech(); setIsPlaying(false); return; }
    void speakEnglishWeb(lesson.content, {
      rate: preferences.speechRate,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const selectedSavedWord = words.find((w) => w.lemma === selectedToken?.lemma) as SavedWord | undefined;
  const totalPages = pages.length || 1;
  const progressPercent = completed ? 100 : Math.round(((currentPage + 1) / totalPages) * 100);
  const rtl = lesson.languageCode ? isRtl(lesson.languageCode) : false;

  return (
    <div className="flex h-[calc(100vh-72px)] min-h-[620px] flex-col bg-white">
      {/* Header */}
      <div className="flex h-[58px] shrink-0 items-center gap-3 border-b border-slate-200 px-4 sm:px-6">
        <Link href="/library" className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100" aria-label="Retour à la bibliothèque">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="h-1.5 max-w-[408px] overflow-hidden rounded-full bg-slate-200">
            <span className="block h-full rounded-full bg-emerald-500 transition-[width]" style={{ width: `${Math.max(4, progressPercent)}%` }} />
          </div>
        </div>
        {stats && (
          <div className="hidden items-center gap-3 text-xs text-slate-500 md:flex">
            <span className="rounded-full bg-[#cfe4ff] px-2 py-0.5 font-semibold text-[#0b1c2d]">{stats.newPercent}% nou.</span>
            <span className="rounded-full bg-[#ffe08a] px-2 py-0.5 font-semibold text-[#4a3200]">{stats.savedPercent}% sauv.</span>
          </div>
        )}
        <button type="button" onClick={() => setFontTools((v) => !v)} className={`grid h-10 w-10 place-items-center rounded-full ${fontTools ? 'bg-slate-200' : 'hover:bg-slate-100'}`} aria-label="Réglages du texte">
          <Type className="h-4 w-4" />
        </button>
        <button type="button" onClick={() => { setShowVocabSidebar((v) => !v); setSelectedToken(null); }} className={`grid h-10 w-10 place-items-center rounded-full ${showVocabSidebar ? 'bg-slate-200' : 'hover:bg-slate-100'}`} aria-label="Vocabulaire de la leçon">
          <BookMarked className="h-4 w-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100" aria-label="Options de la leçon">
              <CircleEllipsis className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
            <DropdownMenuItem className="min-h-10 rounded-lg" onClick={() => togglePlaylist(lesson.id)}>
              <ListPlus className="mr-2 h-4 w-4" />
              {playlist.includes(lesson.id) ? 'Retirer de la playlist' : 'Ajouter à la playlist'}
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="min-h-10 rounded-lg">
              <Link href="/vocab"><BookOpenText className="mr-2 h-4 w-4" />Ouvrir le vocabulaire</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Font toolbar */}
      {fontTools && (
        <div className="flex min-h-14 items-center justify-center gap-4 border-b border-slate-200 bg-slate-50 px-4">
          <span className="text-sm font-semibold">Taille du texte</span>
          <input type="range" min="16" max="30" step="1" value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-48 accent-[#0b1c2d]" aria-label="Taille du texte" />
          <span className="w-8 text-sm font-bold">{fontSize}</span>
        </div>
      )}

      {/* Content */}
      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 overflow-y-auto" ref={textRef} dir={rtl ? 'rtl' : 'ltr'}>
          <div className="mx-auto max-w-[760px] px-6 pb-32 pt-10 sm:px-10 lg:pt-14">
            <header className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                <Image src={coverImage(lesson)} alt="" fill sizes="64px" className="object-cover" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold">{lesson.title}</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Page {currentPageData.pageNumber}/{totalPages} · {currentPageData.wordCount} mots
                </p>
              </div>
            </header>

            {completed ? (
              <div className="mt-14 rounded-2xl border border-emerald-200 bg-emerald-50 p-8 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white">
                  <Check className="h-7 w-7" />
                </span>
                <h2 className="mt-5 text-2xl font-bold">Leçon terminée</h2>
                <p className="mt-2 text-slate-600">Progression et mots explorés enregistrés.</p>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  <Link href="/vocab" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-300 bg-white px-5 text-sm font-bold text-emerald-800">Voir le vocabulaire</Link>
                  <Link href="/library" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white">Choisir une autre leçon</Link>
                </div>
              </div>
            ) : (
              <>
                <div className="mt-12">
                  <ReaderText
                    sentences={currentPageData.sentences}
                    languageCode={lesson.languageCode}
                    getStatus={getStatus}
                    selectedLemma={selectedToken?.lemma ?? null}
                    onTokenClick={handleTokenClick}
                    fontSize={fontSize}
                  />
                </div>

                {showTranslation && lesson.translation && (
                  <div className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-base leading-7 text-slate-600">
                    <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Traduction</p>
                    <p className="mt-3">{lesson.translation}</p>
                  </div>
                )}

                {/* Page navigation */}
                <div className="mt-12 flex items-center gap-3">
                  {currentPage > 0 && (
                    <button type="button" onClick={() => goToPage(currentPage - 1)} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-slate-300 px-5 text-sm font-bold hover:bg-slate-50">
                      <ChevronLeft className="h-4 w-4" /> Page précédente
                    </button>
                  )}
                  <div className="flex-1" />
                  {currentPage < totalPages - 1 ? (
                    <button type="button" onClick={() => goToPage(currentPage + 1)} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white hover:bg-slate-800">
                      Page suivante <ChevronRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button type="button" onClick={finishLesson} className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700">
                      Terminer la leçon <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right panel: TranslationPanel or VocabSidebar */}
        {selectedToken && !showVocabSidebar && (
          <div className="fixed inset-0 z-50 bg-white lg:static lg:z-auto lg:block">
            <TranslationPanel
              word={selectedToken.form}
              sentence={selectedSentence}
              sourceLanguage={lesson.languageCode}
              savedWord={selectedSavedWord}
              onSave={handleSave}
              onRemove={selectedSavedWord ? handleRemove : undefined}
              onClose={() => setSelectedToken(null)}
            />
          </div>
        )}
        {showVocabSidebar && (
          <div className="fixed inset-0 z-50 bg-white lg:static lg:z-auto lg:block">
            <VocabSidebar
              lessonId={lesson.id}
              pageLemmas={pageLemmaSet}
              onClose={() => setShowVocabSidebar(false)}
              onWordClick={(lemma) => {
                const token = pageWordLemmas.includes(lemma)
                  ? ({ form: lemma, lemma, offset: 0, isWord: true } as RawToken)
                  : null;
                if (token) { setSelectedToken(token); setSelectedSentence(''); }
                setShowVocabSidebar(false);
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="flex h-[64px] shrink-0 items-center justify-between border-t border-slate-200 bg-white px-5 sm:px-8">
        <button type="button" onClick={speak} className="grid h-11 w-11 place-items-center rounded-full bg-[#0b1c2d] text-white hover:bg-slate-800" aria-label={isPlaying ? 'Arrêter la lecture' : 'Écouter la leçon'}>
          {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
        </button>
        <button type="button" onClick={() => setShowTranslation((v) => !v)} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-slate-100">
          <BookOpenText className="h-4 w-4" />
          {showTranslation ? 'Masquer la traduction' : 'Traduction'}
        </button>
        <div className="hidden items-center gap-2 text-sm font-semibold text-slate-600 sm:flex">
          <Volume2 className="h-4 w-4" />
          {words.filter((w) => w.lessonId === lesson.id).length} sauvegardés
        </div>
      </footer>
    </div>
  );
}

