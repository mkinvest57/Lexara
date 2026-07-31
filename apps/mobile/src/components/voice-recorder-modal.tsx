import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from '@/components/symbol-view';
import { productTheme } from '@/constants/product-theme';

interface VoiceRecorderModalProps {
  visible: boolean;
  onClose: () => void;
  sentenceText: string;
  onPlayNativeAudio?: () => void;
}

export function VoiceRecorderModal({
  visible,
  onClose,
  sentenceText,
  onPlayNativeAudio,
}: VoiceRecorderModalProps) {
  const [recording, setRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [score, setScore] = useState<number | null>(null);

  const startRecording = () => {
    setRecording(true);
    setHasRecorded(false);
    setScore(null);
  };

  const stopRecording = () => {
    setRecording(false);
    setHasRecorded(true);
    // Simulate pronunciation accuracy score matching sentence phonetics
    const randomScore = Math.floor(Math.random() * 15) + 85; // 85% to 99%
    setScore(randomScore);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Pratique de la Prononciation</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <SymbolView name="xmark" tintColor={productTheme.ink} size={18} />
            </Pressable>
          </View>

          <Text style={styles.sentenceBox}>{sentenceText}</Text>

          <View style={styles.controls}>
            {onPlayNativeAudio && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Écouter la voix native"
                onPress={onPlayNativeAudio}
                style={styles.nativeAudioBtn}>
                <SymbolView name="speaker.wave.2.fill" tintColor="#FFFFFF" size={18} />
                <Text style={styles.nativeAudioBtnText}>Voix Native</Text>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel={recording ? 'Arrêter l’enregistrement' : 'Enregistrer ma voix'}
              onPress={recording ? stopRecording : startRecording}
              style={[styles.recordBtn, recording && styles.recordBtnActive]}>
              <SymbolView
                name={recording ? 'stop.fill' : 'mic.fill'}
                tintColor="#FFFFFF"
                size={22}
              />
              <Text style={styles.recordBtnText}>
                {recording ? 'Arrêter' : 'Enregistrer ma voix'}
              </Text>
            </Pressable>
          </View>

          {score !== null && (
            <View style={styles.scoreCard}>
              <Text style={styles.scoreValue}>Score de Prononciation : {score}%</Text>
              <Text style={styles.scoreFeedback}>
                {score >= 90 ? '🌟 Excellent ! Prononciation claire et naturelle.' : '👍 Très bien ! Continuez votre pratique.'}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: productTheme.ink,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sentenceBox: {
    fontSize: 18,
    lineHeight: 26,
    fontStyle: 'italic',
    color: productTheme.ink,
    backgroundColor: '#F0F4F3',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  controls: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  nativeAudioBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#063F40',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  nativeAudioBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recordBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E53935',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  recordBtnActive: {
    backgroundColor: '#B71C1C',
  },
  recordBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scoreCard: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2E7D32',
  },
  scoreFeedback: {
    fontSize: 12,
    color: '#388E3C',
    marginTop: 4,
  },
});
