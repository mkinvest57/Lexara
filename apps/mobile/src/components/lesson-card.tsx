import { ImageBackground } from 'expo-image';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { formatDuration, getWordCount, type Lesson } from '@/lib/catalog';
import { getLessonCover } from '@/lib/lesson-covers';
import { productTheme } from '@/constants/product-theme';

type LessonCardProps = {
  lesson: Lesson;
  savedWords: number;
  knownWords: number;
  progress?: number;
  onPress(): void;
  onTogglePlaylist(): void;
  inPlaylist: boolean;
  compact?: boolean;
};

export function LessonCard({
  lesson,
  savedWords,
  knownWords,
  progress = 0,
  onPress,
  onTogglePlaylist,
  inPlaylist,
  compact = false,
}: LessonCardProps) {
  const totalWords = getWordCount(lesson.content);

  return (
    <View style={[styles.wrapper, compact && styles.wrapperCompact]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Ouvrir ${lesson.title}`}
        onPress={onPress}
        style={({ pressed }) => [styles.card, compact && styles.cardCompact, pressed && styles.pressed]}>
        <ImageBackground
          source={getLessonCover(lesson.id)}
          style={styles.cover}
          contentFit="cover"
          contentPosition={lesson.imagePosition as never}>
          <View style={styles.scrim} />
          <View style={styles.counts}>
            <CountPill color={productTheme.blue} value={Math.max(0, totalWords - savedWords - knownWords)} />
            <CountPill color="#56A86B" value={savedWords} />
            <CountPill color="#E6E8EC" value={knownWords} />
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{lesson.level.replace('Débutant ', '')}</Text>
          </View>
          {progress > 0 ? (
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${Math.max(4, progress * 100)}%` }]} />
            </View>
          ) : null}
        </ImageBackground>
      </Pressable>
      <View style={styles.titleRow}>
        <Pressable onPress={onPress} style={styles.titleButton}>
          <Text numberOfLines={1} style={styles.title}>{lesson.title}</Text>
          <Text numberOfLines={1} style={styles.collection}>{lesson.collection}</Text>
          <View style={styles.durationRow}>
            <SymbolView name="headphones" tintColor={productTheme.muted} size={14} />
            <Text style={styles.duration}>{formatDuration(lesson.durationSeconds)}</Text>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={inPlaylist ? 'Retirer de la liste de lecture' : 'Ajouter à la liste de lecture'}
          onPress={onTogglePlaylist}
          style={({ pressed }) => [styles.moreButton, pressed && styles.pressed]}>
          <SymbolView
            name={inPlaylist ? 'bookmark.fill' : 'ellipsis'}
            tintColor={inPlaylist ? productTheme.green : productTheme.ink}
            size={19}
          />
        </Pressable>
      </View>
    </View>
  );
}

function CountPill({ color, value }: { color: string; value: number }) {
  return (
    <View style={styles.countRow}>
      <View style={[styles.countSwatch, { backgroundColor: color }]} />
      <Text style={styles.countText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: 314,
  },
  wrapperCompact: {
    width: 238,
  },
  card: {
    height: 178,
    overflow: 'hidden',
    borderRadius: 17,
    backgroundColor: productTheme.ink,
  },
  cardCompact: {
    height: 136,
  },
  cover: {
    flex: 1,
  },
  scrim: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(4,12,24,.34)',
  },
  counts: {
    position: 'absolute',
    left: 12,
    bottom: 13,
    gap: 5,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  countSwatch: {
    width: 24,
    height: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.9)',
    borderRadius: 8,
  },
  countText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0,0,0,.45)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  levelBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 62,
    height: 62,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,.65)',
    borderRadius: 31,
    backgroundColor: 'rgba(10,33,72,.82)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 22,
    fontWeight: '800',
    color: productTheme.yellow,
  },
  progressTrack: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: 4,
    backgroundColor: 'rgba(255,255,255,.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: productTheme.blue,
  },
  titleRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  titleButton: {
    minWidth: 0,
    flex: 1,
  },
  title: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    color: productTheme.ink,
  },
  collection: {
    marginTop: 4,
    fontSize: 12,
    color: productTheme.muted,
  },
  durationRow: {
    marginTop: 7,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  duration: {
    fontSize: 12,
    color: productTheme.muted,
  },
  moreButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
