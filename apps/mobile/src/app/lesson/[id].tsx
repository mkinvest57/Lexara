import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from '@/components/symbol-view';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { dictionary, getWordCount, normalizeWord } from '@/lib/catalog';
import { getLessonCover } from '@/lib/lesson-covers';
import { useProduct } from '@/lib/product-store';
import { speakEnglish, stopSpeech } from '@/lib/speech';
import { translateEnglishToFrench } from '@/lib/translation';
import { getPhoneticAnnotation } from '@/lib/phonetics';
import { paginate, splitSentences } from '@yapro/core';
import { productTheme } from '@/constants/product-theme';

const punctuationOnly = /^[^a-zA-Z]+$/;

type ReaderToken = {
  id: string;
  raw: string;
  normalized: string;
  context: string;
  leadingSpace: boolean;
};

export default function LessonScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct();
  const insets = useSafeAreaInsets();
  const lesson = product.lessons.find((item) => item.id === id);
  const [selected, setSelected] = useState<ReaderToken | null>(null);
  const [translation, setTranslation] = useState('');
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationError, setTranslationError] = useState('');
  const [playing, setPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [phraseOpen, setPhraseOpen] = useState(false);
  const [phraseSource, setPhraseSource] = useState('');
  const [phraseTranslation, setPhraseTranslation] = useState('');
  const [phraseLoading, setPhraseLoading] = useState(false);
  const [phraseError, setPhraseError] = useState('');
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const [sentenceIdx, setSentenceIdx] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [readingMode, setReadingMode] = useState<'read' | 'sentence' | 'karaoke'>('read');
  const [fontTools, setFontTools] = useState(false);
  const [fontSize, setFontSize] = useState(() => Math.round(18 * (product.preferences.readerFontScale ?? 1)));
  const [sentenceTrs, setSentenceTrs] = useState<Record<string, string>>({});
  const [vocabOpen, setVocabOpen] = useState(false);
  const [karaokeCharIdx, setKaraokeCharIdx] = useState(-1);
  const progressRef = useRef(product.progress);
  const updateProgressRef = useRef(product.updateLessonProgress);
  const listeningStartedAtRef = useRef<number | null>(null);
  const translationRequestRef = useRef(0);
  const autoplayedLessonRef = useRef<string | null>(null);

  const pages = useMemo(
    () => paginate(splitSentences(lesson?.content ?? '', lesson?.language || 'en'), lesson?.language || 'en'),
    [lesson?.content, lesson?.language],
  );
  const tokens = useMemo(
    () => tokenizeLesson(pages[currentPage]?.sentences.map((s) => s.text).join(' ') ?? lesson?.content ?? ''),
    [pages, currentPage, lesson?.content],
  );
  const sentences = useMemo(
    () => lesson?.content.match(/[^.!?]+[.!?]*/g)?.map((s) => s.trim()).filter(Boolean) ?? (lesson?.content ? [lesson.content] : []),
    [lesson?.content],
  );
  const savedTerms = useMemo(
    () => new Map(product.vocabulary.map((item) => [item.normalizedTerm, item])),
    [product.vocabulary],
  );
  const pageSentences = useMemo(
    () => pages[currentPage]?.sentences ?? [],
    [pages, currentPage],
  );

  const tokenRanges = useMemo(() => {
    let pos = 0;
    return tokens.map((t) => {
      const prefix = t.leadingSpace ? 1 : 0;
      const start = pos + prefix;
      const end = start + t.raw.length - 1;
      pos += prefix + t.raw.length;
      return { start, end };
    });
  }, [tokens]);

  const karaokeTokenIdx = useMemo(() => {
    if (karaokeCharIdx < 0) return -1;
    return tokenRanges.findIndex((r) => karaokeCharIdx >= r.start && karaokeCharIdx <= r.end);
  }, [karaokeCharIdx, tokenRanges]);

  const lessonStats = useMemo(() => {
    const allTokens = tokenizeLesson(lesson?.content ?? '');
    const unique = new Set(allTokens.map((t) => t.normalized).filter(Boolean));
    let newW = 0, savedW = 0;
    for (const norm of unique) {
      const v = savedTerms.get(norm);
      if (!v) newW++;
      else if (v.status !== 4) savedW++;
    }
    const total = unique.size || 1;
    return { newPercent: Math.round((newW / total) * 100), savedPercent: Math.round((savedW / total) * 100) };
  }, [lesson?.content, savedTerms]);

  useEffect(() => {
    progressRef.current = product.progress;
  }, [product.progress]);

  useEffect(() => {
    updateProgressRef.current = product.updateLessonProgress;
  }, [product.updateLessonProgress]);

  const flushListening = useCallback(() => {
    const lessonId = lesson?.id;
    const startedAt = listeningStartedAtRef.current;
    if (!lessonId || startedAt === null) return;
    listeningStartedAtRef.current = null;
    const current = progressRef.current[lessonId];
    updateProgressRef.current(lessonId, {
      listenedSeconds:
        (current?.listenedSeconds ?? 0) +
        Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
    });
  }, [lesson?.id]);

  const startLessonAudio = useCallback(async () => {
    if (!lesson || audioLoading) return;
    setAudioLoading(true);
    try {
      await speakEnglish(lesson.content, {
        language: lesson.language || product.profile.targetLanguage || 'en',
        rate: product.preferences.speechRate,
        onStart: () => {
          setAudioLoading(false);
          setPlaying(true);
          listeningStartedAtRef.current = Date.now();
        },
        onDone: () => {
          flushListening();
          setAudioLoading(false);
          setPlaying(false);
        },
        onStopped: () => {
          flushListening();
          setAudioLoading(false);
          setPlaying(false);
        },
        onError: () => {
          flushListening();
          setAudioLoading(false);
          setPlaying(false);
        },
      });
    } catch {
      setAudioLoading(false);
      setPlaying(false);
    }
  }, [audioLoading, flushListening, lesson, product.preferences.speechRate]);

  const stopLessonAudio = useCallback(async () => {
    await stopSpeech();
    flushListening();
    setAudioLoading(false);
    setPlaying(false);
  }, [flushListening]);

  useEffect(() => {
    if (readingMode !== 'karaoke') {
      setKaraokeCharIdx(-1);
      return;
    }
    setKaraokeCharIdx(-1);
    const pageText = tokens.map((t) => (t.leadingSpace ? ' ' : '') + t.raw).join('');
    void speakEnglish(pageText, {
      language: lesson?.language || product.profile.targetLanguage || 'en',
      rate: product.preferences.speechRate,
      onBoundary: (e: { charIndex: number }) => setKaraokeCharIdx(e.charIndex),
      onDone: () => setKaraokeCharIdx(-1),
      onStopped: () => setKaraokeCharIdx(-1),
      onError: () => setKaraokeCharIdx(-1),
    });
    return () => {
      void stopSpeech();
      setKaraokeCharIdx(-1);
    };
  }, [readingMode, currentPage]);

  useEffect(() => {
    const lessonId = lesson?.id;
    if (!lessonId) return;
    const startedAt = Date.now();
    return () => {
      void stopSpeech();
      flushListening();
      const current = progressRef.current[lessonId];
      updateProgressRef.current(lessonId, {
        secondsSpent:
          (current?.secondsSpent ?? 0) +
          Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      });
    };
  }, [flushListening, lesson?.id]);

  useEffect(() => {
    if (
      !lesson ||
      !product.preferences.autoplayAudio ||
      autoplayedLessonRef.current === lesson.id
    ) {
      return;
    }
    autoplayedLessonRef.current = lesson.id;
    void startLessonAudio();
  }, [lesson, product.preferences.autoplayAudio, startLessonAudio]);

  if (!lesson) {
    return (
      <SafeAreaView style={styles.notFound}>
        <SymbolView name="exclamationmark.triangle.fill" tintColor={productTheme.orange} size={38} />
        <Text style={styles.notFoundTitle}>Leçon introuvable</Text>
        <Text style={styles.notFoundCopy}>
          Cette leçon n’existe plus dans votre bibliothèque.
        </Text>
        <Pressable onPress={() => router.replace('/')} style={styles.notFoundButton}>
          <Text style={styles.notFoundButtonText}>Retour à la bibliothèque</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const openWord = async (token: ReaderToken) => {
    if (!token.normalized || punctuationOnly.test(token.raw)) return;
    const request = ++translationRequestRef.current;
    const immediateTranslation =
      savedTerms.get(token.normalized)?.translation ??
      dictionary[token.normalized]?.translation ??
      '';
    setSelected(token);
    setTranslation(immediateTranslation);
    setTranslationError('');
    setTranslationLoading(!immediateTranslation);
    const nextSeenCount = seen.has(token.id) ? seen.size : seen.size + 1;
    setSeen((current) => {
      const next = new Set(current);
      next.add(token.id);
      return next;
    });
    product.updateLessonProgress(lesson.id, {
      wordsRead: Math.max(product.progress[lesson.id]?.wordsRead ?? 0, nextSeenCount),
      progress: Math.min(0.95, nextSeenCount / Math.max(1, getWordCount(lesson.content))),
    });

    if (immediateTranslation) return;
    try {
      const translated = await translateEnglishToFrench(
        token.normalized,
        lesson?.language || product.profile.targetLanguage || 'en',
        'fr',
      );
      if (translationRequestRef.current === request) setTranslation(translated);
    } catch {
      if (translationRequestRef.current === request) {
        setTranslationError('Traduction indisponible. Vous pouvez saisir votre propre signification.');
      }
    } finally {
      if (translationRequestRef.current === request) setTranslationLoading(false);
    }
  };

  const toggleAudio = async () => {
    if (playing || audioLoading) await stopLessonAudio();
    else await startLessonAudio();
  };

  const saveSelected = () => {
    if (!selected) return;
    if (!translation.trim()) {
      setTranslationError('Ajoutez une traduction avant de sauvegarder ce mot.');
      return;
    }
    product.saveWord({
      term: selected.normalized,
      translation: translation.trim() || undefined,
      context: selected.context,
      lessonId: lesson.id,
    });
    setSelected(null);
  };

  const completeLesson = () => {
    flushListening();
    product.updateLessonProgress(lesson.id, {
      wordsRead: getWordCount(lesson.content),
      progress: 1,
      completed: true,
    });
    router.replace({ pathname: '/lesson-complete', params: { id: lesson.id } });
  };

  const openPhraseTranslation = async (src?: string) => {
    const source = src ?? selected?.context ?? tokens[0]?.context ?? lesson.content;
    const request = ++translationRequestRef.current;
    setPhraseSource(source);
    setPhraseTranslation('');
    setPhraseError('');
    setPhraseLoading(true);
    setPhraseOpen(true);
    try {
      const translated = await translateEnglishToFrench(source);
      if (translationRequestRef.current === request) setPhraseTranslation(translated);
    } catch {
      if (translationRequestRef.current === request) {
        setPhraseError('La traduction de cette phrase est momentanément indisponible.');
      }
    } finally {
      if (translationRequestRef.current === request) setPhraseLoading(false);
    }
  };

  const speakIsolatedText = async (text: string, rate = product.preferences.speechRate) => {
    await stopLessonAudio();
    await speakEnglish(text, { rate });
  };

  const swipeGesture = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-15, 15])
    .onEnd((e) => {
      if (Math.abs(e.translationX) < 40) return;
      const next =
        e.translationX < 0
          ? Math.min(sentenceIdx + 1, sentences.length - 1)
          : Math.max(sentenceIdx - 1, 0);
      if (next === sentenceIdx) return;
      setSentenceIdx(next);
      void openPhraseTranslation(sentences[next]);
    });

  const savedInLesson = product.vocabulary.filter((item) => item.lessonId === lesson.id);
  const progress = product.progress[lesson.id]?.progress ?? Math.min(0.08, seen.size / tokens.length);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer la leçon"
          onPress={router.back}
          style={styles.topButton}>
          <SymbolView name="xmark" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <View style={styles.topProgress}>
          <View style={[styles.topProgressFill, { width: `${Math.max(3, progress * 100)}%` }]} />
        </View>
        {/* Mode switcher */}
        <View style={styles.modeSwitcher}>
          {([['read', 'doc.text', 'Lecture'], ['sentence', 'text.justify', 'Phrase'], ['karaoke', 'waveform', 'Karaoké']] as const).map(([mode, icon, label]) => (
            <Pressable
              key={mode}
              accessibilityRole="button"
              accessibilityLabel={label}
              onPress={() => { setReadingMode(mode); setSentenceIdx(0); }}
              style={[styles.modeButton, readingMode === mode && styles.modeButtonActive]}>
              <SymbolView name={icon as never} tintColor={readingMode === mode ? '#FFFFFF' : productTheme.inkSoft} size={13} />
            </Pressable>
          ))}
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Vocabulaire de la leçon"
          onPress={() => setVocabOpen(true)}
          style={[styles.topButton, savedInLesson.length > 0 && styles.topButtonActive]}>
          <SymbolView name="bookmark.fill" tintColor={savedInLesson.length > 0 ? '#FFFFFF' : productTheme.ink} size={18} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Taille du texte"
          onPress={() => setFontTools((v) => !v)}
          style={[styles.topButton, fontTools && styles.topButtonActive]}>
          <SymbolView name="textformat.size" tintColor={productTheme.ink} size={18} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Aimer cette leçon"
          onPress={() => product.toggleLikeLesson(lesson.id)}
          style={styles.topButton}>
          <SymbolView
            name={product.likedLessonIds.includes(lesson.id) ? 'heart.fill' : 'heart'}
            tintColor={product.likedLessonIds.includes(lesson.id) ? productTheme.red : productTheme.ink}
            size={20}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir les options de la leçon"
          onPress={() => setMenuOpen(true)}
          style={styles.topButton}>
          <SymbolView name="ellipsis" tintColor={productTheme.ink} size={21} />
        </Pressable>
      </View>

      {fontTools && (
        <View style={styles.fontToolbar}>
          <Text style={styles.fontToolbarLabel}>Taille du texte</Text>
          <Pressable onPress={() => setFontSize((s) => Math.max(14, s - 1))} style={styles.fontStepButton}>
            <Text style={styles.fontStepText}>−</Text>
          </Pressable>
          <Text style={styles.fontSizeValue}>{fontSize}</Text>
          <Pressable onPress={() => setFontSize((s) => Math.min(28, s + 1))} style={styles.fontStepButton}>
            <Text style={styles.fontStepText}>+</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.statBadge}>
          <Text style={styles.statBadgeText}>{lessonStats.newPercent}% nou.</Text>
        </View>
        <View style={[styles.statBadge, styles.statBadgeSaved]}>
          <Text style={[styles.statBadgeText, styles.statBadgeTextSaved]}>{lessonStats.savedPercent}% sauv.</Text>
        </View>
        {pages.length > 1 && (
          <Text style={styles.pageIndicator}>p. {currentPage + 1}/{pages.length}</Text>
        )}
      </View>

      <View style={styles.lessonHeader}>
        <Image
          source={getLessonCover(lesson.id)}
          contentFit="cover"
          contentPosition={lesson.imagePosition as never}
          style={styles.lessonImage}
        />
        <View style={styles.lessonHeaderCopy}>
          <Text numberOfLines={1} style={styles.lessonTitle}>{lesson.title}</Text>
          <Text numberOfLines={1} style={styles.lessonCollection}>{lesson.collection}</Text>
        </View>
      </View>

      {readingMode === 'sentence' ? (
        <SentenceModeCard
          sentences={pageSentences}
          sentenceIdx={sentenceIdx}
          savedTerms={savedTerms}
          fontSize={fontSize}
          translation={sentenceTrs[`${currentPage}-${sentenceIdx}`]}
          translating={phraseLoading && phraseOpen}
          onTokenPress={openWord}
          onPrev={() => {
            if (sentenceIdx > 0) setSentenceIdx((i) => i - 1);
            else if (currentPage > 0) { setCurrentPage((p) => p - 1); setSentenceIdx((pages[currentPage - 1]?.sentences.length ?? 1) - 1); }
          }}
          onNext={() => {
            if (sentenceIdx < pageSentences.length - 1) setSentenceIdx((i) => i + 1);
            else if (currentPage < pages.length - 1) { setCurrentPage((p) => p + 1); setSentenceIdx(0); }
            else completeLesson();
          }}
          onTranslate={async () => {
            const key = `${currentPage}-${sentenceIdx}`;
            if (sentenceTrs[key]) { setSentenceTrs((t) => { const n = { ...t }; delete n[key]; return n; }); return; }
            const src = pageSentences[sentenceIdx]?.text ?? '';
            setPhraseLoading(true);
            setPhraseOpen(true);
            try {
              const tr = await translateEnglishToFrench(src);
              setSentenceTrs((t) => ({ ...t, [key]: tr }));
            } catch { /* silent */ } finally { setPhraseLoading(false); setPhraseOpen(false); }
          }}
          canPrev={sentenceIdx > 0 || currentPage > 0}
          canNext={sentenceIdx < pageSentences.length - 1 || currentPage < pages.length - 1}
          isLast={sentenceIdx === pageSentences.length - 1 && currentPage === pages.length - 1}
          insets={insets}
        />
      ) : (
        <GestureDetector gesture={swipeGesture}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.reader, { paddingBottom: 142 + insets.bottom }]}>
          <Text
            style={[
              styles.readerText,
              { fontSize, lineHeight: Math.round(fontSize * 1.94) },
            ]}>
            {tokens.map((token, idx) => {
              const saved = savedTerms.get(token.normalized);
              const isClickable = Boolean(token.normalized) && !punctuationOnly.test(token.raw);
              const isKaraoke = readingMode === 'karaoke' && idx === karaokeTokenIdx;
              return (
                <Text key={token.id}>
                  {token.leadingSpace ? ' ' : ''}
                  <Text
                    accessibilityRole={isClickable ? 'button' : undefined}
                    onPress={isClickable ? () => openWord(token) : undefined}
                    style={
                      isKaraoke
                        ? [styles.word, styles.wordKaraoke]
                        : !isClickable
                          ? undefined
                          : [
                              styles.word,
                              saved?.status === 4
                                ? styles.wordKnown
                                : saved
                                  ? styles.wordSaved
                                  : styles.wordNew,
                            ]
                    }>
                    {token.raw}
                  </Text>
                </Text>
              );
            })}
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Terminer la leçon"
            onPress={completeLesson}
            style={({ pressed }) => [styles.finishButton, pressed && styles.pressed]}>
            <Text style={styles.finishText}>Terminer la leçon</Text>
          </Pressable>
        </ScrollView>
        </GestureDetector>
      )}

      <View style={[styles.readerFooter, { paddingBottom: Math.max(10, insets.bottom) }]}>
        {pages.length > 1 && (
          <View style={styles.pageNavRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Page précédente"
              disabled={currentPage === 0}
              onPress={() => setCurrentPage((p) => p - 1)}
              style={[styles.pageNavButton, currentPage === 0 && styles.pageNavDisabled]}>
              <SymbolView name="chevron.left" tintColor={currentPage === 0 ? productTheme.mutedLight : productTheme.blue} size={16} />
            </Pressable>
            <Text style={styles.pageNavLabel}>Page {currentPage + 1} / {pages.length}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Page suivante"
              disabled={currentPage === pages.length - 1}
              onPress={() => setCurrentPage((p) => p + 1)}
              style={[styles.pageNavButton, currentPage === pages.length - 1 && styles.pageNavDisabled]}>
              <SymbolView name="chevron.right" tintColor={currentPage === pages.length - 1 ? productTheme.mutedLight : productTheme.blue} size={16} />
            </Pressable>
          </View>
        )}
        <View style={styles.footerActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={playing || audioLoading ? 'Arrêter la lecture' : 'Écouter la leçon'}
          onPress={() => void toggleAudio()}
          style={[styles.playButton, playing && styles.playButtonActive]}>
          {audioLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <SymbolView name={playing ? 'stop.fill' : 'play.fill'} tintColor="#FFFFFF" size={16} />
          )}
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Afficher les phrases et les traductions"
          onPress={() => {
            product.updatePreferences({ phraseMode: true });
            void openPhraseTranslation(sentences[sentenceIdx]);
          }}
          style={[styles.phraseButton, product.preferences.phraseMode && styles.phraseButtonActive]}>
          <SymbolView name="text.bubble" tintColor={productTheme.inkSoft} size={18} />
          <Text style={styles.phraseText}>Phrase & Traduction</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Réviser ${savedInLesson.length} ${savedInLesson.length > 1 ? 'mots' : 'mot'}`}
          onPress={() =>
            router.push({ pathname: '/review', params: { lessonId: lesson.id } })
          }
          style={styles.reviewButton}>
          <SymbolView name="rectangle.stack.fill" tintColor={productTheme.inkSoft} size={19} />
          <Text style={styles.reviewCount}>{savedInLesson.length}</Text>
        </Pressable>
        </View>
      </View>

      <WordSheet
        token={selected}
        translation={translation}
        loading={translationLoading}
        error={translationError}
        status={selected ? savedTerms.get(selected.normalized)?.status : undefined}
        onTranslationChange={setTranslation}
        onClose={() => {
          translationRequestRef.current += 1;
          setSelected(null);
        }}
        onSave={saveSelected}
        onSpeak={() => selected && void speakIsolatedText(selected.normalized)}
        onStatus={(status) => {
          if (!selected) return;
          const entry = savedTerms.get(selected.normalized);
          if (entry) product.setVocabularyStatus(entry.id, status);
        }}
      />

      <PhraseSheet
        open={phraseOpen}
        source={phraseSource}
        translation={phraseTranslation}
        loading={phraseLoading}
        error={phraseError}
        canPrev={sentenceIdx > 0}
        canNext={sentenceIdx < sentences.length - 1}
        onClose={() => {
          translationRequestRef.current += 1;
          setPhraseOpen(false);
        }}
        onSpeak={() => void speakIsolatedText(phraseSource)}
        onSpeakSlow={() => void speakIsolatedText(phraseSource, 0.68)}
        onShare={() => void Share.share({ message: phraseSource })}
        onPrev={() => {
          const next = Math.max(sentenceIdx - 1, 0);
          setSentenceIdx(next);
          void openPhraseTranslation(sentences[next]);
        }}
        onNext={() => {
          const next = Math.min(sentenceIdx + 1, sentences.length - 1);
          setSentenceIdx(next);
          void openPhraseTranslation(sentences[next]);
        }}
      />

      <LessonMenu
        open={menuOpen}
        savedCount={savedInLesson.length}
        onClose={() => setMenuOpen(false)}
        onReview={() => {
          setMenuOpen(false);
          router.push({ pathname: '/review', params: { lessonId: lesson.id } });
        }}
        onVocabulary={() => {
          setMenuOpen(false);
          router.push('/words');
        }}
        onPlaylist={() => {
          product.togglePlaylist(lesson.id);
          setMenuOpen(false);
        }}
      />

      <Modal
        visible={vocabOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setVocabOpen(false)}>
        <VocabPanel
          lessonId={lesson.id}
          pageLemmas={new Set(tokens.map((t) => t.normalized).filter(Boolean))}
          vocabulary={product.vocabulary}
          onClose={() => setVocabOpen(false)}
          onWordPress={(norm) => {
            setVocabOpen(false);
            const token = tokens.find((t) => t.normalized === norm);
            if (token) void openWord(token);
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}

function WordSheet({
  token,
  translation,
  loading,
  error,
  status,
  onTranslationChange,
  onClose,
  onSave,
  onSpeak,
  onStatus,
}: {
  token: ReaderToken | null;
  translation: string;
  loading: boolean;
  error: string;
  status?: 1 | 2 | 3 | 4;
  onTranslationChange(value: string): void;
  onClose(): void;
  onSave(): void;
  onSpeak(): void;
  onStatus(status: 1 | 2 | 3 | 4): void;
}) {
  return (
    <Modal transparent visible={Boolean(token)} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer la définition"
          onPress={onClose}
          style={styles.backdrop}
        />
        <SafeAreaView style={styles.wordSheet} edges={['bottom']}>
          <View style={styles.sheetHandle} />
          <View style={styles.wordHeader}>
            <View>
              <Text style={styles.selectedWord}>{token?.normalized}</Text>
              <Text style={styles.wordLanguage}>anglais → français</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Écouter ${token?.normalized ?? ''}`}
              onPress={onSpeak}
              style={styles.speakButton}>
              <SymbolView name="speaker.wave.2.fill" tintColor={productTheme.blue} size={21} />
            </Pressable>
          </View>
          <Text style={styles.sheetLabel}>TRADUCTION CONTEXTUELLE</Text>
          {loading ? (
            <View style={styles.translationLoading}>
              <ActivityIndicator color={productTheme.blue} size="small" />
              <Text style={styles.translationLoadingText}>Recherche de la meilleure traduction…</Text>
            </View>
          ) : null}
          <TextInput
            accessibilityLabel="Traduction du mot"
            editable={!loading}
            placeholder={loading ? 'Traduction en cours…' : 'Ajouter une traduction'}
            placeholderTextColor={productTheme.mutedLight}
            value={translation}
            onChangeText={onTranslationChange}
            style={styles.translationInput}
          />
          {error ? <Text accessibilityRole="alert" style={styles.translationError}>{error}</Text> : null}
          <Text style={styles.context}>{token?.context}</Text>
          {status ? (
            <View style={styles.statusRow}>
              {[1, 2, 3, 4, 5].map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  accessibilityLabel={`Statut ${item}`}
                  accessibilityState={{ selected: status === item }}
                  onPress={() => onStatus((item > 4 ? 4 : item) as 1 | 2 | 3 | 4)}
                  style={[styles.statusButton, status === item && styles.statusButtonActive]}>
                  <Text style={[styles.statusText, status === item && styles.statusTextActive]}>
                    {item === 5 ? '✓' : item}
                  </Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={status ? 'Mettre à jour le mot' : 'Enregistrer ce mot'}
            disabled={loading || !translation.trim()}
            onPress={onSave}
            style={[styles.saveButton, (loading || !translation.trim()) && styles.saveButtonDisabled]}>
            <SymbolView name="bookmark.fill" tintColor="#FFFFFF" size={18} />
            <Text style={styles.saveText}>{status ? 'Mettre à jour le mot' : 'Enregistrer ce mot'}</Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function PhraseSheet({
  open,
  source,
  translation,
  loading,
  error,
  canPrev,
  canNext,
  onClose,
  onSpeak,
  onSpeakSlow,
  onShare,
  onPrev,
  onNext,
}: {
  open: boolean;
  source: string;
  translation: string;
  loading: boolean;
  error: string;
  canPrev: boolean;
  canNext: boolean;
  onClose(): void;
  onSpeak(): void;
  onSpeakSlow(): void;
  onShare(): void;
  onPrev(): void;
  onNext(): void;
}) {
  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="Fermer la traduction" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView style={styles.phraseSheet} edges={['bottom']}>
          <View style={styles.sheetHandle} />
          <View style={styles.phraseTitleRow}>
            <View style={styles.phraseTitleCopy}>
              <Text style={styles.phraseTitle}>Phrase & Traduction</Text>
              <Text style={styles.wordLanguage}>anglais → français</Text>
            </View>
            <View style={styles.phraseAudioActions}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Partager la phrase"
                onPress={onShare}
                style={styles.slowSpeechButton}>
                <SymbolView name="square.and.arrow.up" tintColor={productTheme.blue} size={19} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Écouter lentement"
                onPress={onSpeakSlow}
                style={styles.slowSpeechButton}>
                <Text style={styles.slowSpeechText}>0.7x</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Écouter la phrase"
                onPress={onSpeak}
                style={styles.speakButton}>
                <SymbolView name="speaker.wave.2.fill" tintColor={productTheme.blue} size={21} />
              </Pressable>
            </View>
          </View>
          <View style={styles.phraseSourceCard}>
            <Text style={styles.phraseSource}>{source}</Text>
          </View>
          <Text style={styles.sheetLabel}>TRADUCTION</Text>
          <View style={styles.phraseTranslationCard}>
            {loading ? (
              <ActivityIndicator color={productTheme.green} size="small" />
            ) : (
              <Text style={styles.phraseTranslation}>{translation || error}</Text>
            )}
          </View>
          <View style={styles.phraseNavRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Phrase précédente"
              disabled={!canPrev}
              onPress={onPrev}
              style={[styles.phraseNavButton, !canPrev && styles.phraseNavDisabled]}>
              <SymbolView name="chevron.left" tintColor={canPrev ? productTheme.blue : productTheme.mutedLight} size={18} />
            </Pressable>
            <Pressable accessibilityRole="button" onPress={onClose} style={styles.phraseDoneButton}>
              <Text style={styles.phraseDoneText}>Continuer la lecture</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Phrase suivante"
              disabled={!canNext}
              onPress={onNext}
              style={[styles.phraseNavButton, !canNext && styles.phraseNavDisabled]}>
              <SymbolView name="chevron.right" tintColor={canNext ? productTheme.blue : productTheme.mutedLight} size={18} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function LessonMenu({
  open,
  savedCount,
  onClose,
  onReview,
  onVocabulary,
  onPlaylist,
}: {
  open: boolean;
  savedCount: number;
  onClose(): void;
  onReview(): void;
  onVocabulary(): void;
  onPlaylist(): void;
}) {
  return (
    <Modal transparent visible={open} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable accessibilityLabel="Fermer les options" onPress={onClose} style={styles.backdrop} />
        <SafeAreaView style={styles.menuSheet} edges={['bottom']}>
          <Text style={styles.menuTitle}>Options de la leçon</Text>
          <MenuRow symbol="rectangle.stack.fill" label={`Réviser la page (${savedCount})`} onPress={onReview} />
          <MenuRow symbol="brain.head.profile" label={`Révision (${savedCount})`} onPress={onReview} />
          <MenuRow symbol="character.book.closed.fill" label={`Vocabulaire (${savedCount})`} onPress={onVocabulary} />
          <MenuRow symbol="bookmark" label="Ajouter à la liste de lecture" onPress={onPlaylist} />
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function MenuRow({ symbol, label, onPress }: { symbol: string; label: string; onPress(): void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
      <SymbolView name={symbol as never} tintColor={productTheme.ink} size={21} />
      <Text style={styles.menuRowText}>{label}</Text>
      <SymbolView name="chevron.right" tintColor={productTheme.muted} size={15} />
    </Pressable>
  );
}

function SentenceModeCard({
  sentences,
  sentenceIdx,
  savedTerms,
  fontSize,
  translation,
  translating,
  onTokenPress,
  onPrev,
  onNext,
  onTranslate,
  canPrev,
  canNext,
  isLast,
  insets,
}: {
  sentences: import('@yapro/core').SplitSentence[];
  sentenceIdx: number;
  savedTerms: Map<string, { status: number; translation?: string }>;
  fontSize: number;
  translation?: string;
  translating: boolean;
  onTokenPress: (token: ReaderToken) => void;
  onPrev: () => void;
  onNext: () => void;
  onTranslate: () => void;
  canPrev: boolean;
  canNext: boolean;
  isLast: boolean;
  insets: { bottom: number };
}) {
  const sentence = sentences[sentenceIdx];
  if (!sentence) return null;
  const tokens = tokenizeLesson(sentence.text);
  const trKey = translation !== undefined;

  return (
    <View style={styles.sentenceMode}>
      {/* Counter + dots */}
      <View style={styles.sentenceCounter}>
        <Text style={styles.sentenceCounterText}>{sentenceIdx + 1} / {sentences.length}</Text>
        <View style={styles.sentenceDots}>
          {sentences.slice(0, Math.min(sentences.length, 12)).map((_, i) => (
            <View key={i} style={[styles.sentenceDot, i === sentenceIdx && styles.sentenceDotActive]} />
          ))}
        </View>
      </View>

      {/* Sentence card */}
      <View style={styles.sentenceCard}>
        <Text style={[styles.readerText, { fontSize, lineHeight: Math.round(fontSize * 1.94), textAlign: 'center' }]}>
          {tokens.map((token) => {
            const saved = savedTerms.get(token.normalized);
            const isClickable = Boolean(token.normalized) && !/^[^a-zA-Z]+$/.test(token.raw);
            return (
              <Text key={token.id}>
                {token.leadingSpace ? ' ' : ''}
                <Text
                  accessibilityRole={isClickable ? 'button' : undefined}
                  onPress={isClickable ? () => onTokenPress(token) : undefined}
                  style={!isClickable ? undefined : [
                    styles.word,
                    saved?.status === 4 ? styles.wordKnown : saved ? styles.wordSaved : styles.wordNew,
                  ]}>
                  {token.raw}
                </Text>
              </Text>
            );
          })}
        </Text>
        {trKey && (
          <Text style={styles.sentenceTranslation}>"{translation}"</Text>
        )}
      </View>

      {/* Nav buttons */}
      <View style={[styles.sentenceNavRow, { paddingBottom: Math.max(12, insets.bottom) + 140 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Phrase précédente"
          disabled={!canPrev}
          onPress={onPrev}
          style={[styles.sentenceNavButton, !canPrev && styles.sentenceNavDisabled]}>
          <SymbolView name="chevron.left" tintColor={canPrev ? productTheme.blue : productTheme.mutedLight} size={16} />
          <Text style={[styles.sentenceNavText, !canPrev && styles.sentenceNavTextDim]}>Précédent</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={trKey ? 'Masquer la traduction' : translating ? 'Traduction en cours' : 'Traduire'}
          onPress={onTranslate}
          style={styles.sentenceTranslateButton}>
          <SymbolView name="globe" tintColor={productTheme.inkSoft} size={15} />
          <Text style={styles.sentenceNavText}>{trKey ? 'Masquer' : translating ? '…' : 'Traduire'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLast ? 'Terminer la leçon' : 'Phrase suivante'}
          onPress={onNext}
          style={styles.sentenceNextButton}>
          <Text style={styles.sentenceNextText}>{isLast ? 'Terminer' : 'Suivant'}</Text>
          <SymbolView name={isLast ? 'checkmark' : 'chevron.right'} tintColor="#FFFFFF" size={14} />
        </Pressable>
      </View>
    </View>
  );
}

function tokenizeLesson(content: string): ReaderToken[] {
  const sentences = content.match(/[^.!?]+[.!?]*/g) ?? [content];
  const result: ReaderToken[] = [];
  sentences.forEach((sentence, sentenceIndex) => {
    const words = sentence.trim().match(/[A-Za-z]+(?:['’][A-Za-z]+)?|[0-9]+|[^\sA-Za-z0-9]/g) ?? [];
    words.forEach((raw, wordIndex) => {
      result.push({
        id: `${sentenceIndex}-${wordIndex}`,
        raw,
        normalized: normalizeWord(raw),
        context: sentence.trim(),
        leadingSpace: result.length > 0 && !/^[.,!?;:)]$/.test(raw),
      });
    });
  });
  return result;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.surface,
  },
  notFound: {
    flex: 1,
    padding: 28,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundTitle: {
    marginTop: 16,
    fontSize: 24,
    fontWeight: '900',
    color: productTheme.ink,
  },
  notFoundCopy: {
    marginTop: 8,
    color: productTheme.muted,
    textAlign: 'center',
  },
  notFoundButton: {
    minHeight: 48,
    marginTop: 22,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: productTheme.green,
    justifyContent: 'center',
  },
  notFoundButtonText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  topBar: {
    minHeight: 52,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topProgress: {
    height: 4,
    flex: 1,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#BEC3C9',
  },
  topProgressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: productTheme.green,
  },
  lessonHeader: {
    minHeight: 76,
    paddingHorizontal: 17,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  lessonImage: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: productTheme.ink,
  },
  lessonHeaderCopy: {
    minWidth: 0,
    flex: 1,
  },
  lessonTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.ink,
  },
  lessonCollection: {
    marginTop: 4,
    fontSize: 11,
    color: productTheme.muted,
  },
  reader: {
    paddingHorizontal: 18,
    paddingTop: 5,
  },
  readerText: {
    fontSize: 18,
    lineHeight: 35,
    fontWeight: '500',
    color: productTheme.ink,
  },
  word: {
    borderRadius: 4,
  },
  wordNew: {
    backgroundColor: '#CDE8F6',
  },
  wordSaved: {
    backgroundColor: '#BFE2C8',
    color: '#164F2A',
  },
  wordKnown: {
    backgroundColor: 'transparent',
  },
  wordKaraoke: {
    backgroundColor: '#FFDD57',
    color: '#1a1000',
    borderRadius: 3,
  },
  finishButton: {
    minHeight: 48,
    marginTop: 32,
    borderWidth: 1,
    borderColor: productTheme.green,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishText: {
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.greenDark,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 17,
    paddingBottom: 6,
  },
  statBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#CDE8F6',
  },
  statBadgeSaved: {
    backgroundColor: '#BFE2C8',
  },
  statBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#1A5F8A',
  },
  statBadgeTextSaved: {
    color: '#164F2A',
  },
  pageIndicator: {
    marginLeft: 4,
    fontSize: 11,
    color: productTheme.muted,
  },
  readerFooter: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 12,
    paddingTop: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: productTheme.line,
    backgroundColor: 'rgba(255,255,255,.97)',
    flexDirection: 'column',
    gap: 6,
  },
  pageNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pageNavButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pageNavDisabled: {
    opacity: 0.4,
  },
  pageNavLabel: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: productTheme.ink,
  },
  footerActions: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  playButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonActive: {
    backgroundColor: productTheme.green,
  },
  phraseButton: {
    minHeight: 44,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  phraseButtonActive: {
    backgroundColor: productTheme.background,
  },
  phraseText: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.inkSoft,
  },
  reviewButton: {
    minWidth: 58,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: productTheme.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  reviewCount: {
    fontSize: 13,
    fontWeight: '800',
    color: productTheme.inkSoft,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,.45)',
  },
  wordSheet: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: productTheme.surface,
  },
  sheetHandle: {
    width: 42,
    height: 5,
    alignSelf: 'center',
    borderRadius: 4,
    backgroundColor: '#D1D4D8',
  },
  wordHeader: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedWord: {
    fontSize: 29,
    fontWeight: '900',
    color: productTheme.ink,
  },
  wordLanguage: {
    marginTop: 3,
    fontSize: 12,
    color: productTheme.muted,
  },
  speakButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: productTheme.bluePale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetLabel: {
    marginTop: 23,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: productTheme.muted,
  },
  translationInput: {
    minHeight: 52,
    marginTop: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: productTheme.blue,
    borderRadius: 9,
    backgroundColor: productTheme.surface,
    fontSize: 18,
    fontWeight: '700',
    color: productTheme.ink,
  },
  translationLoading: {
    minHeight: 42,
    marginTop: 8,
    paddingHorizontal: 12,
    borderRadius: 9,
    backgroundColor: productTheme.bluePale,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  translationLoadingText: {
    minWidth: 0,
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: productTheme.inkSoft,
  },
  translationError: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 17,
    color: productTheme.red,
  },
  context: {
    marginTop: 14,
    padding: 13,
    borderRadius: 10,
    backgroundColor: productTheme.background,
    fontSize: 13,
    lineHeight: 19,
    color: productTheme.inkSoft,
  },
  statusRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 9,
  },
  statusButton: {
    width: 38,
    height: 38,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusButtonActive: {
    borderColor: productTheme.green,
    backgroundColor: productTheme.greenPale,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    color: productTheme.muted,
  },
  statusTextActive: {
    color: productTheme.greenDark,
  },
  saveButton: {
    minHeight: 52,
    marginTop: 16,
    borderRadius: 9,
    backgroundColor: productTheme.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#AFCAB6',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  phraseSheet: {
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: productTheme.surface,
  },
  phraseTitleRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  phraseTitleCopy: {
    minWidth: 0,
    flex: 1,
  },
  phraseTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: productTheme.ink,
  },
  phraseAudioActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slowSpeechButton: {
    minWidth: 48,
    height: 46,
    paddingHorizontal: 8,
    borderRadius: 23,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slowSpeechText: {
    fontSize: 12,
    fontWeight: '900',
    color: productTheme.inkSoft,
  },
  phraseSourceCard: {
    marginTop: 18,
    padding: 15,
    borderRadius: 12,
    backgroundColor: productTheme.background,
  },
  phraseSource: {
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '700',
    color: productTheme.ink,
  },
  phraseTranslationCard: {
    minHeight: 72,
    marginTop: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: productTheme.green,
    borderRadius: 12,
    backgroundColor: productTheme.greenPale,
    justifyContent: 'center',
  },
  phraseTranslation: {
    fontSize: 16,
    lineHeight: 23,
    color: productTheme.inkSoft,
  },
  phraseDoneButton: {
    flex: 1,
    minHeight: 52,
    marginTop: 16,
    borderRadius: 9,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phraseDoneText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  phraseNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  phraseNavButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: productTheme.surface,
  },
  phraseNavDisabled: {
    opacity: 0.35,
  },
  menuSheet: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 15,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    backgroundColor: productTheme.surface,
  },
  menuTitle: {
    marginBottom: 10,
    fontSize: 21,
    fontWeight: '900',
    color: productTheme.ink,
  },
  menuRow: {
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.lineSoft,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  menuRowText: {
    minWidth: 0,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: productTheme.ink,
  },
  pressed: {
    opacity: 0.67,
  },
  modeSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 20,
    backgroundColor: productTheme.background,
    padding: 2,
    gap: 1,
  },
  modeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  modeButtonActive: {
    backgroundColor: productTheme.ink,
  },
  topButtonActive: {
    backgroundColor: productTheme.background,
  },
  fontToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    minHeight: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    backgroundColor: productTheme.background,
  },
  fontToolbarLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.inkSoft,
  },
  fontStepButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: productTheme.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: productTheme.surface,
  },
  fontStepText: {
    fontSize: 20,
    fontWeight: '300',
    color: productTheme.ink,
    lineHeight: 24,
  },
  fontSizeValue: {
    width: 28,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.ink,
  },
  sentenceMode: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 10,
  },
  sentenceCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sentenceCounterText: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.muted,
  },
  sentenceDots: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    maxWidth: 180,
    justifyContent: 'flex-end',
  },
  sentenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: productTheme.line,
  },
  sentenceDotActive: {
    backgroundColor: productTheme.ink,
  },
  sentenceCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: productTheme.line,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
  },
  sentenceTranslation: {
    marginTop: 14,
    fontSize: 15,
    lineHeight: 21,
    color: productTheme.inkSoft,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sentenceNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  sentenceNavButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  sentenceNavDisabled: {
    opacity: 0.35,
  },
  sentenceNavText: {
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.inkSoft,
  },
  sentenceNavTextDim: {
    color: productTheme.mutedLight,
  },
  sentenceTranslateButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: productTheme.background,
  },
  sentenceNextButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: productTheme.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  sentenceNextText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

