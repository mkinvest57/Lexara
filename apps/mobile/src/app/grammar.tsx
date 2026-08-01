import { useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { productTheme } from '@/constants/product-theme';

const topics = [
  {
    title: 'Le présent simple',
    body: 'Utilisez le présent simple pour les habitudes et les faits. Exemple : Mike works at a restaurant.',
  },
  {
    title: 'Les questions avec do',
    body: 'Avec la plupart des verbes, utilisez do ou does : Where does Mike work?',
  },
  {
    title: 'Les articles a et the',
    body: 'A introduit une chose non identifiée. The parle d’une chose déjà connue dans le contexte.',
  },
  {
    title: 'Les prépositions de temps',
    body: 'At s’emploie pour une heure précise, on pour un jour, et in pour une période plus large.',
  },
];

export default function GrammarScreen() {
  const [open, setOpen] = useState(0);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Retour" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.headerButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Guide de grammaire</Text>
        <View style={styles.headerButton}>
          <SymbolView name="text.book.closed.fill" tintColor={productTheme.green} size={19} />
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Grammaire anglaise essentielle</Text>
        <Text style={styles.intro}>
          Des explications courtes, liées aux phrases que vous rencontrez dans les leçons.
        </Text>
        <View style={styles.topics}>
          {topics.map((topic, index) => {
            const active = open === index;
            return (
              <View key={topic.title} style={styles.topic}>
                <Pressable
                  accessibilityState={{ expanded: active }}
                  onPress={() => setOpen(active ? -1 : index)}
                  style={styles.topicHeader}>
                  <Text style={styles.topicTitle}>{topic.title}</Text>
                  <SymbolView
                    name={active ? 'chevron.up' : 'chevron.down'}
                    tintColor={productTheme.muted}
                    size={16}
                  />
                </Pressable>
                {active ? <Text style={styles.topicBody}>{topic.body}</Text> : null}
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
    backgroundColor: productTheme.background,
  },
  header: {
    minHeight: 61,
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
    fontSize: 17,
    fontWeight: '800',
    color: productTheme.ink,
  },
  content: {
    padding: 17,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: '900',
    color: productTheme.ink,
  },
  intro: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: productTheme.muted,
  },
  topics: {
    marginTop: 24,
    overflow: 'hidden',
    borderRadius: 15,
    backgroundColor: productTheme.surface,
  },
  topic: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
  },
  topicHeader: {
    minHeight: 61,
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  topicTitle: {
    minWidth: 0,
    flex: 1,
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.ink,
  },
  topicBody: {
    paddingHorizontal: 15,
    paddingBottom: 17,
    fontSize: 14,
    lineHeight: 21,
    color: productTheme.inkSoft,
  },
});
