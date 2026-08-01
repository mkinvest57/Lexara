import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

const levels = ['Débutant 1', 'Débutant 2', 'Intermédiaire', 'Avancé'] as const;

export interface LanguageItem {
  id: string;
  name: string;
  flag: string;
  count?: number;
}

export const mainLanguages: LanguageItem[] = [
  { id: 'en', name: 'anglais', flag: '🇬🇧', count: 52 },
  { id: 'fr', name: 'français', flag: '🇫🇷', count: 52 },
  { id: 'es', name: 'espagnol', flag: '🇪🇸', count: 52 },
  { id: 'de', name: 'allemand', flag: '🇩🇪', count: 52 },
  { id: 'it', name: 'italien', flag: '🇮🇹', count: 52 },
  { id: 'pt', name: 'portugais', flag: '🇵🇹', count: 52 },
  { id: 'ru', name: 'russe', flag: '🇷🇺', count: 52 },
  { id: 'ja', name: 'japonais', flag: '🇯🇵', count: 52 },
  { id: 'zh-sim', name: 'Chinois (Simplifié)', flag: '🇨🇳', count: 52 },
  { id: 'zh-trad', name: 'Chinois (Traditionnel)', flag: '🇹🇼', count: 52 },
  { id: 'ko', name: 'coréen', flag: '🇰🇷', count: 52 },
  { id: 'ar', name: 'arabe', flag: '🇸🇦', count: 52 },
  { id: 'nl', name: 'néerlandais', flag: '🇳🇱', count: 52 },
  { id: 'pl', name: 'polonais', flag: '🇵🇱', count: 52 },
  { id: 'sv', name: 'suédois', flag: '🇸🇪', count: 52 },
  { id: 'no', name: 'norvégien', flag: '🇳🇴', count: 52 },
  { id: 'fi', name: 'finnois', flag: '🇫🇮', count: 52 },
  { id: 'da', name: 'danois', flag: '🇩🇰', count: 52 },
  { id: 'el', name: 'grec', flag: '🇬🇷', count: 52 },
  { id: 'tr', name: 'turc', flag: '🇹🇷', count: 52 },
  { id: 'uk', name: 'ukrainien', flag: '🇺🇦', count: 52 },
  { id: 'ro', name: 'roumain', flag: '🇷🇴', count: 52 },
  { id: 'sk', name: 'slovaque', flag: '🇸🇰', count: 52 },
];

export const extraLanguages: LanguageItem[] = [
  { id: 'la', name: 'latin (SPQR)', flag: '🏛️', count: 52 },
  { id: 'eo', name: 'espéranto', flag: '⭐️', count: 52 },
  { id: 'yue', name: 'Cantonais', flag: '🇭🇰', count: 52 },
  { id: 'fa', name: 'Farsi', flag: '🇮🇷', count: 52 },
  { id: 'af', name: 'afrikaans', flag: '🇿🇦', count: 52 },
  { id: 'hy', name: 'arménien', flag: '🇦🇲', count: 52 },
  { id: 'be', name: 'biélorusse', flag: '🇧🇾', count: 52 },
  { id: 'bg', name: 'bulgare', flag: '🇧🇬', count: 52 },
  { id: 'ca', name: 'catalan', flag: '🏴', count: 52 },
  { id: 'hr', name: 'croate', flag: '🇭🇷', count: 52 },
  { id: 'gu', name: 'goudjarati', flag: '🇮🇳', count: 52 },
  { id: 'ka', name: 'géorgien', flag: '🇬🇪', count: 52 },
  { id: 'hi', name: 'hindi', flag: '🇮🇳', count: 52 },
  { id: 'hu', name: 'hongrois', flag: '🇭🇺', count: 52 },
  { id: 'id', name: 'indonésien', flag: '🇮🇩', count: 52 },
  { id: 'ga', name: 'irlandais', flag: '🇮🇪', count: 52 },
  { id: 'is', name: 'islandais', flag: '🇮🇸', count: 52 },
  { id: 'km', name: 'khmer', flag: '🇰🇭', count: 52 },
  { id: 'mk', name: 'macédonien', flag: '🇲🇰', count: 52 },
  { id: 'ms', name: 'malais', flag: '🇲🇾', count: 52 },
  { id: 'ur', name: 'ourdou', flag: '🇵🇰', count: 52 },
  { id: 'pa', name: 'pendjabi', flag: '🇮🇳', count: 52 },
  { id: 'sr', name: 'serbe', flag: '🇷🇸', count: 52 },
  { id: 'sl', name: 'slovène', flag: '🇸🇮', count: 52 },
  { id: 'sw', name: 'swahili', flag: '🇰🇪', count: 52 },
  { id: 'tl', name: 'tagalog', flag: '🇵🇭', count: 52 },
  { id: 'cs', name: 'tchèque', flag: '🇨🇿', count: 52 },
  { id: 'th', name: 'thaï', flag: '🇹🇭', count: 52 },
  { id: 'vi', name: 'vietnamien', flag: '🇻🇳', count: 52 },
];

