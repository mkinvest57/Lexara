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
  Captions,
  Languages,
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
  const allLessons = useProductStore((s) => s.lessons);
  const togglePlaylist = useProductStore((s) => s.togglePlaylist);
  const recordReading = useProductStore((s) => s.recordReading);

  const updatePreferences = useProductStore((s) => s.updatePreferences);

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedToken, setSelectedToken] = useState<RawToken | null>(null);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [showVocabSidebar, setShowVocabSidebar] = useState(false);
  const [fontTools, setFontTools] = useState(false);
  const [fontSize, setFontSize] = useState(preferences.fontSize);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [readingMode, setReadingMode] = useState<'read' | 'sentence' | 'karaoke'>('read');
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [karaokeForm, setKaraokeForm] = useState<string | null>(null);
  const [sentenceTrs, setSentenceTrs] = useState<Record<string, string>>({});
  const [ttsChar, setTtsChar] = useState(0);
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
    if (isPlaying) { stopWebSpeech(); setIsPlaying(false); setKaraokeForm(null); setTtsChar(0); return; }
    const text = readingMode === 'sentence'
      ? (currentPageData.sentences[sentenceIdx]?.text ?? '')
      : lesson.content;
    void speakEnglishWeb(text, {
      rate: preferences.speechRate,
      onStart: () => setIsPlaying(true),
      onEnd: () => { setIsPlaying(false); setKaraokeForm(null); setTtsChar(0); },
      onError: () => { setIsPlaying(false); setKaraokeForm(null); setTtsChar(0); },
      onBoundary: (e) => {
        if (e.name === 'word') {
          setTtsChar(e.charIndex);
          const word = text.slice(e.charIndex, e.charIndex + e.charLength).replace(/\W/g, '');
          setKaraokeForm(word || null);
        }
      },
    });
  };

  const selectedSavedWord = words.find((w) => w.lemma === selectedToken?.lemma) as SavedWord | undefined;
  const totalPages = pages.length || 1;
  const progressPercent = completed ? 100 : Math.round(((currentPage + 1) / totalPages) * 100);
  const rtl = lesson.languageCode ? isRtl(lesson.languageCode) : false;
  const nextPlaylistLesson = useMemo(() => {
    const idx = playlist.indexOf(lesson.id);
    if (idx < 0 || idx >= playlist.length - 1) return null;
    return allLessons.find((l) => l.id === playlist[idx + 1]) ?? null;
  }, [lesson.id, allLessons, playlist]);

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
        {/* Mode switcher */}
        <div className="flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
          {([['read', BookOpenText, 'Lecture'], ['sentence', Languages, 'Phrase'], ['karaoke', Captions, 'Karaoké']] as const).map(([mode, Icon, label]) => (
            <button
              key={mode}
              type="button"
              title={label}
              onClick={() => { setReadingMode(mode); setSentenceIdx(0); stopWebSpeech(); setIsPlaying(false); setKaraokeForm(null); }}
              className={`grid h-8 w-8 place-items-center rounded-full transition-colors ${readingMode === mode ? 'bg-[#0b1c2d] text-white' : 'text-slate-500 hover:text-slate-800'}`}
              aria-label={label}
            >
              <Icon className="h-3.5 w-3.5" />
            </button>
          ))}
        </div>
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
                  {nextPlaylistLesson ? (
                    <Link href={`/lesson/${nextPlaylistLesson.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white">
                      Leçon suivante <ChevronRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <Link href="/library" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white">Choisir une autre leçon</Link>
                  )}
                </div>
              </div>
            ) : (
              <>
                <div className="mt-12">
                  {readingMode === 'sentence' ? (
                    <SentenceMode
                      sentences={currentPageData.sentences}
                      sentenceIdx={sentenceIdx}
                      languageCode={lesson.languageCode}
                      getStatus={getStatus}
                      selectedLemma={selectedToken?.lemma ?? null}
                      onTokenClick={handleTokenClick}
                      fontSize={fontSize}
                      translations={sentenceTrs}
                      onTranslate={async (text, idx) => {
                        const key = `${currentPage}-${idx}`;
                        if (sentenceTrs[key]) { setSentenceTrs((t) => { const n = { ...t }; delete n[key]; return n; }); return; }
                        const res = await fetch('/api/translate?' + new URLSearchParams({ text, source: lesson.languageCode, target: 'fr' }));
                        if (!res.ok) return;
                        const json = (await res.json()) as { translatedText?: string };
                        if (json.translatedText) setSentenceTrs((t) => ({ ...t, [key]: json.translatedText! }));
                      }}
                      onPrev={() => setSentenceIdx((i) => Math.max(0, i - 1))}
                      onNext={() => {
                        if (sentenceIdx < currentPageData.sentences.length - 1) setSentenceIdx((i) => i + 1);
                        else if (currentPage < totalPages - 1) { goToPage(currentPage + 1); setSentenceIdx(0); }
                      }}
                      pageKey={`${currentPage}`}
                    />
                  ) : (
                    <ReaderText
                      sentences={currentPageData.sentences}
                      languageCode={lesson.languageCode}
                      getStatus={getStatus}
                      selectedLemma={selectedToken?.lemma ?? null}
                      highlightForm={readingMode === 'karaoke' ? karaokeForm : null}
                      onTokenClick={handleTokenClick}
                      fontSize={fontSize}
                    />
                  )}
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
      <footer className="shrink-0 border-t border-slate-200 bg-white">
        {isPlaying && lesson.content.length > 0 && (
          <div className="h-0.5 bg-slate-100">
            <div className="h-full bg-emerald-400 transition-[width] duration-300" style={{ width: `${Math.min(100, Math.round((ttsChar / lesson.content.length) * 100))}%` }} />
          </div>
        )}
        <div className="flex h-[64px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2">
            <button type="button" onClick={speak} className="grid h-11 w-11 place-items-center rounded-full bg-[#0b1c2d] text-white hover:bg-slate-800" aria-label={isPlaying ? 'Arrêter la lecture' : 'Écouter la leçon'}>
              {isPlaying ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
            </button>
            <div className="hidden items-center gap-1 sm:flex">
              {[0.75, 1, 1.25, 1.5].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => updatePreferences({ speechRate: rate })}
                  className={`h-7 min-w-[40px] rounded-full px-2 text-xs font-bold transition-colors ${Math.abs(preferences.speechRate - rate) < 0.01 ? 'bg-[#0b1c2d] text-white' : 'border border-slate-300 text-slate-600 hover:bg-slate-100'}`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          </div>
          <button type="button" onClick={() => setShowTranslation((v) => !v)} className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-slate-100">
            <BookOpenText className="h-4 w-4" />
            {showTranslation ? 'Masquer la traduction' : 'Traduction'}
          </button>
          <div className="hidden items-center gap-2 text-sm font-semibold text-slate-600 sm:flex">
            <Volume2 className="h-4 w-4" />
            {words.filter((w) => w.lessonId === lesson.id).length} sauvegardés
          </div>
        </div>
      </footer>
    </div>
  );
}

interface SentenceModeProps {
  sentences: import('@yapro/core').SplitSentence[];
  sentenceIdx: number;
  languageCode: string;
  getStatus: (lemma: string) => WordStatus;
  selectedLemma: string | null;
  onTokenClick: (token: RawToken, sentenceText: string) => void;
  fontSize: number;
  translations: Record<string, string>;
  onTranslate: (text: string, idx: number) => Promise<void>;
  onPrev: () => void;
  onNext: () => void;
  pageKey: string;
}

function SentenceMode({ sentences, sentenceIdx, languageCode, getStatus, selectedLemma, onTokenClick, fontSize, translations, onTranslate, onPrev, onNext, pageKey }: SentenceModeProps) {
  const [translating, setTranslating] = useState(false);
  const sentence = sentences[sentenceIdx];
  const trKey = `${pageKey}-${sentenceIdx}`;

  if (!sentence) return null;

  const handleTranslate = async () => {
    setTranslating(true);
    await onTranslate(sentence.text, sentenceIdx);
    setTranslating(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full items-center justify-between text-xs font-semibold text-slate-400">
        <span>{sentenceIdx + 1} / {sentences.length}</span>
        <div className="flex gap-1">
          {sentences.map((_, i) => (
            <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === sentenceIdx ? 'bg-[#0b1c2d]' : 'bg-slate-200'}`} />
          ))}
        </div>
      </div>

      <div className="w-full rounded-2xl border-2 border-slate-200 bg-white px-6 py-8 text-center shadow-sm">
        <ReaderText
          sentences={[sentence]}
          languageCode={languageCode}
          getStatus={getStatus}
          selectedLemma={selectedLemma}
          onTokenClick={onTokenClick}
          fontSize={fontSize}
          lineHeight={2}
        />
        {translations[trKey] && (
          <p className="mt-4 text-base text-slate-500 italic">"{translations[trKey]}"</p>
        )}
      </div>

      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={onPrev}
          disabled={sentenceIdx === 0}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Précédent
        </button>
        <button
          type="button"
          onClick={handleTranslate}
          disabled={translating}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          <Languages className="h-4 w-4" />
          {translations[trKey] ? 'Masquer' : translating ? 'Traduction…' : 'Traduire'}
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#0b1c2d] px-4 text-sm font-bold text-white hover:bg-slate-800"
        >
          Suivant <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

