import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabs } from '@/components/bottom-tabs';
import { LanguageHeader } from '@/components/language-header';
import { LessonCard } from '@/components/lesson-card';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

const sections = [
  { title: 'Mini-histoires', filter: 'Mini-histoire' },
  { title: 'Formations Guidées', filter: 'Cours' },
  { title: 'Populaire', filter: null },
] as const;

const miniStoryFilters = ['Tout', 'Américain', 'Britannique'] as const;

export default function LibraryHomeScreen() {
  const product = useProduct();
  const [miniStoryFilter, setMiniStoryFilter] =
    useState<(typeof miniStoryFilters)[number]>('Tout');
  const [search, setSearch] = useState('');

  const inProgress = useMemo(
    () =>
      product.lessons
        .filter((l) => (product.progress[l.id]?.progress ?? 0) > 0)
        .sort((a, b) => (product.progress[b.id]?.progress ?? 0) - (product.progress[a.id]?.progress ?? 0))
        .slice(0, 20),
    [product.lessons, product.progress],
  );

  const queued = useMemo(
    () => product.lessons.filter((l) => product.playlistIds.includes(l.id)).slice(0, 20),
    [product.lessons, product.playlistIds],
  );

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return product.lessons.filter((l) =>
      `${l.title} ${l.collection ?? ''} ${l.kind}`.toLowerCase().includes(q),
    );
  }, [product.lessons, search]);

  const searching = Boolean(search.trim());

  useEffect(() => {
    if (!product.onboardingCompleted) router.replace('/onboarding');
  }, [product.onboardingCompleted]);

  const savedByLesson = useMemo(() => {
    return product.vocabulary.reduce<Record<string, number>>((result, item) => {
      result[item.lessonId] = (result[item.lessonId] ?? 0) + (item.status < 4 ? 1 : 0);
      return result;
    }, {});
  }, [product.vocabulary]);

  if (!product.onboardingCompleted) return <View style={styles.screen} />;

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <LanguageHeader />
      <View style={styles.searchWrap}>
        <SymbolView name="magnifyingglass" tintColor={productTheme.muted} size={15} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher une leçon…"
          placeholderTextColor={productTheme.muted}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
          autoCorrect={false}
          accessibilityLabel="Rechercher une leçon"
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled>
        {searching ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {searchResults.length} résultat{searchResults.length !== 1 ? 's' : ''}
            </Text>
            {searchResults.length === 0 ? (
              <Text style={styles.emptySearch}>Aucune leçon ne correspond.</Text>
            ) : (
              <View style={styles.searchGrid}>
                {searchResults.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    savedWords={savedByLesson[lesson.id] ?? 0}
                    knownWords={product.vocabulary.filter(
                      (item) => item.lessonId === lesson.id && item.status === 4,
                    ).length}
                    progress={product.progress[lesson.id]?.progress}
                    inPlaylist={product.playlistIds.includes(lesson.id)}
                    onTogglePlaylist={() => product.togglePlaylist(lesson.id)}
                    onPress={() =>
                      router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })
                    }
                  />
                ))}
              </View>
            )}
          </View>
        ) : (
          <>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir les statistiques"
          onPress={() => router.push('/stats')}
          style={({ pressed }) => [styles.momentumCard, pressed && styles.pressed]}>
          <View style={styles.flameWrap}>
            <SymbolView name="flame.fill" tintColor={product.currentStreak ? '#EE742D' : '#B6BBC2'} size={25} />
          </View>
          <Text style={styles.momentumValue}>{product.currentStreak}</Text>
          <Text style={styles.momentumLabel}>Jours</Text>
          <View style={styles.coin}>
            <SymbolView name="lightbulb.fill" tintColor={productTheme.greenDark} size={17} />
          </View>
          <Text style={styles.momentumValue}>{product.coins}</Text>
          <Text style={styles.momentumLabel}>/ {product.profile.dailyWordGoal} Pièces</Text>
          <View style={styles.chevron}>
            <SymbolView name="chevron.right" tintColor={productTheme.muted} size={22} />
          </View>
        </Pressable>

        {product.vocabulary.length > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Lancer la session de révision rapide"
            onPress={() => router.push('/review')}
            style={({ pressed }) => [styles.quickReviewCard, pressed && styles.pressed]}>
            <View style={styles.quickReviewIcon}>
              <SymbolView name="sparkles" tintColor="#FFFFFF" size={22} />
            </View>
            <View style={styles.quickReviewCopy}>
              <Text style={styles.quickReviewTitle}>
                {product.vocabulary.filter((item) => item.status < 4).length > 0
                  ? `⚡ ${product.vocabulary.filter((item) => item.status < 4).length} mots à réviser aujourd'hui`
                  : `🎯 ${product.vocabulary.length} mots enregistrés dans votre vocabulaire`}
              </Text>
              <Text style={styles.quickReviewSubtitle}>
                Réviser rapidement avec l'algorithme FSRS
              </Text>
            </View>
            <View style={styles.quickReviewBadge}>
              <Text style={styles.quickReviewBadgeText}>Réviser</Text>
            </View>
          </Pressable>
        )}

        {inProgress.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continuer à étudier</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}>
              {inProgress.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  savedWords={savedByLesson[lesson.id] ?? 0}
                  knownWords={product.vocabulary.filter(
                    (item) => item.lessonId === lesson.id && item.status === 4,
                  ).length}
                  progress={product.progress[lesson.id]?.progress}
                  inPlaylist={product.playlistIds.includes(lesson.id)}
                  onTogglePlaylist={() => product.togglePlaylist(lesson.id)}
                  onPress={() =>
                    router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {queued.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Ma liste</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}>
              {queued.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  savedWords={savedByLesson[lesson.id] ?? 0}
                  knownWords={product.vocabulary.filter(
                    (item) => item.lessonId === lesson.id && item.status === 4,
                  ).length}
                  progress={product.progress[lesson.id]?.progress}
                  inPlaylist={product.playlistIds.includes(lesson.id)}
                  onTogglePlaylist={() => product.togglePlaylist(lesson.id)}
                  onPress={() =>
                    router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })
                  }
                />
              ))}
            </ScrollView>
          </View>
        )}

        {sections.map((section) => {
          let lessons = section.filter
            ? product.lessons.filter((lesson) => lesson.kind === section.filter)
            : product.lessons.slice(1, 5);
          if (section.title === 'Mini-histoires' && miniStoryFilter !== 'Tout') {
            lessons = lessons.filter((lesson) =>
              lesson.collection.includes(
                miniStoryFilter === 'Américain' ? 'American' : 'British',
              ),
            );
          }
          if (!lessons.length) return null;
          return (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Voir tout ${section.title}`}
                  onPress={() => router.push('/library')}
                  style={styles.seeAll}>
                  <Text style={styles.seeAllText}>Tout</Text>
                  <SymbolView name="chevron.right" tintColor={productTheme.muted} size={14} />
                </Pressable>
              </View>
              {section.title === 'Mini-histoires' ? (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.filterRail}>
                  {miniStoryFilters.map((item) => (
                    <Pressable
                      key={item}
                      accessibilityRole="button"
                      accessibilityLabel={`Filtrer les mini-histoires : ${item}`}
                      accessibilityState={{ selected: miniStoryFilter === item }}
                      onPress={() => setMiniStoryFilter(item)}
                      style={styles.filterButton}>
                      <Text
                        style={[
                          styles.filterText,
                          miniStoryFilter === item && styles.filterTextActive,
                        ]}>
                        {item}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              ) : null}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.rail}>
                {lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    savedWords={savedByLesson[lesson.id] ?? 0}
                    knownWords={product.vocabulary.filter(
                      (item) => item.lessonId === lesson.id && item.status === 4,
                    ).length}
                    progress={product.progress[lesson.id]?.progress}
                    inPlaylist={product.playlistIds.includes(lesson.id)}
                    onTogglePlaylist={() => product.togglePlaylist(lesson.id)}
                    onPress={() =>
                      router.push({ pathname: '/lesson/[id]', params: { id: lesson.id } })
                    }
                  />
                ))}
              </ScrollView>
            </View>
          );
        })}
          </>
        )}
      </ScrollView>

      <View style={styles.quickActions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir le coach YAPRO"
          onPress={() => router.push('/coach')}
          style={({ pressed }) => [styles.quickButton, pressed && styles.pressed]}>
          <SymbolView name="sparkles" tintColor={productTheme.ink} size={19} />
          <Text style={styles.quickText}>Coach</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Importer une leçon"
          onPress={() => router.push('/import')}
          style={({ pressed }) => [styles.quickButton, pressed && styles.pressed]}>
          <Text style={styles.quickText}>Importer</Text>
          <SymbolView name="plus" tintColor={productTheme.ink} size={22} />
        </Pressable>
      </View>
      <BottomTabs active="library" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.surface,
  },
  content: {
    paddingBottom: 190,
  },
  momentumCard: {
    minHeight: 74,
    marginHorizontal: 16,
    marginTop: 4,
    paddingHorizontal: 16,
    borderRadius: 18,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: productTheme.ink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 5,
  },
  flameWrap: {
    marginRight: 10,
  },
  momentumValue: {
    fontSize: 25,
    fontWeight: '800',
    color: productTheme.ink,
  },
  momentumLabel: {
    marginLeft: 6,
    fontSize: 16,
    fontWeight: '700',
    color: productTheme.inkSoft,
  },
  coin: {
    width: 34,
    height: 34,
    marginLeft: 16,
    marginRight: 8,
    borderWidth: 3,
    borderColor: '#A4CF4E',
    borderRadius: 17,
    backgroundColor: '#DDF16C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevron: {
    marginLeft: 'auto',
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    marginBottom: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickReviewCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#063F40',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  quickReviewIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickReviewCopy: {
    flex: 1,
  },
  quickReviewTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  quickReviewSubtitle: {
    fontSize: 12,
    marginTop: 3,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  quickReviewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  quickReviewBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#063F40',
  },
  sectionTitle: {
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '800',
    letterSpacing: -0.4,
    color: productTheme.ink,
  },
  seeAll: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 13,
    color: productTheme.muted,
  },
  rail: {
    paddingHorizontal: 16,
    gap: 14,
  },
  filterRail: {
    marginTop: -10,
    marginBottom: 14,
    paddingHorizontal: 16,
    gap: 20,
  },
  filterButton: {
    minHeight: 38,
    justifyContent: 'center',
  },
  filterText: {
    fontSize: 16,
    fontWeight: '500',
    color: productTheme.muted,
  },
  filterTextActive: {
    fontWeight: '800',
    color: productTheme.ink,
  },
  quickActions: {
    position: 'absolute',
    right: 16,
    bottom: 91,
    left: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  quickButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(8,22,43,.18)',
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,.94)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: productTheme.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
  },
  quickText: {
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.ink,
  },
  pressed: {
    opacity: 0.68,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 14,
    height: 44,
    borderRadius: 22,
    backgroundColor: productTheme.background,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: productTheme.ink,
  },
  emptySearch: {
    paddingVertical: 48,
    textAlign: 'center',
    fontSize: 15,
    color: productTheme.muted,
  },
  searchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 14,
    marginTop: 16,
  },
});
