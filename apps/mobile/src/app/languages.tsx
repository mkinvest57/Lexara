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
  { id: 'en', name: 'anglais', flag: '🇬🇧', count: 45 },
  { id: 'fr', name: 'français', flag: '🇫🇷' },
  { id: 'es', name: 'espagnol', flag: '🇪🇸' },
  { id: 'de', name: 'allemand', flag: '🇩🇪' },
  { id: 'it', name: 'italien', flag: '🇮🇹' },
  { id: 'pt', name: 'portugais', flag: '🇵🇹' },
  { id: 'ru', name: 'russe', flag: '🇷🇺' },
  { id: 'ja', name: 'japonais', flag: '🇯🇵' },
  { id: 'zh-sim', name: 'Chinois (Simplifié)', flag: '🇨🇳' },
  { id: 'zh-trad', name: 'Chinois (Traditionnel)', flag: '🇹🇼' },
  { id: 'ko', name: 'coréen', flag: '🇰🇷' },
  { id: 'ar', name: 'arabe', flag: '🇸🇦' },
  { id: 'nl', name: 'néerlandais', flag: '🇳🇱' },
  { id: 'pl', name: 'polonais', flag: '🇵🇱' },
  { id: 'sv', name: 'suédois', flag: '🇸🇪' },
  { id: 'no', name: 'norvégien', flag: '🇳🇴' },
  { id: 'fi', name: 'finnois', flag: '🇫🇮' },
  { id: 'da', name: 'danois', flag: '🇩🇰' },
  { id: 'el', name: 'grec', flag: '🇬🇷' },
  { id: 'tr', name: 'turc', flag: '🇹🇷' },
  { id: 'uk', name: 'ukrainien', flag: '🇺🇦' },
  { id: 'ro', name: 'roumain', flag: '🇷🇴' },
  { id: 'sk', name: 'slovaque', flag: '🇸🇰' },
];

export const extraLanguages: LanguageItem[] = [
  { id: 'la', name: 'latin (SPQR)', flag: '🏛️' },
  { id: 'eo', name: 'espéranto', flag: '⭐️' },
  { id: 'yue', name: 'Cantonais', flag: '🇭🇰' },
  { id: 'fa', name: 'Farsi', flag: '🇮🇷' },
  { id: 'af', name: 'afrikaans', flag: '🇿🇦' },
  { id: 'hy', name: 'arménien', flag: '🇦🇲' },
  { id: 'be', name: 'biélorusse', flag: '🇧🇾' },
  { id: 'bg', name: 'bulgare', flag: '🇧🇬' },
  { id: 'ca', name: 'catalan', flag: '🏴' },
  { id: 'hr', name: 'croate', flag: '🇭🇷' },
  { id: 'gu', name: 'goudjarati', flag: '🇮🇳' },
  { id: 'ka', name: 'géorgien', flag: '🇬🇪' },
  { id: 'hi', name: 'hindi', flag: '🇮🇳' },
  { id: 'hu', name: 'hongrois', flag: '🇭🇺' },
  { id: 'id', name: 'indonésien', flag: '🇮🇩' },
  { id: 'ga', name: 'irlandais', flag: '🇮🇪' },
  { id: 'is', name: 'islandais', flag: '🇮🇸' },
  { id: 'km', name: 'khmer', flag: '🇰🇭' },
  { id: 'mk', name: 'macédonien', flag: '🇲🇰' },
  { id: 'ms', name: 'malais', flag: '🇲🇾' },
  { id: 'ur', name: 'ourdou', flag: '🇵🇰' },
  { id: 'pa', name: 'pendjabi', flag: '🇮🇳' },
  { id: 'sr', name: 'serbe', flag: '🇷🇸' },
  { id: 'sl', name: 'slovène', flag: '🇸🇮' },
  { id: 'sw', name: 'swahili', flag: '🇰🇪' },
  { id: 'tl', name: 'tagalog', flag: '🇵🇭' },
  { id: 'cs', name: 'tchèque', flag: '🇨🇿' },
  { id: 'th', name: 'thaï', flag: '🇹🇭' },
  { id: 'vi', name: 'vietnamien', flag: '🇻🇳' },
];

