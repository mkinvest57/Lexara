import { useMemo, useRef, useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

type Message = { id: string; role: 'learner' | 'coach'; text: string };

export default function CoachScreen() {
  const product = useProduct();
  const [lessonId, setLessonId] = useState(product.lessons[0]?.id ?? '');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const nextMessageId = useRef(0);
  const lesson = product.lessons.find((item) => item.id === lessonId);

  const suggestions = useMemo(
    () => [
      'Résume cette leçon en anglais simple.',
      'Pose-moi trois questions sur le texte.',
      'Aide-moi à utiliser mes mots sauvegardés.',
    ],
    [],
  );

  const send = (value = input) => {
    const clean = value.trim();
    if (!clean) return;
    nextMessageId.current += 1;
    const learner: Message = {
      id: `learner-${nextMessageId.current}`,
      role: 'learner',
      text: clean,
    };
    nextMessageId.current += 1;
    const coach: Message = {
      id: `coach-${nextMessageId.current}`,
      role: 'coach',
      text: buildOfflineAnswer(clean, lesson?.content ?? '', product.vocabulary.map((item) => item.term)),
    };
    setMessages((current) => [...current, learner, coach]);
    setInput('');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable accessibilityLabel="Fermer le coach Immerli" onPress={router.back} style={styles.headerButton}>
            <SymbolView name="xmark" tintColor={productTheme.ink} size={20} />
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.headerTitle}>Coach YAPRO</Text>
            <Text style={styles.headerMeta}>Coach local · vos données restent sur l’appareil</Text>
          </View>
          <View style={styles.headerButton}>
            <SymbolView name="sparkles" tintColor={productTheme.green} size={20} />
          </View>
        </View>

        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>CHOISIR UNE LEÇON RÉCENTE</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lessonRail}>
            {product.lessons.slice(0, 4).map((item) => (
              <Pressable
                key={item.id}
                accessibilityState={{ selected: lessonId === item.id }}
                onPress={() => setLessonId(item.id)}
                style={[styles.lessonChip, lessonId === item.id && styles.lessonChipActive]}>
                <Text
                  numberOfLines={1}
                  style={[styles.lessonChipText, lessonId === item.id && styles.lessonChipTextActive]}>
                  {item.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {!messages.length ? (
            <View style={styles.empty}>
              <View style={styles.coachIcon}>
                <SymbolView name="sparkles" tintColor={productTheme.green} size={32} />
              </View>
              <Text style={styles.emptyTitle}>What do you want to chat about today?</Text>
              <Text style={styles.emptyCopy}>
                Commencez avec une suggestion ou écrivez votre propre question.
              </Text>
              <View style={styles.suggestions}>
                {suggestions.map((suggestion) => (
                  <Pressable key={suggestion} onPress={() => send(suggestion)} style={styles.suggestion}>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    <SymbolView name="arrow.up.right" tintColor={productTheme.blue} size={14} />
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.messages}>
              {messages.map((message) => (
                <View
                  key={message.id}
                  style={[styles.message, message.role === 'learner' ? styles.learner : styles.coach]}>
                  <Text style={[styles.messageText, message.role === 'learner' && styles.learnerText]}>
                    {message.text}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            accessibilityLabel="Message pour le coach YAPRO"
            placeholder="Message au coach…"
            placeholderTextColor={productTheme.mutedLight}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => send()}
            returnKeyType="send"
            style={styles.input}
          />
          <Pressable
            accessibilityLabel="Envoyer le message"
            disabled={!input.trim()}
            onPress={() => send()}
            style={[styles.sendButton, !input.trim() && styles.sendDisabled]}>
            <SymbolView name="arrow.up" tintColor="#FFFFFF" size={18} />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function buildOfflineAnswer(prompt: string, content: string, vocabulary: string[]) {
  const normalized = prompt.toLocaleLowerCase();
  const sentences = content.match(/[^.!?]+[.!?]?/g)?.map((item) => item.trim()).filter(Boolean) ?? [];
  if (normalized.includes('résum')) {
    return `Simple summary: ${sentences.slice(0, 2).join(' ')}`;
  }
  if (normalized.includes('question')) {
    return [
      `1. What happens at the beginning of the lesson?`,
      `2. Which detail is most important?`,
      `3. How would you describe the main person or idea?`,
    ].join('\n');
  }
  if (normalized.includes('mots') || normalized.includes('vocab')) {
    if (!vocabulary.length) {
      return 'Sauvegardez d’abord quelques mots dans le lecteur. Je pourrai ensuite vous aider à les réutiliser dans des phrases.';
    }
    return `Try this: write one short sentence with ${vocabulary.slice(0, 3).join(', ')}. I will help you correct it.`;
  }
  return `Let’s use the lesson as context. Write one sentence in English about “${sentences[0]?.slice(0, 90) || 'today’s topic'}”, and I’ll help you make it clearer.`;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.surface,
  },
  keyboard: {
    flex: 1,
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: {
    minWidth: 0,
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: productTheme.ink,
  },
  headerMeta: {
    marginTop: 2,
    fontSize: 9,
    color: productTheme.muted,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 17,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: productTheme.muted,
  },
  lessonRail: {
    marginTop: 9,
    gap: 8,
  },
  lessonChip: {
    maxWidth: 230,
    minHeight: 38,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 19,
    backgroundColor: productTheme.surface,
    justifyContent: 'center',
  },
  lessonChipActive: {
    borderColor: productTheme.green,
    backgroundColor: productTheme.greenPale,
  },
  lessonChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.muted,
  },
  lessonChipTextActive: {
    color: productTheme.greenDark,
  },
  empty: {
    marginTop: 90,
    alignItems: 'center',
  },
  coachIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: productTheme.greenPale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: 22,
    maxWidth: 320,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: productTheme.ink,
    textAlign: 'center',
  },
  emptyCopy: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 19,
    color: productTheme.muted,
    textAlign: 'center',
  },
  suggestions: {
    width: '100%',
    marginTop: 24,
    gap: 8,
  },
  suggestion: {
    minHeight: 52,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  suggestionText: {
    minWidth: 0,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.ink,
  },
  messages: {
    marginTop: 26,
    gap: 10,
  },
  message: {
    maxWidth: '86%',
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 15,
  },
  learner: {
    alignSelf: 'flex-end',
    backgroundColor: productTheme.ink,
    borderBottomRightRadius: 4,
  },
  coach: {
    alignSelf: 'flex-start',
    backgroundColor: productTheme.background,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: productTheme.ink,
  },
  learnerText: {
    color: '#FFFFFF',
  },
  composer: {
    minHeight: 70,
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 15,
    borderRadius: 24,
    backgroundColor: productTheme.background,
    flex: 1,
    fontSize: 15,
    color: productTheme.ink,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: productTheme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.3,
  },
});
