import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from '@/components/symbol-view';
import { BottomTabs } from '@/components/bottom-tabs';
import { productTheme } from '@/constants/product-theme';
import { useProduct } from '@/lib/product-store';

export default function MoreScreen() {
  const product = useProduct();

  const menuSections = [
    {
      title: 'APPRENTISSAGE',
      items: [
        {
          id: 'challenges',
          label: 'Défis & Classement',
          sub: 'Rejoignez le 90-Day Challenge',
          symbol: 'trophy.fill',
          route: '/challenges',
          badge: '3',
        },
        {
          id: 'stats',
          label: 'Statistiques & Progression',
          sub: `${product.stats.wordsRead} mots lus · Streak ${product.stats.streakDays}j`,
          symbol: 'chart.bar.fill',
          route: '/stats',
        },
        {
          id: 'languages',
          label: 'Langues & Niveaux',
          sub: `${product.profile.level} (Anglais 🇬🇧)`,
          symbol: 'globe',
          route: '/languages',
        },
      ],
    },
    {
      title: 'COMPTE & PARAMÈTRES',
      items: [
        {
          id: 'settings',
          label: 'Paramètres généraux',
          sub: 'Vitesse audio, rappels, notifications',
          symbol: 'gearshape.fill',
          route: '/settings',
        },
        {
          id: 'profile',
          label: 'Profil utilisateur',
          sub: product.profile.displayName || 'Invité',
          symbol: 'person.fill',
          route: '/profile',
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plus</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {menuSections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.menuGroup}>
              {section.items.map((item, index) => (
                <Pressable
                  key={item.id}
                  onPress={() => router.push(item.route as any)}
                  style={[
                    styles.menuItem,
                    index === section.items.length - 1 && styles.noBorder,
                  ]}>
                  <View style={styles.iconCircle}>
                    <SymbolView name={item.symbol as any} tintColor={productTheme.greenDark} size={18} />
                  </View>
                  <View style={styles.itemCopy}>
                    <Text style={styles.itemLabel}>{item.label}</Text>
                    <Text style={styles.itemSub}>{item.sub}</Text>
                  </View>
                  {item.badge ? (
                    <View style={styles.badgePill}>
                      <Text style={styles.badgeText}>{item.badge}</Text>
                    </View>
                  ) : null}
                  <SymbolView name="chevron.right" tintColor={productTheme.muted} size={15} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
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
  header: {
    minHeight: 56,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: productTheme.ink,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  section: {
    marginTop: 18,
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 11,
    fontWeight: '800',
    color: productTheme.muted,
  },
  menuGroup: {
    borderRadius: 16,
    backgroundColor: productTheme.surface,
    overflow: 'hidden',
  },
  menuItem: {
    minHeight: 64,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: productTheme.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemCopy: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.ink,
  },
  itemSub: {
    marginTop: 2,
    fontSize: 12,
    color: productTheme.muted,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    backgroundColor: productTheme.green,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
