import { useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from '@/components/symbol-view';
import { productTheme } from '@/constants/product-theme';
import { useProduct } from '@/lib/product-store';

export function MiniPlayer() {
  const product = useProduct();
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<'1x' | '0.75x' | '1.25x'>('1x');

  if (!product.playlist.length) return null;

  const currentLessonId = product.playlist[0];
  const currentLesson = product.lessons.find((item) => item.id === currentLessonId);
  if (!currentLesson) return null;

  const toggleSpeed = () => {
    if (speed === '1x') setSpeed('0.75x');
    else if (speed === '0.75x') setSpeed('1.25x');
    else setSpeed('1x');
  };

  return (
    <View style={styles.container}>
      <View style={styles.trackProgress}>
        <View style={[styles.fillProgress, { width: isPlaying ? '45%' : '10%' }]} />
      </View>
      <View style={styles.contentRow}>
        <Pressable onPress={() => router.push('/playlist')} style={styles.infoCol}>
          <SymbolView name="chevron.up" tintColor="#A0A5B0" size={14} />
          <Text style={styles.title} numberOfLines={1}>
            {currentLesson.title}
          </Text>
          <Text style={styles.timer}>
            0:02 / {Math.floor((currentLesson.durationSeconds || 120) / 60)}:
            {String((currentLesson.durationSeconds || 120) % 60).padStart(2, '0')}
          </Text>
        </Pressable>

        <View style={styles.controlsRow}>
          <Pressable
            accessibilityLabel="Reculer 5 secondes"
            onPress={() => {}}
            style={styles.controlBtn}>
            <SymbolView name="goforward.5" tintColor="#FFFFFF" size={18} />
          </Pressable>

          <Pressable
            accessibilityLabel={isPlaying ? 'Pause' : 'Lecture'}
            onPress={() => setIsPlaying(!isPlaying)}
            style={styles.playBtn}>
            <SymbolView
              name={isPlaying ? 'pause.fill' : 'play.fill'}
              tintColor="#1E1E1E"
              size={16}
            />
          </Pressable>

          <Pressable accessibilityLabel="Vitesse" onPress={toggleSpeed} style={styles.speedBtn}>
            <Text style={styles.speedText}>{speed}</Text>
          </Pressable>

          <Pressable
            accessibilityLabel="Fermer"
            onPress={() => product.removeFromPlaylist(currentLesson.id)}
            style={styles.controlBtn}>
            <SymbolView name="xmark" tintColor="#A0A5B0" size={16} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 64,
    borderRadius: 14,
    backgroundColor: '#1E1E1E',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 99,
  },
  trackProgress: {
    height: 3,
    backgroundColor: '#333333',
  },
  fillProgress: {
    height: '100%',
    backgroundColor: productTheme.green,
  },
  contentRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timer: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A0A5B0',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  controlBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  speedBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#333333',
  },
  speedText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
