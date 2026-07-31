import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabs } from '@/components/bottom-tabs';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

const menu = [
  { label: 'Statistiques', symbol: 'chart.line.uptrend.xyaxis', route: '/stats' },
  { label: 'Importer une leçon', symbol: 'square.and.arrow.down', route: '/import' },
  { label: 'Coach Immerli', symbol: 'sparkles', route: '/coach' },
  { label: 'Langues', symbol: 'globe', route: '/languages' },
  { label: 'Guide de grammaire', symbol: 'text.book.closed.fill', route: '/grammar' },
  { label: 'Paramètres', symbol: 'gearshape.fill', route: '/settings' },
  { label: 'Profil et compte', symbol: 'person.crop.circle.fill', route: '/profile' },
] as const;

export default function MoreScreen() {
  const product = useProduct();

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Plus</Text>
            <Text style={styles.subtitle}>Votre espace Immerli</Text>
          </View>
          <View style={styles.coinBadge}>
            <SymbolView name="lightbulb.fill" tintColor={productTheme.greenDark} size={16} />
            <Text style={styles.coinText}>{product.coins}</Text>
          </View>
        </View>
        <Pressable onPress={() => router.push('/profile')} style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{product.profile.displayName.slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.profileCopy}>
            <Text style={styles.profileName}>{product.profile.displayName}</Text>
            <Text style={styles.profileMeta}>anglais · {product.profile.level}</Text>
          </View>
          <SymbolView name="chevron.right" tintColor={productTheme.muted} size={17} />
        </Pressable>
        <View style={styles.menu}>
          {menu.map((item) => (
            <Pressable
              key={item.label}
              accessibilityRole="button"
              accessibilityLabel={item.label}
              onPress={() => router.push(item.route)}
              style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}>
              <View style={styles.menuIcon}>
                <SymbolView name={item.symbol as never} tintColor={productTheme.ink} size={20} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <SymbolView name="chevron.right" tintColor={productTheme.muted} size={16} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <BottomTabs active="more" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 116,
  },
  header: {
    minHeight: 82,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: productTheme.ink,
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: productTheme.muted,
  },
  coinBadge: {
    minHeight: 42,
    paddingHorizontal: 13,
    borderRadius: 21,
    backgroundColor: '#EAF4C8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  coinText: {
    fontSize: 15,
    fontWeight: '900',
    color: productTheme.greenDark,
  },
  profileCard: {
    minHeight: 88,
    padding: 14,
    borderRadius: 16,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: productTheme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 21,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  profileCopy: {
    minWidth: 0,
    flex: 1,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '900',
    color: productTheme.ink,
  },
  profileMeta: {
    marginTop: 4,
    fontSize: 12,
    color: productTheme.muted,
  },
  menu: {
    marginTop: 16,
    overflow: 'hidden',
    borderRadius: 16,
    backgroundColor: productTheme.surface,
  },
  menuRow: {
    minHeight: 61,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    minWidth: 0,
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: productTheme.ink,
  },
  pressed: {
    opacity: 0.65,
  },
});
