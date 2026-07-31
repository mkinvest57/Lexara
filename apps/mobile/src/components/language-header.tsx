import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { productTheme } from '@/constants/product-theme';

export function LanguageHeader({ compact = false }: { compact?: boolean }) {
  return (
    <View style={[styles.header, compact && styles.compact]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Changer de langue"
        onPress={() => router.push('/languages')}
        style={({ pressed }) => [styles.languageButton, pressed && styles.pressed]}>
        <View style={styles.languageIcon}>
          <SymbolView name="globe.europe.africa.fill" tintColor="#FFFFFF" size={20} />
        </View>
        <View style={styles.languageCopy}>
          <Text style={styles.language}>anglais</Text>
          {!compact ? (
            <View style={styles.changeRow}>
              <Text style={styles.change}>Changer de langue</Text>
              <SymbolView name="chevron.right" tintColor={productTheme.ink} size={14} />
            </View>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Rechercher"
          onPress={() => router.push('/library')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <SymbolView name="magnifyingglass" tintColor={productTheme.ink} size={21} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ouvrir les paramètres"
          onPress={() => router.push('/settings')}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <SymbolView name="gearshape" tintColor={productTheme.ink} size={22} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 96,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  compact: {
    minHeight: 66,
    paddingVertical: 8,
  },
  languageButton: {
    minWidth: 0,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#183B75',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageCopy: {
    minWidth: 0,
  },
  language: {
    fontSize: 25,
    lineHeight: 28,
    fontWeight: '800',
    color: productTheme.ink,
  },
  changeRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  change: {
    fontSize: 14,
    color: productTheme.ink,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 14,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.62,
  },
});
