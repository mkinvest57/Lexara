import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { formatDuration, getWordCount } from '@/lib/catalog';
import { getLessonCover } from '@/lib/lesson-covers';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

export default function LessonCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const product = useProduct();
  const lesson = product.lessons.find((item) => item.id === id);
  const lessonIndex = product.lessons.findIndex((item) => item.id === id);
  const nextLesson = product.lessons[(lessonIndex + 1) % product.lessons.length];
  const lessonWords = product.vocabulary.filter((item) => item.lessonId === id);
  const knownLessonWords = lessonWords.filter((item) => item.status === 4).length;
  const progress = lesson ? product.progress[lesson.id] : undefined;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.screen} edges={['top']}>
        <View style={styles.missingState}>
          <SymbolView
            name="exclamationmark.triangle.fill"
            tintColor={productTheme.orange}
            size={38}
          />
          <Text style={styles.missingTitle}>Leçon introuvable</Text>
          <Text style={styles.missingCopy}>
            Cette leçon n’est plus disponible dans votre bibliothèque.
          </Text>
          <Pressable onPress={() => router.replace('/')} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Retour à la bibliothèque</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retour"
          onPress={() => router.replace('/')}
          style={styles.headerButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Leçon terminée</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quitter"
          onPress={() => router.replace('/')}
          style={styles.quitButton}>
          <Text style={styles.quitText}>Quitter</Text>
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.successRow}>
          <View style={styles.successIcon}>
            <SymbolView name="checkmark" tintColor="#FFFFFF" size={18} />
          </View>
          <Text style={styles.successTitle}>Leçon Terminée !</Text>
        </View>
        <Image
          source={getLessonCover(lesson.id)}
          contentFit="cover"
          contentPosition={lesson.imagePosition as never}
          style={styles.hero}
        />
        <Text style={styles.lessonTitle}>{lesson.title}</Text>
        <Text style={styles.collection}>{lesson.collection}</Text>

        {lessonWords.length ? (
          <View style={styles.milestone}>
            <View style={styles.milestoneBadge}>
              <Text style={styles.milestoneValue}>{lessonWords.length}</Text>
            </View>
            <View style={styles.milestoneCopy}>
              <Text style={styles.milestoneTitle}>Félicitations !</Text>
              <Text style={styles.milestoneText}>
                Vous avez créé {lessonWords.length} {lessonWords.length > 1 ? 'mots utiles' : 'mot utile'}.
              </Text>
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Stats Leçon</Text>
        <View style={styles.statsGrid}>
          <Metric
            symbol="bookmark.fill"
            color={productTheme.blue}
            label="Mots enregistrés"
            value={String(lessonWords.length)}
          />
          <Metric
            symbol="character.book.closed.fill"
            color="#6B9FD9"
            label="Mots connus"
            value={String(knownLessonWords)}
          />
          <Metric
            symbol="hourglass"
            color={productTheme.red}
            label="Temps d'étude"
            value={`${Math.max(1, Math.round((progress?.secondsSpent ?? 0) / 60))}m`}
          />
          <Metric
            symbol="speedometer"
            color={productTheme.orange}
            label="Vitesse de lecture"
            value={`${Math.max(80, Math.round(getWordCount(lesson.content) / Math.max(1, (progress?.secondsSpent ?? 30) / 60)))}wpm`}
          />
          <Metric
            symbol="waveform"
            color="#497AD0"
            label="Écouté"
            value={formatDuration(progress?.listenedSeconds ?? 0)}
          />
          <Metric
            symbol="infinity"
            color="#4EAE70"
            label="Lu"
            value={`${progress?.wordsRead ?? 0}w`}
          />
        </View>

        <View style={styles.rewardCard}>
          <View style={styles.coin}>
            <SymbolView name="lightbulb.fill" tintColor={productTheme.greenDark} size={20} />
          </View>
          <View>
            <Text style={styles.rewardValue}>+{25 + lessonWords.length} Pièces</Text>
            <Text style={styles.rewardCopy}>{product.coins} pièces au total</Text>
          </View>
        </View>

        {nextLesson ? (
          <View style={styles.nextSection}>
            <Text style={styles.sectionTitle}>Suivant</Text>
            <Text style={styles.nextCopy}>Gardez l’élan !</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Ouvrir la leçon suivante : ${nextLesson.title}`}
              onPress={() =>
                router.replace({ pathname: '/lesson/[id]', params: { id: nextLesson.id } })
              }
              style={({ pressed }) => [styles.nextCard, pressed && styles.pressed]}>
              <Image
                source={getLessonCover(nextLesson.id)}
                contentFit="cover"
                contentPosition={nextLesson.imagePosition as never}
                style={styles.nextImage}
              />
              <View style={styles.nextCardCopy}>
                <Text numberOfLines={2} style={styles.nextTitle}>{nextLesson.title}</Text>
                <Text style={styles.nextMeta}>{nextLesson.level} · {formatDuration(nextLesson.durationSeconds)}</Text>
              </View>
              <SymbolView name="chevron.right" tintColor={productTheme.muted} size={18} />
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        {nextLesson ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Commencer la leçon suivante"
            onPress={() =>
              router.replace({ pathname: '/lesson/[id]', params: { id: nextLesson.id } })
            }
            style={[styles.primaryButton, { flex: 1 }]}>
            <Text style={styles.primaryText}>Leçon suivante</Text>
            <SymbolView name="chevron.right" tintColor="#FFFFFF" size={16} />
          </Pressable>
        ) : null}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Réviser le vocabulaire"
          onPress={() => router.push({ pathname: '/review', params: { lessonId: lesson.id } })}
          style={[styles.secondaryButton, { flex: 1 }]}>
          <SymbolView name="rectangle.stack.fill" tintColor={productTheme.greenDark} size={16} />
          <Text style={styles.secondaryText}>Réviser le vocabulaire</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Metric({
  symbol,
  color,
  label,
  value,
}: {
  symbol: string;
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <View style={[styles.metricIcon, { backgroundColor: `${color}18` }]}>
        <SymbolView name={symbol as never} tintColor={color} size={18} />
      </View>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  missingState: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
  },
  missingTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: productTheme.ink,
  },
  missingCopy: {
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 15,
    lineHeight: 22,
    color: productTheme.muted,
  },
  header: {
    minHeight: 60,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: productTheme.ink,
  },
  quitButton: {
    minWidth: 64,
    height: 38,
    borderRadius: 19,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quitText: {
    fontSize: 13,
    fontWeight: '800',
    color: productTheme.ink,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 118,
  },
  successRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  successIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: productTheme.ink,
  },
  hero: {
    height: 210,
    marginTop: 18,
    borderRadius: 15,
    backgroundColor: productTheme.ink,
  },
  lessonTitle: {
    marginTop: 13,
    fontSize: 20,
    fontWeight: '900',
    color: productTheme.ink,
  },
  collection: {
    marginTop: 4,
    fontSize: 12,
    color: productTheme.muted,
  },
  milestone: {
    marginTop: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F0E3B7',
    borderRadius: 12,
    backgroundColor: '#FFFBEF',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  milestoneBadge: {
    width: 39,
    height: 45,
    borderRadius: 8,
    backgroundColor: productTheme.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  milestoneValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  milestoneCopy: {
    minWidth: 0,
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: productTheme.ink,
  },
  milestoneText: {
    marginTop: 3,
    fontSize: 13,
    color: productTheme.inkSoft,
  },
  sectionTitle: {
    marginTop: 25,
    fontSize: 21,
    fontWeight: '900',
    color: productTheme.ink,
  },
  statsGrid: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },
  metric: {
    width: '31.6%',
    minHeight: 116,
    padding: 12,
    borderRadius: 13,
    backgroundColor: productTheme.surface,
  },
  metricIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    marginTop: 9,
    fontSize: 10,
    lineHeight: 13,
    color: productTheme.muted,
  },
  metricValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: '900',
    color: productTheme.ink,
  },
  rewardCard: {
    marginTop: 17,
    padding: 17,
    borderRadius: 13,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  coin: {
    width: 44,
    height: 44,
    borderWidth: 3,
    borderColor: '#A4CF4E',
    borderRadius: 22,
    backgroundColor: '#DDF16C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewardValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#E6A724',
  },
  rewardCopy: {
    marginTop: 3,
    fontSize: 11,
    color: productTheme.muted,
  },
  nextSection: {
    marginTop: 2,
  },
  nextCopy: {
    marginTop: 4,
    fontSize: 13,
    color: productTheme.muted,
  },
  nextCard: {
    minHeight: 104,
    marginTop: 12,
    padding: 10,
    borderRadius: 14,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  nextImage: {
    width: 82,
    height: 82,
    borderRadius: 11,
    backgroundColor: productTheme.ink,
  },
  nextCardCopy: {
    minWidth: 0,
    flex: 1,
  },
  nextTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: productTheme.ink,
  },
  nextMeta: {
    marginTop: 6,
    fontSize: 11,
    color: productTheme.muted,
  },
  footer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    padding: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: productTheme.line,
    backgroundColor: 'rgba(255,255,255,.97)',
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 9,
    backgroundColor: productTheme.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: productTheme.line,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryText: {
    fontSize: 13,
    fontWeight: '800',
    color: productTheme.ink,
  },
  pressed: {
    opacity: 0.68,
  },
});