export default function LanguagesScreen() {
  const product = useProduct();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Retour" onPress={router.back} style={styles.headerButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Langues</Text>
        <Pressable accessibilityLabel="Enregistrer" onPress={router.back} style={styles.doneButton}>
          <SymbolView name="checkmark" tintColor="#FFFFFF" size={20} />
        </Pressable>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>LANGUE ACTIVE</Text>
        <View style={styles.languageCard}>
          <View style={styles.languageIcon}>
            <Text style={styles.flagEmoji}>🇬🇧</Text>
          </View>
          <View style={styles.languageCopy}>
            <Text style={styles.languageName}>anglais</Text>
            <Text style={styles.languageMeta}>{product.profile.level} · 45 leçons explorées</Text>
          </View>
          <View style={styles.activeBadge}>
            <Text style={styles.activeText}>Active</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>NIVEAU</Text>
        <View style={styles.levelGroup}>
          {levels.map((level) => {
            const active = product.profile.level === level;
            return (
              <Pressable
                key={level}
                accessibilityState={{ selected: active }}
                onPress={() => product.finishOnboarding({ level })}
                style={[styles.levelRow, active && styles.levelRowActive]}>
                <View style={styles.levelBars}>
                  {[0, 1, 2, 3].map((item) => (
                    <View
                      key={item}
                      style={[
                        styles.levelBar,
                        { height: 7 + item * 4 },
                        item <= levels.indexOf(level) && styles.levelBarFilled,
                      ]}
                    />
                  ))}
                </View>
                <Text style={styles.levelLabel}>{level}</Text>
                {active ? (
                  <SymbolView name="checkmark.circle.fill" tintColor={productTheme.green} size={21} />
                ) : null}
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>PLUS DE LANGUES</Text>
        <View style={styles.languageListGroup}>
          {mainLanguages.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => {
                if (item.id === 'en') router.back();
              }}
              style={[
                styles.languageListItem,
                index === mainLanguages.length - 1 && styles.noBorder,
              ]}>
              <View style={styles.smallFlagIcon}>
                <Text style={styles.smallFlagEmoji}>{item.flag}</Text>
              </View>
              <Text style={styles.languageListLabel}>{item.name}</Text>
              {item.count ? <Text style={styles.languageCount}>({item.count})</Text> : null}
              <SymbolView name="chevron.right" tintColor={productTheme.muted} size={16} />
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionTitle}>ENCORE PLUS DE LANGUES (BETA)</Text>
        <View style={styles.languageListGroup}>
          {extraLanguages.map((item, index) => (
            <Pressable
              key={item.id}
              style={[
                styles.languageListItem,
                index === extraLanguages.length - 1 && styles.noBorder,
              ]}>
              <View style={styles.smallFlagIcon}>
                <Text style={styles.smallFlagEmoji}>{item.flag}</Text>
              </View>
              <Text style={styles.languageListLabel}>{item.name}</Text>
              <View style={styles.betaBadge}>
                <Text style={styles.betaBadgeText}>Beta</Text>
              </View>
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
    paddingBottom: 40,
  },
  sectionTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '800',
    color: productTheme.muted,
  },
  languageCard: {
    minHeight: 82,
    padding: 14,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#183B75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flagEmoji: {
    fontSize: 26,
  },
  languageCopy: {
    minWidth: 0,
    flex: 1,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '900',
    color: productTheme.ink,
  },
  languageMeta: {
    marginTop: 3,
    fontSize: 12,
    color: productTheme.muted,
  },
  activeBadge: {
    minHeight: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: productTheme.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeText: {
    fontSize: 11,
    fontWeight: '800',
    color: productTheme.greenDark,
  },
  levelGroup: {
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: productTheme.surface,
  },
  levelRow: {
    minHeight: 55,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelRowActive: {
    backgroundColor: productTheme.greenPale,
  },
  levelBars: {
    width: 38,
    height: 28,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  levelBar: {
    width: 6,
    borderRadius: 2,
    backgroundColor: '#D7DADE',
  },
  levelBarFilled: {
    backgroundColor: productTheme.green,
  },
  levelLabel: {
    minWidth: 0,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: productTheme.ink,
  },
  languageListGroup: {
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: productTheme.surface,
  },
  languageListItem: {
    minHeight: 52,
    paddingHorizontal: 15,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  },
  languageCount: {
    fontSize: 13,
    fontWeight: '600',
    color: productTheme.muted,
  },
  betaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: productTheme.background,
  },
  betaBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: productTheme.muted,
  },
});
