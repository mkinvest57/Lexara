import { useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import {
  ActivityIndicator,
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

type ImportMode = 'url' | 'text' | null;

export default function ImportLessonScreen() {
  const { importLesson } = useProduct();
  const [mode, setMode] = useState<ImportMode>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const createTextLesson = () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || cleanContent.split(/\s+/).length < 8) {
      setError('Ajoutez un titre et au moins huit mots pour créer une leçon.');
      return;
    }
    const lesson = importLesson({ title: cleanTitle, content: cleanContent });
    router.replace({ pathname: '/lesson/[id]', params: { id: lesson.id } });
  };

  const createUrlLesson = async () => {
    setError('');
    let parsed: URL;
    try {
      parsed = new URL(url.trim());
      if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported');
    } catch {
      setError('Saisissez une adresse web complète commençant par http:// ou https://.');
      return;
    }

    setPending(true);
    try {
      const response = await fetch(parsed.toString(), {
        headers: { Accept: 'text/html, text/plain;q=0.9' },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const raw = await response.text();
      const detectedTitle =
        raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]
          ?.replace(/&[^;]+;/g, ' ')
          .replace(/\s+/g, ' ')
          .trim() || parsed.hostname;
      const detectedContent = raw
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/gi, "'")
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 30000);
      if (detectedContent.split(/\s+/).length < 20) {
        throw new Error('not-enough-readable-text');
      }
      const lesson = importLesson({
        title: detectedTitle.slice(0, 120),
        content: detectedContent,
        sourceUrl: parsed.toString(),
      });
      router.replace({ pathname: '/lesson/[id]', params: { id: lesson.id } });
    } catch {
      setError(
        "Cette page ne permet pas l'import direct. Copiez son texte et utilisez l'option Texte.",
      );
    } finally {
      setPending(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={mode ? 'Revenir aux options d’import' : 'Annuler l’import'}
            onPress={() => (mode ? setMode(null) : router.back())}
            style={styles.cancelButton}>
            <Text style={styles.cancelText}>{mode ? 'Retour' : 'Annuler'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Importer une leçon</Text>
          <View style={styles.headerSpacer} />
        </View>

        {!mode ? (
          <View style={styles.modeContent}>
            <Text style={styles.intro}>
              Transformez une page ou un texte autorisé en leçon interactive.
            </Text>
            <View style={styles.modeGrid}>
              <ModeButton
                label="URL"
                symbol="link"
                onPress={() => {
                  setError('');
                  setMode('url');
                }}
              />
              <ModeButton
                label="Texte"
                symbol="doc.text.fill"
                onPress={() => {
                  setError('');
                  setMode('text');
                }}
              />
            </View>
            <View style={styles.privacyCard}>
              <SymbolView name="checkmark.shield.fill" tintColor={productTheme.green} size={23} />
              <Text style={styles.privacyText}>
                Vous gardez le contrôle : rien n’est publié automatiquement.
              </Text>
            </View>
          </View>
        ) : (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.formContent}>
            <View style={styles.formIcon}>
              <SymbolView
                name={mode === 'url' ? 'link' : 'doc.text.fill'}
                tintColor={productTheme.blue}
                size={27}
              />
            </View>
            <Text style={styles.formTitle}>
              {mode === 'url' ? 'Importer depuis une URL' : 'Créer depuis un texte'}
            </Text>
            <Text style={styles.formCopy}>
              {mode === 'url'
                ? 'Immerli récupère le texte lisible de la page et le prépare pour le lecteur.'
                : 'Collez un texte en anglais. Chaque mot pourra ensuite être sélectionné et sauvegardé.'}
            </Text>

            {mode === 'url' ? (
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                accessibilityLabel="Adresse de la page à importer"
                placeholder="https://exemple.com/article"
                placeholderTextColor={productTheme.mutedLight}
                value={url}
                onChangeText={setUrl}
                style={styles.input}
              />
            ) : (
              <>
                <TextInput
                  accessibilityLabel="Titre de la leçon"
                  placeholder="Titre de la leçon"
                  placeholderTextColor={productTheme.mutedLight}
                  value={title}
                  onChangeText={setTitle}
                  style={styles.input}
                />
                <TextInput
                  multiline
                  textAlignVertical="top"
                  accessibilityLabel="Texte de la leçon"
                  placeholder="Collez votre texte ici…"
                  placeholderTextColor={productTheme.mutedLight}
                  value={content}
                  onChangeText={setContent}
                  style={[styles.input, styles.textarea]}
                />
              </>
            )}

            {error ? (
              <View accessibilityRole="alert" style={styles.error}>
                <SymbolView name="exclamationmark.circle.fill" tintColor={productTheme.red} size={19} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Créer la leçon interactive"
              disabled={pending}
              onPress={mode === 'url' ? createUrlLesson : createTextLesson}
              style={({ pressed }) => [
                styles.submitButton,
                pending && styles.submitDisabled,
                pressed && !pending && styles.pressed,
              ]}>
              {pending ? <ActivityIndicator color="#FFFFFF" /> : null}
              <Text style={styles.submitText}>
                {pending ? 'Import en cours…' : 'Créer la leçon interactive'}
              </Text>
            </Pressable>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ModeButton({
  label,
  symbol,
  onPress,
}: {
  label: string;
  symbol: string;
  onPress(): void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Importer par ${label}`}
      onPress={onPress}
      style={({ pressed }) => [styles.modeButton, pressed && styles.pressed]}>
      <View style={styles.modeIcon}>
        <SymbolView name={symbol as never} tintColor={productTheme.blue} size={47} />
      </View>
      <Text style={styles.modeLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  keyboard: {
    flex: 1,
  },
  header: {
    minHeight: 68,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelButton: {
    minWidth: 83,
    minHeight: 42,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 21,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111111',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: productTheme.ink,
  },
  headerSpacer: {
    width: 83,
  },
  modeContent: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 24,
  },
  intro: {
    alignSelf: 'center',
    maxWidth: 330,
    fontSize: 15,
    lineHeight: 22,
    color: productTheme.muted,
    textAlign: 'center',
  },
  modeGrid: {
    marginTop: 30,
    flexDirection: 'row',
    gap: 14,
  },
  modeButton: {
    minHeight: 205,
    flex: 1,
    borderRadius: 18,
    backgroundColor: productTheme.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIcon: {
    width: 92,
    height: 92,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeLabel: {
    marginTop: 12,
    fontSize: 25,
    fontWeight: '500',
    color: productTheme.ink,
  },
  privacyCard: {
    marginTop: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: productTheme.blue,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,.45)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  privacyText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: productTheme.blue,
  },
  formContent: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 40,
  },
  formIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: productTheme.bluePale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    marginTop: 19,
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: -0.4,
    color: productTheme.ink,
  },
  formCopy: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: productTheme.muted,
  },
  input: {
    minHeight: 55,
    marginTop: 19,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 12,
    backgroundColor: productTheme.surface,
    fontSize: 16,
    color: productTheme.ink,
  },
  textarea: {
    minHeight: 260,
    paddingTop: 15,
    lineHeight: 23,
  },
  error: {
    marginTop: 15,
    padding: 13,
    borderRadius: 11,
    backgroundColor: '#FDECEA',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
  },
  errorText: {
    minWidth: 0,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#A72D28',
  },
  submitButton: {
    minHeight: 54,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: productTheme.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  submitDisabled: {
    opacity: 0.58,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.67,
  },
});