export default function LanguagesScreen() {
  const product = useProduct();
  const activeCode = product.profile.targetLanguage || 'en';
  const allLangs = [...mainLanguages, ...extraLanguages];
  const activeItem = allLangs.find((item) => item.id === activeCode) || mainLanguages[0];

  const selectLanguage = (item: LanguageItem) => {
    product.finishOnboarding({
      targetLanguage: item.id,
      targetLanguageLabel: item.name,
    });
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.headerButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Langues d'apprentissage</Text>
        <Pressable accessibilityLabel="Enregistrer" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.doneButton}>
          <SymbolView name="checkmark" tintColor="#FFFFFF" size={20} />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>LANGUE ACTIVE D'APPRENTISSAGE</Text>
        <View style={styles.languageCard}>
          <View style={styles.languageIcon}>
            <Text style={styles.flagEmoji}>{activeItem.flag}</Text>
          </View>
          <View style={styles.languageCopy}>
            <Text style={styles.languageName}>{activeItem.name}</Text>
            <Text style={styles.languageMeta}>{product.profile.level} · {product.lessons.length} leçons actives</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>NIVEAU DE LA LANGUE</Text>
        <View style={styles.levelGroup}>
          {levels.map((level) => {
            const isSelected = product.profile.level === level;
            return (
              <Pressable
                key={level}
                onPress={() => product.finishOnboarding({ level })}
                style={[styles.levelChip, isSelected && styles.levelChipActive]}>
                <Text style={[styles.levelChipText, isSelected && styles.levelChipTextActive]}>
                  {level}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>CHOISIR UNE AUTRE LANGUE (40+ LANGUES)</Text>
        <View style={styles.languageListGroup}>
          {mainLanguages.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => selectLanguage(item)}
              style={[
                styles.languageListItem,
                index === mainLanguages.length - 1 && styles.noBorder,
                item.id === activeCode && styles.languageListItemActive,
              ]}>
              <View style={styles.smallFlagIcon}>
                <Text style={styles.smallFlagEmoji}>{item.flag}</Text>
              </View>
              <Text style={[styles.languageListLabel, item.id === activeCode && styles.activeTextHighlight]}>
                {item.name}
              </Text>
              {item.count ? <Text style={styles.languageCount}>({item.count} leçons)</Text> : null}
              {item.id === activeCode ? (
                <SymbolView name="checkmark.circle.fill" tintColor={productTheme.green} size={18} />
              ) : (
                <SymbolView name="chevron.right" tintColor={productTheme.muted} size={16} />
              )}
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>ENCORE PLUS DE LANGUES ET DIALECTES (50+)</Text>
        <View style={styles.languageListGroup}>
          {extraLanguages.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => selectLanguage(item)}
              style={[
                styles.languageListItem,
                index === extraLanguages.length - 1 && styles.noBorder,
                item.id === activeCode && styles.languageListItemActive,
              ]}>
              <View style={styles.smallFlagIcon}>
                <Text style={styles.smallFlagEmoji}>{item.flag}</Text>
              </View>
              <Text style={[styles.languageListLabel, item.id === activeCode && styles.activeTextHighlight]}>
                {item.name}
              </Text>
              {item.id === activeCode ? (
                <SymbolView name="checkmark.circle.fill" tintColor={productTheme.green} size={18} />
              ) : (
                <View style={styles.betaBadge}>
                  <Text style={styles.betaBadgeText}>Dispo (52 leçons)</Text>
                </View>
              )}
            </Pressable>
          ))}
        </View>
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
    fontSize: 18,
    fontWeight: '800',
    color: productTheme.ink,
  },
  doneButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 60,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: productTheme.muted,
  },
  languageCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: productTheme.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 24,
  },
  languageCopy: {
    flex: 1,
  },
  languageName: {
    fontSize: 17,
    fontWeight: '800',
    color: productTheme.ink,
    textTransform: 'capitalize',
  },
  languageMeta: {
    marginTop: 2,
    fontSize: 12,
    color: productTheme.muted,
  },
  activeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: productTheme.green,
  },
  activeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  levelGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: productTheme.line,
    backgroundColor: productTheme.surface,
  },
  levelChipActive: {
    borderColor: productTheme.green,
    backgroundColor: productTheme.greenPale,
  },
  levelChipText: {
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.ink,
  },
  levelChipTextActive: {
    color: productTheme.greenDark,
  },
  languageListGroup: {
    borderRadius: 16,
    backgroundColor: productTheme.surface,
    overflow: 'hidden',
  },
  languageListItem: {
    minHeight: 56,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageListItemActive: {
    backgroundColor: productTheme.greenPale,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  smallFlagIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallFlagEmoji: {
    fontSize: 18,
  },
  languageListLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: productTheme.ink,
    textTransform: 'capitalize',
  },
  activeTextHighlight: {
    color: productTheme.greenDark,
    fontWeight: '900',
  },
  languageCount: {
    fontSize: 12,
    color: productTheme.muted,
  },
  betaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: productTheme.background,
  },
  betaBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: productTheme.muted,
  },
});
