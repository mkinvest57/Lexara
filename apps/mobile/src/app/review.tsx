import { useMemo, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct, type VocabularyEntry } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';
import { speakEnglish } from '@/lib/speech';

export default function ReviewScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId?: string }>();
  const product = useProduct();
  const dueVocabulary = product.dueVocabulary;
  const vocabulary = product.vocabulary;
  const initialCards = useMemo(() => {
    const candidates = lessonId
      ? vocabulary.filter((item) => item.status < 4 && item.lessonId === lessonId)
      : dueVocabulary;
    return candidates.slice(0, product.preferences.reviewSessionSize);
  }, [dueVocabulary, lessonId, product.preferences.reviewSessionSize, vocabulary]);
  const [cards, setCards] = useState<VocabularyEntry[]>(initialCards);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [complete, setComplete] = useState(false);
  const card = cards[index];

  const grade = (value: 'again' | 'hard' | 'good') => {
    if (!card) return;
    product.gradeReview(card.id, value);
    setReviewed((count) => count + 1);
    if (value === 'good') setCorrect((count) => count + 1);
    const nextLength = cards.length + (value === 'again' ? 1 : 0);
    if (value === 'again') setCards((current) => [...current, card]);
    if (index >= nextLength - 1) {
      setComplete(true);
      return;
    }
    setIndex((value) => value + 1);
    setRevealed(false);
  };

  if (!cards.length) {
    return (
      <SafeAreaView style={styles.emptyScreen}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fermer"
          onPress={router.back}
          style={styles.closeButton}>
          <SymbolView name="xmark" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <View style={styles.emptyCard}>
          <View style={styles.emptyIcon}>
            <SymbolView name="rectangle.stack.fill" tintColor={productTheme.green} size={37} />
          </View>
          <Text style={styles.emptyTitle}>Aucun mot à réviser</Text>
          <Text style={styles.emptyCopy}>
            Ouvrez une leçon et sauvegardez des mots. Ils apparaîtront immédiatement dans votre prochaine session.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Choisir une leçon"
            onPress={() => router.replace('/')}
            style={styles.primaryButton}>
            <Text style={styles.primaryText}>Choisir une leçon</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (complete) {
    return (
      <SafeAreaView style={styles.completeScreen}>
        <View style={styles.completeTop}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour"
            onPress={router.back}
            style={styles.closeButton}>
            <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
          </Pressable>
          <Text style={styles.completeTopTitle}>Révision terminée</Text>
          <View style={styles.closeButton} />
        </View>
        <View style={styles.completeCard}>
          <View style={styles.completeCheck}>
            <SymbolView name="checkmark" tintColor="#FFFFFF" size={28} />
          </View>
          <Text style={styles.completeTitle}>Bravo !</Text>
          <Text style={styles.completeCopy}>
            {reviewed} {reviewed > 1 ? 'réponses évaluées' : 'réponse évaluée'} · {correct}{' '}
            {correct > 1 ? 'réponses solides' : 'réponse solide'}
          </Text>
          <View style={styles.completeStats}>
            <View style={styles.completeStat}>
              <Text style={styles.completeStatValue}>{reviewed}</Text>
              <Text style={styles.completeStatLabel}>Cartes</Text>
            </View>
            <View style={styles.completeDivider} />
            <View style={styles.completeStat}>
              <Text style={styles.completeStatValue}>+{reviewed + correct}</Text>
              <Text style={styles.completeStatLabel}>Pièces</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Retour au vocabulaire"
            onPress={() => router.replace('/words')}
            style={styles.primaryButton}>
            <Text style={styles.primaryText}>Retour au vocabulaire</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const progress = (index + (revealed ? 0.7 : 0.2)) / cards.length;

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.topBar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Quitter la révision"
          onPress={router.back}
          style={styles.topIcon}>
          <SymbolView name="xmark" tintColor={productTheme.ink} size={21} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${Math.min(100, progress * 100)}%` }]} />
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Paramètres de révision"
          onPress={() => router.push('/settings')}
          style={styles.topIcon}>
          <SymbolView name="gearshape" tintColor={productTheme.ink} size={21} />
        </Pressable>
      </View>
      <Text style={styles.counter}>{index + 1} / {cards.length}</Text>
      <View style={styles.card}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Écouter ${card.term}`}
          onPress={() => speakEnglish(card.term, { rate: product.preferences.speechRate })}
          style={styles.speaker}>
          <SymbolView name="speaker.wave.2.fill" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.term}>{card.term}</Text>
        {revealed ? (
          <>
            <Text style={styles.translation}>{card.translation}</Text>
            <Text style={styles.context}>{card.context}</Text>
          </>
        ) : (
          <Text style={styles.prompt}>Quelle est la signification de ce mot ?</Text>
        )}
        <View style={styles.cardStatusRow}>
          {[1, 2, 3, 4].map((status) => (
            <View key={status} style={[styles.cardStatus, card.status === status && styles.cardStatusActive]}>
              <Text style={[styles.cardStatusText, card.status === status && styles.cardStatusTextActive]}>
                {status}
              </Text>
            </View>
          ))}
          <View style={styles.cardKnown}>
            <SymbolView
              name="checkmark"
              tintColor={card.status === 4 ? '#FFFFFF' : productTheme.muted}
              size={12}
            />
          </View>
        </View>
      </View>

      {!revealed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retourner la carte"
          onPress={() => setRevealed(true)}
          style={styles.revealButton}>
          <Text style={styles.revealText}>Retourner la carte</Text>
        </Pressable>
      ) : (
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="À revoir"
            onPress={() => grade('again')}
            style={[styles.gradeButton, styles.againButton]}>
            <SymbolView name="xmark" tintColor={productTheme.red} size={23} />
            <Text style={[styles.gradeText, styles.againText]}>À revoir</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Difficile"
            onPress={() => grade('hard')}
            style={[styles.gradeButton, styles.hardButton]}>
            <SymbolView name="minus" tintColor={productTheme.orange} size={23} />
            <Text style={[styles.gradeText, styles.hardText]}>Difficile</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Je savais"
            onPress={() => grade('good')}
            style={[styles.gradeButton, styles.goodButton]}>
            <SymbolView name="checkmark" tintColor={productTheme.green} size={23} />
            <Text style={[styles.gradeText, styles.goodText]}>Je savais</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 18,
    backgroundColor: productTheme.surface,
  },
  topBar: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topIcon: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 4,
    flex: 1,
    overflow: 'hidden',
    borderRadius: 3,
    backgroundColor: '#BFC4CA',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: productTheme.green,
  },
  counter: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.muted,
    textAlign: 'center',
  },
  card: {
    flex: 1,
    maxHeight: 520,
    minHeight: 390,
    marginTop: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 10,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: productTheme.ink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 4,
  },
  speaker: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  term: {
    marginTop: 20,
    fontSize: 39,
    fontWeight: '700',
    color: productTheme.ink,
  },
  translation: {
    marginTop: 12,
    fontSize: 24,
    fontWeight: '800',
    color: productTheme.green,
  },
  prompt: {
    marginTop: 15,
    fontSize: 14,
    color: productTheme.muted,
    textAlign: 'center',
  },
  context: {
    marginTop: 20,
    fontSize: 13,
    lineHeight: 19,
    color: productTheme.muted,
    textAlign: 'center',
  },
  cardStatusRow: {
    position: 'absolute',
    right: 16,
    bottom: 15,
    left: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  cardStatus: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardStatusActive: {
    borderColor: productTheme.green,
    backgroundColor: productTheme.greenPale,
  },
  cardStatusText: {
    fontSize: 11,
    fontWeight: '800',
    color: productTheme.muted,
  },
  cardStatusTextActive: {
    color: productTheme.greenDark,
  },
  cardKnown: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealButton: {
    minHeight: 52,
    marginTop: 20,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: productTheme.ink,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealText: {
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.ink,
  },
  actions: {
    minHeight: 72,
    marginTop: 16,
    marginBottom: 8,
    flexDirection: 'row',
    gap: 8,
  },
  gradeButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  againButton: {
    borderColor: '#F1B9B6',
    backgroundColor: '#FEF4F3',
  },
  hardButton: {
    borderColor: '#F1D4A5',
    backgroundColor: '#FFF9ED',
  },
  goodButton: {
    borderColor: '#ABD6B5',
    backgroundColor: '#F2FAF4',
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  againText: {
    color: productTheme.red,
  },
  hardText: {
    color: '#9D6514',
  },
  goodText: {
    color: productTheme.greenDark,
  },
  emptyScreen: {
    flex: 1,
    paddingHorizontal: 18,
    backgroundColor: productTheme.background,
  },
  closeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    marginTop: 70,
    padding: 27,
    borderRadius: 19,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: productTheme.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: '900',
    color: productTheme.ink,
  },
  emptyCopy: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: productTheme.muted,
    textAlign: 'center',
  },
  primaryButton: {
    minHeight: 51,
    marginTop: 22,
    paddingHorizontal: 21,
    borderRadius: 9,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  completeScreen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  completeTop: {
    minHeight: 60,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  completeTopTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: productTheme.ink,
  },
  completeCard: {
    margin: 18,
    marginTop: 60,
    padding: 28,
    borderRadius: 20,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
  },
  completeCheck: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: {
    marginTop: 18,
    fontSize: 30,
    fontWeight: '900',
    color: productTheme.ink,
  },
  completeCopy: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 21,
    color: productTheme.muted,
    textAlign: 'center',
  },
  completeStats: {
    width: '100%',
    marginTop: 24,
    padding: 18,
    borderRadius: 14,
    backgroundColor: productTheme.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  completeStat: {
    alignItems: 'center',
  },
  completeStatValue: {
    fontSize: 25,
    fontWeight: '900',
    color: productTheme.ink,
  },
  completeStatLabel: {
    marginTop: 3,
    fontSize: 11,
    color: productTheme.muted,
  },
  completeDivider: {
    width: 1,
    height: 39,
    backgroundColor: productTheme.line,
  },
});
