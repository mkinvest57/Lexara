import { router } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabs } from '@/components/bottom-tabs';
import { formatDuration } from '@/lib/catalog';
import { getLessonCover } from '@/lib/lesson-covers';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

export default function PlaylistScreen() {
  const product = useProduct();
  const lessons = product.playlistIds
    .map((id) => product.lessons.find((lesson) => lesson.id === id))
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Liste de lecture</Text>
          <Text style={styles.subtitle}>{lessons.length} leçons enregistrées</Text>
        </View>
        <Pressable
          accessibilityLabel="Chercher une leçon"
          onPress={() => router.push('/library')}
          style={styles.headerButton}>
          <SymbolView name="plus" tintColor={productTheme.ink} size={21} />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {lessons.length ? (
          <>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Démarrer la liste de lecture"
              onPress={() =>
                router.push({ pathname: '/lesson/[id]', params: { id: lessons[0]!.id } })
              }
              style={styles.startButton}>
              <SymbolView name="play.fill" tintColor="#FFFFFF" size={16} />
              <Text style={styles.startText}>Démarrer</Text>
            </Pressable>
            <View style={styles.list}>
              {lessons.map((lesson, index) =>
                lesson ? (
                  <Pressable
                    key={lesson.id}
                    onPress={() =>
                      router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })
                    }
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
                    <Text style={styles.order}>{index + 1}</Text>
                    <Image
                      source={getLessonCover(lesson.id)}
                      contentFit="cover"
                      contentPosition={lesson.imagePosition as never}
                      style={styles.image}
                    />
                    <View style={styles.rowCopy}>
                      <Text numberOfLines={2} style={styles.rowTitle}>{lesson.title}</Text>
                      <Text style={styles.rowMeta}>
                        {lesson.level} · {formatDuration(lesson.durationSeconds)}
                      </Text>
                    </View>
                    <Pressable
                      accessibilityLabel={`Retirer ${lesson.title} de la liste`}
                      onPress={() => product.togglePlaylist(lesson.id)}
                      style={styles.removeButton}>
                      <SymbolView name="xmark.circle.fill" tintColor={productTheme.mutedLight} size={21} />
                    </Pressable>
                  </Pressable>
                ) : null,
              )}
            </View>
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <SymbolView name="list.bullet.rectangle" tintColor="#C8CDD4" size={50} />
            </View>
            <Text style={styles.emptyTitle}>Votre liste de lecture est vide</Text>
            <Text style={styles.emptyCopy}>
              Ajoutez une leçon depuis la bibliothèque, puis lancez votre session ici.
            </Text>
            <Pressable onPress={() => router.push('/')} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Explorer la bibliothèque</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      <BottomTabs active="playlist" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.surface,
  },
  header: {
    minHeight: 82,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    color: productTheme.ink,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: productTheme.muted,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 116,
  },
  startButton: {
    width: 132,
    minHeight: 46,
    borderRadius: 8,
    backgroundColor: productTheme.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  startText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  list: {
    marginTop: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: productTheme.lineSoft,
    borderRadius: 16,
  },
  row: {
    minHeight: 104,
    padding: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  order: {
    width: 20,
    fontSize: 12,
    fontWeight: '800',
    color: productTheme.muted,
    textAlign: 'center',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: productTheme.ink,
  },
  rowCopy: {
    minWidth: 0,
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '800',
    color: productTheme.ink,
  },
  rowMeta: {
    marginTop: 7,
    fontSize: 11,
    color: productTheme.muted,
  },
  removeButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    marginTop: 100,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 120,
    height: 100,
    borderRadius: 30,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 22,
    fontSize: 22,
    fontWeight: '900',
    color: productTheme.ink,
  },
  emptyCopy: {
    marginTop: 8,
    maxWidth: 310,
    fontSize: 14,
    lineHeight: 21,
    color: productTheme.muted,
    textAlign: 'center',
  },
  emptyButton: {
    minHeight: 48,
    marginTop: 22,
    paddingHorizontal: 18,
    borderRadius: 9,
    backgroundColor: productTheme.green,
    justifyContent: 'center',
  },
  emptyButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.68,
  },
});
