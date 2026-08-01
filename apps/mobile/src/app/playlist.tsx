import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from '@/components/symbol-view';
import { BottomTabs } from '@/components/bottom-tabs';
import { productTheme } from '@/constants/product-theme';
import { useProduct } from '@/lib/product-store';

export default function PlaylistScreen() {
  const product = useProduct();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const playlistLessons = product.playlist
    .map((id) => product.lessons.find((item) => item.id === id))
    .filter(Boolean);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <View style={styles.playlistBadgeIcon}>
            <SymbolView name="music.note.list" tintColor="#FFFFFF" size={20} />
          </View>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle}>Liste de lecture active</Text>
            <Pressable onPress={() => router.push('/library')} style={styles.changeRow}>
              <Text style={styles.changeText}>Changer de Playlist</Text>
              <SymbolView name="chevron.right" tintColor={productTheme.muted} size={13} />
            </Pressable>
          </View>
        </View>
        <Pressable onPress={() => setShowOptions(!showOptions)} style={styles.headerButton}>
          <SymbolView name="ellipsis" tintColor={productTheme.ink} size={20} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setIsPlaying(!isPlaying)}
          style={styles.primaryPlayButton}>
          <SymbolView
            name={isPlaying ? 'pause.fill' : 'play.fill'}
            tintColor="#FFFFFF"
            size={18}
          />
          <Text style={styles.primaryPlayText}>
            {isPlaying ? 'Mettre en pause' : 'Démarrer'}
          </Text>
        </Pressable>

        {showOptions ? (
          <View style={styles.optionsSheet}>
            <Text style={styles.optionsSheetTitle}>Modifier la playlist</Text>
            <Pressable style={styles.optionRow}>
              <SymbolView name="arrow.down.circle" tintColor={productTheme.ink} size={20} />
              <Text style={styles.optionText}>Télécharger les leçons</Text>
            </Pressable>
            <Pressable style={styles.optionRow}>
              <SymbolView name="nosign" tintColor={productTheme.ink} size={20} />
              <Text style={styles.optionText}>Désactiver les téléchargements</Text>
            </Pressable>
            <Pressable style={styles.optionRow}>
              <SymbolView name="trash" tintColor={productTheme.red} size={20} />
              <Text style={[styles.optionText, { color: productTheme.red }]}>
                Supprimer les fichiers: 430 ko
              </Text>
            </Pressable>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>Pistes ({playlistLessons.length})</Text>
        {!playlistLessons.length ? (
          <View style={styles.emptyCard}>
            <SymbolView name="music.note" tintColor={productTheme.muted} size={32} />
            <Text style={styles.emptyTitle}>Votre playlist est vide</Text>
            <Text style={styles.emptyText}>
              Ajoutez des leçons depuis la bibliothèque pour les écouter en continu.
            </Text>
          </View>
        ) : (
          <View style={styles.trackList}>
            {playlistLessons.map((lesson, index) => (
              <Pressable
                key={lesson!.id}
                onPress={() => router.push(`/lesson/${lesson!.id}`)}
                style={[
                  styles.trackRow,
                  index === playlistLessons.length - 1 && styles.noBorder,
                ]}>
                <View style={styles.trackIndexBox}>
                  <Text style={styles.trackIndexText}>{index + 1}</Text>
                </View>
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle}>{lesson!.title}</Text>
                  <Text style={styles.trackMeta}>
                    {Math.floor((lesson!.durationSeconds || 120) / 60)}:
                    {String((lesson!.durationSeconds || 120) % 60).padStart(2, '0')}
                  </Text>
                </View>
                <Pressable
                  onPress={() => product.removeFromPlaylist(lesson!.id)}
                  style={styles.trackOption}>
                  <SymbolView name="ellipsis" tintColor={productTheme.muted} size={18} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
      <BottomTabs active="playlist" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playlistBadgeIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitles: {
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: productTheme.ink,
  },
  changeRow: {
    marginTop: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.muted,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  primaryPlayButton: {
    minHeight: 48,
    marginTop: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: productTheme.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryPlayText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  optionsSheet: {
    marginTop: 16,
    padding: 16,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    gap: 12,
  },
  optionsSheetTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: productTheme.muted,
    marginBottom: 4,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 6,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '700',
    color: productTheme.ink,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 12,
    fontWeight: '800',
    color: productTheme.muted,
  },
  emptyCard: {
    padding: 30,
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '800',
    color: productTheme.ink,
  },
  emptyText: {
    marginTop: 6,
    fontSize: 13,
    color: productTheme.muted,
    textAlign: 'center',
  },
  trackList: {
    borderRadius: 15,
    backgroundColor: productTheme.surface,
    overflow: 'hidden',
  },
  trackRow: {
    minHeight: 62,
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
  trackIndexBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIndexText: {
    fontSize: 12,
    fontWeight: '800',
    color: productTheme.muted,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: productTheme.ink,
  },
  trackMeta: {
    marginTop: 3,
    fontSize: 12,
    color: productTheme.muted,
  },
  trackOption: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
