import React from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { productTheme } from '@/constants/product-theme';

interface ExternalDictionariesProps {
  word: string;
  sourceLang?: string;
  targetLang?: string;
}

export function ExternalDictionaries({ word, sourceLang = 'en', targetLang = 'fr' }: ExternalDictionariesProps) {
  const cleanWord = encodeURIComponent(word.trim());

  const providers = [
    {
      name: 'Reverso Context',
      url: `https://context.reverso.net/traduction/${sourceLang}-${targetLang}/${cleanWord}`,
      badge: 'Context',
    },
    {
      name: 'DeepL Translate',
      url: `https://www.deepl.com/translator#${sourceLang}/${targetLang}/${cleanWord}`,
      badge: 'IA',
    },
    {
      name: 'Wiktionary',
      url: `https://${sourceLang}.wiktionary.org/wiki/${cleanWord}`,
      badge: 'Définitions',
    },
    {
      name: 'Cambridge',
      url: `https://dictionary.cambridge.org/dictionary/english/${cleanWord}`,
      badge: 'IPA',
    },
  ];

  const openProvider = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dictionnaires Externes & Contextuels</Text>
      <View style={styles.row}>
        {providers.map((p) => (
          <Pressable
            key={p.name}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir dans ${p.name}`}
            onPress={() => openProvider(p.url)}
            style={({ pressed }) => [styles.chip, pressed && styles.pressed]}>
            <Text style={styles.chipName}>{p.name}</Text>
            <View style={styles.chipBadge}>
              <Text style={styles.chipBadgeText}>{p.badge}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E9E8',
  },
  title: {
    fontSize: 12,
    fontWeight: '800',
    color: productTheme.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#F0F4F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pressed: {
    opacity: 0.7,
  },
  chipName: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.ink,
  },
  chipBadge: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#063F40',
  },
  chipBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
