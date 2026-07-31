import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabs } from '@/components/bottom-tabs';
import { useProduct, type VocabularyStatus } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';
import { speakEnglish } from '@/lib/speech';

type Filter = 'Tout' | 'À apprendre' | 'Connu';

export default function WordsScreen() {
  const product = useProduct();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('Tout');

  const vocabulary = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase();
    return product.vocabulary.filter((item) => {
      const matchesQuery =
        !normalized ||
        item.term.includes(normalized) ||
        item.translation.toLocaleLowerCase().includes(normalized);
      const matchesFilter =
        filter === 'Tout' ||
        (filter === 'Connu' ? item.status === 4 : item.status < 4);
      return matchesQuery && matchesFilter;
    });
  }, [filter, product.vocabulary, query]);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.languageIcon}>
            <SymbolView name="globe.europe.africa.fill" tintColor="#FFFFFF" size={21} />
          </View>
          <Text style={styles.title}>Vocabulaire</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Trouver une leçon pour ajouter du vocabulaire"
          onPress={() => router.push('/library')}
          style={styles.headerButton}>
          <SymbolView name="plus" tintColor={productTheme.ink} size={20} />
        </Pressable>
      </View>
      <View style={styles.search}>
        <SymbolView name="magnifyingglass" tintColor={productTheme.muted} size={18} />
        <TextInput
          accessibilityLabel="Rechercher dans le vocabulaire"
          placeholder="Chercher le vocabulaire"
          placeholderTextColor={productTheme.mutedLight}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
      </View>
      <View style={styles.filterRow}>
        {(['Tout', 'À apprendre', 'Connu'] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityRole="button"
            accessibilityLabel={`Filtrer par ${item}`}
            accessibilityState={{ selected: filter === item }}
            onPress={() => setFilter(item)}
            style={[styles.filterButton, filter === item && styles.filterActive]}>
            <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
          </Pressable>
        ))}
        <Text style={styles.count}>
          {vocabulary.length} {vocabulary.length > 1 ? 'mots' : 'mot'}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {vocabulary.length ? (
          <>
            <View style={styles.wordList}>
              {vocabulary.map((item) => (
                <View key={item.id} style={styles.wordCard}>
                  <View style={styles.wordTop}>
                    <View style={styles.wordCopy}>
                      <Text style={styles.word}>{item.term}</Text>
                      <Text style={styles.translation}>{item.translation}</Text>
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Écouter ${item.term}`}
                      onPress={() => speakEnglish(item.term, { rate: product.preferences.speechRate })}
                      style={styles.audioButton}>
                      <SymbolView name="speaker.wave.2.fill" tintColor={productTheme.blue} size={19} />
                    </Pressable>
                  </View>
                  <Text numberOfLines={2} style={styles.context}>{item.context}</Text>
                  <View style={styles.statusRow}>
                    {[1, 2, 3, 4].map((status) => (
                      <Pressable
                        key={status}
                        accessibilityRole="button"
                        accessibilityLabel={status === 4 ? 'Marquer comme connu' : `Niveau ${status}`}
                        accessibilityState={{ selected: item.status === status }}
                        onPress={() =>
                          product.setVocabularyStatus(item.id, status as VocabularyStatus)
                        }
                        style={[
                          styles.status,
                          item.status === status && styles.statusSelected,
                          status === 4 && item.status === 4 && styles.statusKnown,
                        ]}>
                        {status === 4 ? (
                          <SymbolView
                            name="checkmark"
                            tintColor={item.status === 4 ? '#FFFFFF' : productTheme.muted}
                            size={14}
                          />
                        ) : (
                          <Text
                            style={[
                              styles.statusText,
                              item.status === status && styles.statusTextSelected,
                            ]}>
                            {status}
                          </Text>
                        )}
                      </Pressable>
                    ))}
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={`Ouvrir la leçon contenant ${item.term}`}
                      onPress={() =>
                        router.push({ pathname: '/lesson/[id]', params: { id: item.lessonId } })
                      }
                      style={styles.lessonLink}>
                      <Text style={styles.lessonLinkText}>Voir en contexte</Text>
                      <SymbolView name="chevron.right" tintColor={productTheme.blue} size={13} />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Commencer la révision"
              onPress={() => router.push('/review')}
              style={styles.reviewButton}>
              <SymbolView name="brain.head.profile" tintColor="#FFFFFF" size={19} />
              <Text style={styles.reviewText}>Réviser maintenant</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.empty}>
            <View style={styles.emptyIllustration}>
              <SymbolView name="character.book.closed.fill" tintColor="#C9CED5" size={47} />
            </View>
            <Text style={styles.emptyTitle}>
              {product.vocabulary.length ? 'Aucun mot pour ce filtre' : 'Votre vocabulaire se construit en lisant'}
            </Text>
            <Text style={styles.emptyCopy}>
              {product.vocabulary.length
                ? 'Essayez un autre filtre ou une autre recherche.'
                : 'Touchez un mot dans une leçon, ajoutez sa traduction, puis retrouvez-le ici pour le réviser.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ouvrir une leçon"
              onPress={() => router.push('/')}
              style={styles.emptyButton}>
              <Text style={styles.emptyButtonText}>Ouvrir une leçon</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
      <BottomTabs active="words" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.surface,
  },
  header: {
    minHeight: 66,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  languageIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#183B75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: '900',
    color: productTheme.ink,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  search: {
    minHeight: 48,
    marginHorizontal: 16,
    paddingHorizontal: 13,
    borderRadius: 11,
    backgroundColor: productTheme.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  searchInput: {
    minWidth: 0,
    flex: 1,
    fontSize: 15,
    color: productTheme.ink,
  },
  filterRow: {
    minHeight: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  filterButton: {
    minHeight: 34,
    paddingHorizontal: 11,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterActive: {
    borderColor: productTheme.ink,
    backgroundColor: productTheme.ink,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.muted,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  count: {
    marginLeft: 'auto',
    fontSize: 12,
    color: productTheme.muted,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 118,
  },
  wordList: {
    gap: 10,
  },
  wordCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: productTheme.lineSoft,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    shadowColor: productTheme.ink,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  wordTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  wordCopy: {
    minWidth: 0,
    flex: 1,
  },
  word: {
    fontSize: 23,
    fontWeight: '900',
    color: productTheme.ink,
  },
  translation: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: '700',
    color: productTheme.greenDark,
  },
  audioButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.bluePale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  context: {
    marginTop: 13,
    fontSize: 13,
    lineHeight: 18,
    color: productTheme.muted,
  },
  statusRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  status: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusSelected: {
    borderColor: productTheme.green,
    backgroundColor: productTheme.greenPale,
  },
  statusKnown: {
    backgroundColor: productTheme.green,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: productTheme.muted,
  },
  statusTextSelected: {
    color: productTheme.greenDark,
  },
  lessonLink: {
    minHeight: 34,
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  lessonLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: productTheme.blue,
  },
  reviewButton: {
    minHeight: 52,
    marginTop: 18,
    borderRadius: 10,
    backgroundColor: productTheme.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
  reviewText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  empty: {
    marginTop: 80,
    paddingHorizontal: 28,
    alignItems: 'center',
  },
  emptyIllustration: {
    width: 108,
    height: 92,
    borderRadius: 30,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 21,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '800',
    color: productTheme.ink,
    textAlign: 'center',
  },
  emptyCopy: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: productTheme.muted,
    textAlign: 'center',
  },
  emptyButton: {
    minHeight: 48,
    marginTop: 21,
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
});
