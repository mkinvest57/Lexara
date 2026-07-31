import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getWordCount } from '@/lib/catalog';
import { getLessonCover } from '@/lib/lesson-covers';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

const filters = ['Tout', 'Débutant 1', 'Débutant 2', 'Intermédiaire', 'Avancé'] as const;

export default function SearchLibraryScreen() {
  const product = useProduct();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<(typeof filters)[number]>('Tout');

  const lessons = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return product.lessons.filter((lesson) => {
      const matchesQuery =
        !normalizedQuery ||
        lesson.title.toLocaleLowerCase().includes(normalizedQuery) ||
        lesson.collection.toLocaleLowerCase().includes(normalizedQuery);
      const matchesFilter = filter === 'Tout' || lesson.level === filter;
      return matchesQuery && matchesFilter;
    });
  }, [filter, product.lessons, query]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable
          accessibilityLabel="Fermer la recherche"
          onPress={router.back}
          style={styles.iconButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Bibliothèque</Text>
        <Pressable
          accessibilityLabel="Importer une leçon"
          onPress={() => router.push('/import')}
          style={styles.addButton}>
          <SymbolView name="plus" tintColor="#FFFFFF" size={21} />
        </Pressable>
      </View>
      <View style={styles.search}>
        <SymbolView name="magnifyingglass" tintColor={productTheme.muted} size={19} />
        <TextInput
          autoFocus
          accessibilityLabel="Rechercher dans la bibliothèque"
          placeholder="Rechercher des leçons"
          placeholderTextColor={productTheme.mutedLight}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
        {query ? (
          <Pressable accessibilityLabel="Effacer la recherche" onPress={() => setQuery('')}>
            <SymbolView name="xmark.circle.fill" tintColor={productTheme.mutedLight} size={19} />
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}>
        {filters.map((item) => (
          <Pressable
            key={item}
            accessibilityState={{ selected: filter === item }}
            onPress={() => setFilter(item)}
            style={[styles.filter, filter === item && styles.filterActive]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Text style={styles.resultCount}>{lessons.length} leçons</Text>
        {lessons.length ? (
          <View style={styles.results}>
            {lessons.map((lesson) => (
              <Pressable
                key={lesson.id}
                accessibilityRole="button"
                accessibilityLabel={`Ouvrir ${lesson.title}`}
                onPress={() =>
                  router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })
                }
                style={({ pressed }) => [styles.result, pressed && styles.pressed]}>
                <Image
                  source={getLessonCover(lesson.id)}
                  contentFit="cover"
                  contentPosition={lesson.imagePosition as never}
                  style={styles.resultImage}
                />
                <View style={styles.resultCopy}>
                  <Text numberOfLines={2} style={styles.resultTitle}>{lesson.title}</Text>
                  <Text numberOfLines={1} style={styles.resultCollection}>{lesson.collection}</Text>
                  <Text style={styles.resultMeta}>
                    {lesson.level} · {getWordCount(lesson.content)} mots
                  </Text>
                </View>
                <Pressable
                  accessibilityLabel={
                    product.playlistIds.includes(lesson.id)
                      ? 'Retirer de la liste de lecture'
                      : 'Ajouter à la liste de lecture'
                  }
                  onPress={(event) => {
                    event.stopPropagation();
                    product.togglePlaylist(lesson.id);
                  }}
                  style={styles.bookmarkButton}>
                  <SymbolView
                    name={product.playlistIds.includes(lesson.id) ? 'bookmark.fill' : 'bookmark'}
                    tintColor={
                      product.playlistIds.includes(lesson.id)
                        ? productTheme.green
                        : productTheme.muted
                    }
                    size={20}
                  />
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <SymbolView name="books.vertical" tintColor={productTheme.blue} size={38} />
            <Text style={styles.emptyTitle}>Aucune leçon trouvée</Text>
            <Text style={styles.emptyCopy}>
              Ajustez la recherche ou importez un texte qui vous intéresse.
            </Text>
            <Pressable onPress={() => router.push('/import')} style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Importer une leçon</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 14,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: productTheme.ink,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    minHeight: 50,
    marginHorizontal: 16,
    marginTop: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 13,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: {
    minWidth: 0,
    flex: 1,
    fontSize: 16,
    color: productTheme.ink,
  },
  filters: {
    minHeight: 58,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  filter: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 18,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {
    borderColor: productTheme.ink,
    backgroundColor: productTheme.ink,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.inkSoft,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 38,
  },
  resultCount: {
    marginVertical: 9,
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.muted,
  },
  results: {
    gap: 10,
  },
  result: {
    minHeight: 112,
    padding: 10,
    borderRadius: 17,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  resultImage: {
    width: 92,
    height: 92,
    borderRadius: 13,
    backgroundColor: productTheme.ink,
  },
  resultCopy: {
    minWidth: 0,
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    color: productTheme.ink,
  },
  resultCollection: {
    marginTop: 5,
    fontSize: 12,
    color: productTheme.muted,
  },
  resultMeta: {
    marginTop: 7,
    fontSize: 11,
    fontWeight: '700',
    color: productTheme.greenDark,
  },
  bookmarkButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    marginTop: 60,
    padding: 28,
    borderRadius: 20,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: '800',
    color: productTheme.ink,
  },
  emptyCopy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    color: productTheme.muted,
    textAlign: 'center',
  },
  emptyButton: {
    minHeight: 46,
    marginTop: 20,
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
