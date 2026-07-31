import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

const levels = ['Débutant 1', 'Débutant 2', 'Intermédiaire', 'Avancé'] as const;

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
            <SymbolView name="globe.europe.africa.fill" tintColor="#FFFFFF" size={25} />
          </View>
          <View style={styles.languageCopy}>
            <Text style={styles.languageName}>anglais</Text>
            <Text style={styles.languageMeta}>{product.profile.level}</Text>
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
        <View style={styles.unavailableCard}>
          <SymbolView name="lock.fill" tintColor={productTheme.muted} size={21} />
          <View style={styles.unavailableCopy}>
            <Text style={styles.unavailableTitle}>Le catalogue anglais est prêt</Text>
            <Text style={styles.unavailableText}>
              Les autres catalogues seront activés lorsqu’ils disposeront de leçons, traductions et audio validés.
            </Text>
          </View>
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
    minHeight: 59,
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
  unavailableCard: {
    padding: 16,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  unavailableCopy: {
    minWidth: 0,
    flex: 1,
  },
  unavailableTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: productTheme.ink,
  },
  unavailableText: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: productTheme.muted,
  },
});
