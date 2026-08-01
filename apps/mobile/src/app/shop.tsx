import React, { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from '@/components/symbol-view';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

type MascotOutfit = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  description: string;
  unlocked: boolean;
};

export default function MascotShopScreen() {
  const product = useProduct();
  
  const purchased = new Set(product.purchasedMascots || ['outfit-default']);
  const equipped = product.equippedMascot || 'outfit-default';

  const outfits: MascotOutfit[] = [
    {
      id: 'outfit-default',
      name: 'YAPRO Renard Classique',
      price: 0,
      emoji: '🦊',
      description: 'La mascotte d’origine YAPRO, curieuse et intelligente.',
      unlocked: true,
    },
    {
      id: 'outfit-scholar',
      name: 'Mascotte Érudit',
      price: 100,
      emoji: '🦊🎓',
      description: 'Ajoute une toque et des lunettes de savant.',
      unlocked: purchased.has('outfit-scholar'),
    },
    {
      id: 'outfit-dragon',
      name: 'Dragon Polyglotte',
      price: 250,
      emoji: '🐲',
      description: 'L’avatar légendaire des maîtres des langues.',
      unlocked: purchased.has('outfit-dragon'),
    },
    {
      id: 'outfit-crown',
      name: 'Renard Couronné',
      price: 500,
      emoji: '🦊👑',
      description: 'Réservé aux champions avec plus de 1000 mots lus.',
      unlocked: purchased.has('outfit-crown'),
    },
  ];

  const buyOrEquip = (item: MascotOutfit) => {
    if (purchased.has(item.id)) {
      product.dispatch({ type: 'equipMascot', payload: item.id });
      return;
    }
    if (product.coins >= item.price) {
      product.dispatch({ type: 'buyMascot', payload: { id: item.id, price: item.price } });
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.backButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={22} />
        </Pressable>
        <Text style={styles.headerTitle}>Boutique & Mascotte YAPRO</Text>
        <View style={styles.coinBadge}>
          <Text style={styles.coinBadgeText}>🪙 {product.coins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mascotDisplayCard}>
          <Text style={styles.mascotAvatar}>
            {outfits.find((o) => o.id === equipped)?.emoji || '🦊'}
          </Text>
          <Text style={styles.mascotName}>
            {outfits.find((o) => o.id === equipped)?.name || 'Mascotte YAPRO'}
          </Text>
          <Text style={styles.mascotSubtitle}>
            Évolue au fur et à mesure de votre lecture et de vos pièces accumulées !
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Tenues & Avatars Déblocables</Text>

        <View style={styles.grid}>
          {outfits.map((item) => {
            const isOwned = purchased.has(item.id);
            const isEquipped = equipped === item.id;
            const canAfford = product.coins >= item.price;

            return (
              <View key={item.id} style={styles.outfitCard}>
                <Text style={styles.outfitEmoji}>{item.emoji}</Text>
                <Text style={styles.outfitName}>{item.name}</Text>
                <Text style={styles.outfitDesc}>{item.description}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isEquipped ? 'Équipé' : isOwned ? 'Équiper' : `Acheter pour ${item.price} pièces`}
                  onPress={() => buyOrEquip(item)}
                  style={[
                    styles.actionBtn,
                    isEquipped && styles.equippedBtn,
                    !isOwned && !canAfford && styles.disabledBtn,
                  ]}>
                  <Text
                    style={[
                      styles.actionBtnText,
                      isEquipped && styles.equippedBtnText,
                    ]}>
                    {isEquipped
                      ? 'Équipé ✓'
                      : isOwned
                      ? 'Équiper'
                      : `Obtenir (${item.price} 🪙)`}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FBFA',
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9E8',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: productTheme.ink,
  },
  coinBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#FFF8E1',
  },
  coinBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B78103',
  },
  content: {
    padding: 20,
  },
  mascotDisplayCard: {
    backgroundColor: '#063F40',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  mascotAvatar: {
    fontSize: 72,
    marginBottom: 10,
  },
  mascotName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mascotSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: productTheme.ink,
    marginBottom: 16,
  },
  grid: {
    gap: 16,
  },
  outfitCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E9E8',
    alignItems: 'center',
  },
  outfitEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  outfitName: {
    fontSize: 16,
    fontWeight: '800',
    color: productTheme.ink,
  },
  outfitDesc: {
    fontSize: 12,
    color: productTheme.muted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  actionBtn: {
    width: '100%',
    height: 44,
    borderRadius: 14,
    backgroundColor: '#063F40',
    justifyContent: 'center',
    alignItems: 'center',
  },
  equippedBtn: {
    backgroundColor: '#E8F5E9',
  },
  disabledBtn: {
    backgroundColor: '#E0E0E0',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  equippedBtnText: {
    color: '#2E7D32',
  },
});