const STATUS_COLORS: Record<number, { bg: string; text: string } | null> = {
  1: { bg: '#ffe08a', text: '#4a3200' },
  2: { bg: '#ffe9a8', text: '#4a3200' },
  3: { bg: '#fff2c8', text: '#4a3200' },
  4: null,
};

const STATUS_LABELS: Record<number, string> = {
  1: 'Niv. 1',
  2: 'Niv. 2',
  3: 'Niv. 3',
  4: 'Connu',
};

function VocabPanel({
  lessonId,
  pageLemmas,
  vocabulary,
  onClose,
  onWordPress,
}: {
  lessonId: string;
  pageLemmas: Set<string>;
  vocabulary: ReturnType<typeof useProduct>['vocabulary'];
  onClose: () => void;
  onWordPress: (norm: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const onPage = vocabulary.filter(
    (w) => pageLemmas.has(w.normalizedTerm) && w.lessonId === lessonId,
  );
  const elsewhere = vocabulary.filter(
    (w) => !pageLemmas.has(w.normalizedTerm) && w.lessonId === lessonId,
  );

  const renderEntry = (item: (typeof vocabulary)[number]) => {
    const paint = STATUS_COLORS[item.status] ?? null;
    return (
      <Pressable
        key={item.id}
        accessibilityRole="button"
        onPress={() => onWordPress(item.normalizedTerm)}
        style={({ pressed }) => [vStyles.row, pressed && { opacity: 0.6 }]}>
        <View style={[vStyles.badge, paint ? { backgroundColor: paint.bg } : vStyles.badgeKnown]}>
          <Text style={[vStyles.badgeTerm, paint ? { color: paint.text } : vStyles.badgeTermKnown]}>
            {item.term}
          </Text>
        </View>
        <Text style={vStyles.translation} numberOfLines={1}>{item.translation}</Text>
        <Text style={vStyles.statusLabel}>{STATUS_LABELS[item.status] ?? ''}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={vStyles.sheet} edges={['top']}>
      <View style={vStyles.header}>
        <Text style={vStyles.title}>
          Vocabulaire ({onPage.length + elsewhere.length})
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer le vocabulaire"
          onPress={onClose}
          style={vStyles.closeButton}>
          <SymbolView name="xmark" tintColor={productTheme.ink} size={17} />
        </Pressable>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}>
        {onPage.length > 0 && (
          <>
            <Text style={vStyles.groupLabel}>Page actuelle · {onPage.length}</Text>
            {onPage.map(renderEntry)}
          </>
        )}
        {elsewhere.length > 0 && (
          <>
            <Text style={vStyles.groupLabel}>Leçon · {elsewhere.length}</Text>
            {elsewhere.map(renderEntry)}
          </>
        )}
        {onPage.length + elsewhere.length === 0 && (
          <View style={vStyles.empty}>
            <SymbolView name="bookmark" tintColor={productTheme.muted} size={32} />
            <Text style={vStyles.emptyText}>Aucun mot sauvegardé dans cette leçon.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const vStyles = StyleSheet.create({
  sheet: { flex: 1, backgroundColor: productTheme.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: { fontSize: 16, fontWeight: '800', color: productTheme.ink },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupLabel: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: productTheme.muted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeKnown: { backgroundColor: productTheme.background },
  badgeTerm: { fontSize: 14, fontWeight: '600' },
  badgeTermKnown: { color: productTheme.inkSoft },
  translation: { flex: 1, fontSize: 14, color: productTheme.inkSoft },
  statusLabel: { fontSize: 12, color: productTheme.muted },
  empty: { alignItems: 'center', gap: 12, paddingVertical: 64 },
  emptyText: { fontSize: 14, color: productTheme.muted, textAlign: 'center' },
});
