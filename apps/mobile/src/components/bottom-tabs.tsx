import { type Href, router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { productTheme } from '@/constants/product-theme';

type TabKey = 'library' | 'words' | 'playlist' | 'more';

const tabs: { key: TabKey; label: string; symbol: string; route: Href }[] = [
  { key: 'library', label: 'Bibliothèque', symbol: 'building.columns.fill', route: '/' },
  { key: 'words', label: 'Vocabulaire', symbol: 'character.book.closed.fill', route: '/words' },
  { key: 'playlist', label: 'Liste de lecture', symbol: 'list.bullet.rectangle', route: '/playlist' },
  { key: 'more', label: 'Plus', symbol: 'line.3.horizontal', route: '/more' },
];

export function BottomTabs({ active }: { active: TabKey }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.shell, { paddingBottom: Math.max(8, insets.bottom) }]}>
      <View style={styles.tabBar} accessibilityRole="tablist">
        {tabs.map((tab) => {
          const selected = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.label}
              onPress={() => router.replace(tab.route)}
              style={({ pressed }) => [
                styles.tabItem,
                selected && styles.tabItemActive,
                pressed && styles.pressed,
              ]}>
              <SymbolView
                name={tab.symbol as never}
                tintColor={selected ? productTheme.greenDark : '#111111'}
                size={22}
              />
              <Text style={[styles.tabLabel, selected && styles.tabLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    position: 'absolute',
    right: 10,
    bottom: 0,
    left: 10,
    pointerEvents: 'box-none',
  },
  tabBar: {
    minHeight: 70,
    padding: 6,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(8,22,43,.2)',
    borderRadius: 34,
    backgroundColor: 'rgba(255,255,255,.94)',
    flexDirection: 'row',
    shadowColor: '#071326',
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 12,
  },
  tabItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 56,
    paddingHorizontal: 4,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  tabItemActive: {
    backgroundColor: 'rgba(64,139,82,.16)',
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: productTheme.greenDark,
  },
  pressed: {
    opacity: 0.64,
  },
});
