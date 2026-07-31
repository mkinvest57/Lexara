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

type ImportMode = 'url' | 'text' | 'file';
type LevelOption = 'Débutant 1' | 'Débutant 2' | 'Intermédiaire' | 'Avancé';

const levels: LevelOption[] = ['Débutant 1', 'Débutant 2', 'Intermédiaire', 'Avancé'];

export default function ImportLessonScreen() {
  const { importLesson, profile } = useProduct();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [mode, setMode] = useState<ImportMode>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LevelOption>(profile.level || 'Débutant 1');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleNextStep = async () => {
    setError('');
    if (mode === 'url') {
      let parsed: URL;
      try {
        parsed = new URL(url.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('unsupported');
      } catch {
        setError('Saisissez une adresse web valide (ex: https://example.com/article).');
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
          raw.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, ' ').trim() ||
          parsed.hostname;

        const bodyMatch = raw.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || raw;
        const textOnly = bodyMatch
          .replace(/<script[\s\S]*?<\/script>/gi, ' ')
          .replace(/<style[\s\S]*?<\/style>/gi, ' ')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

        if (textOnly.split(/\s+/).length < 8) {
          throw new Error('Contenu insuffisant extrait de cette URL.');
        }

        setTitle(detectedTitle);
        setContent(textOnly.slice(0, 4000));
        setStep(2);
      } catch (err: any) {
        setError(err?.message || 'Erreur lors de l’extraction de la page web.');
      } finally {
        setPending(false);
      }
    } else {
      if (!title.trim() || content.trim().split(/\s+/).length < 5) {
        setError('Entrez un titre et au moins 5 mots pour votre leçon.');
        return;
      }
      setStep(2);
    }
  };

  const handleFinalImport = () => {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle || !cleanContent) return;

    const lesson = importLesson({
      title: cleanTitle,
      content: cleanContent,
      level: selectedLevel,
      sourceUrl: mode === 'url' ? url.trim() : undefined,
    });

    router.replace({ pathname: '/lesson/[id]', params: { id: lesson.id } });
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>Importer une leçon</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          {/* Step indicator */}
          <View style={styles.stepBar}>
            <View style={[styles.stepItem, step >= 1 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>
              <Text style={styles.stepLabel}>Source</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.stepItem, step >= 2 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>
              <Text style={styles.stepLabel}>Niveau</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={[styles.stepItem, step >= 3 && styles.stepActive]}>
              <Text style={[styles.stepNum, step >= 3 && styles.stepNumActive]}>3</Text>
              <Text style={styles.stepLabel}>Aperçu</Text>
            </View>
          </View>

          {step === 1 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Source de la leçon</Text>
              <View style={styles.modeTabs}>
                <Pressable
                  onPress={() => setMode('text')}
                  style={[styles.modeTab, mode === 'text' && styles.modeTabActive]}>
                  <SymbolView
                    name="doc.plaintext"
                    tintColor={mode === 'text' ? productTheme.green : productTheme.muted}
                    size={18}
                  />
                  <Text style={[styles.modeTabText, mode === 'text' && styles.modeTabTextActive]}>
                    Texte libre
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('url')}
                  style={[styles.modeTab, mode === 'url' && styles.modeTabActive]}>
                  <SymbolView
                    name="link"
                    tintColor={mode === 'url' ? productTheme.green : productTheme.muted}
                    size={18}
                  />
                  <Text style={[styles.modeTabText, mode === 'url' && styles.modeTabTextActive]}>
                    Lien Web
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setMode('file')}
                  style={[styles.modeTab, mode === 'file' && styles.modeTabActive]}>
                  <SymbolView
                    name="doc.badge.plus"
                    tintColor={mode === 'file' ? productTheme.green : productTheme.muted}
                    size={18}
                  />
                  <Text style={[styles.modeTabText, mode === 'file' && styles.modeTabTextActive]}>
                    Fichier (.txt)
                  </Text>
                </Pressable>
              </View>

              {mode === 'url' ? (
                <View style={styles.formGroup}>
                  <Text style={styles.label}>URL de l'article ou histoire</Text>
                  <TextInput
                    value={url}
                    onChangeText={setUrl}
                    placeholder="https://example.com/article"
                    placeholderTextColor="#A0A5B0"
                    autoCapitalize="none"
                    keyboardType="url"
                    style={styles.input}
                  />
                </View>
              ) : (
                <>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Titre de la leçon</Text>
                    <TextInput
                      value={title}
                      onChangeText={setTitle}
                      placeholder="Ex: Mon premier chapitre"
                      placeholderTextColor="#A0A5B0"
                      style={styles.input}
                    />
                  </View>
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Texte en Anglais</Text>
                    <TextInput
                      value={content}
                      onChangeText={setContent}
                      placeholder="Collez ici le texte en anglais que vous souhaitez apprendre..."
                      placeholderTextColor="#A0A5B0"
                      multiline
                      numberOfLines={8}
                      textAlignVertical="top"
                      style={[styles.input, styles.textarea]}
                    />
                  </View>
                </>
              )}

              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Pressable
                onPress={handleNextStep}
                disabled={pending}
                style={[styles.primaryBtn, pending && styles.btnDisabled]}>
                {pending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Continuer</Text>
                    <SymbolView name="chevron.right" tintColor="#FFFFFF" size={16} />
                  </>
                )}
              </Pressable>
            </View>
          )}

          {step === 2 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Niveau de difficulté</Text>
              <Text style={styles.subCopy}>
                Sélectionnez le niveau qui correspond le mieux à ce contenu.
              </Text>

              <View style={styles.levelList}>
                {levels.map((lvl) => (
                  <Pressable
                    key={lvl}
                    onPress={() => setSelectedLevel(lvl)}
                    style={[styles.levelOption, selectedLevel === lvl && styles.levelOptionActive]}>
                    <View style={styles.levelRadio}>
                      {selectedLevel === lvl ? <View style={styles.levelRadioInner} /> : null}
                    </View>
                    <Text
                      style={[
                        styles.levelOptionText,
                        selectedLevel === lvl && styles.levelOptionTextActive,
                      ]}>
                      {lvl}
                    </Text>
                  </Pressable>
                ))}
              </View>

              <View style={styles.btnRow}>
                <Pressable onPress={() => setStep(1)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Retour</Text>
                </Pressable>
                <Pressable onPress={() => setStep(3)} style={[styles.primaryBtn, { flex: 1 }]}>
                  <Text style={styles.primaryBtnText}>Voir l'aperçu</Text>
                  <SymbolView name="chevron.right" tintColor="#FFFFFF" size={16} />
                </Pressable>
              </View>
            </View>
          )}

          {step === 3 && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Aperçu de la leçon</Text>

              <View style={styles.previewMeta}>
                <Text style={styles.previewTitle}>{title}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{selectedLevel}</Text>
                  </View>
                  <Text style={styles.wordCountText}>
                    {content.split(/\s+/).length} mots · ~
                    {Math.max(1, Math.round(content.split(/\s+/).length / 100))} min de lecture
                  </Text>
                </View>
              </View>

              <ScrollView style={styles.previewBox}>
                <Text style={styles.previewContent}>{content}</Text>
              </ScrollView>

              <View style={styles.btnRow}>
                <Pressable onPress={() => setStep(2)} style={styles.secondaryBtn}>
                  <Text style={styles.secondaryBtnText}>Modifier</Text>
                </Pressable>
                <Pressable onPress={handleFinalImport} style={[styles.primaryBtn, { flex: 1 }]}>
                  <SymbolView name="checkmark" tintColor="#FFFFFF" size={16} />
                  <Text style={styles.primaryBtnText}>Importer & Lire</Text>
                </Pressable>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  header: {
    height: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.line,
    backgroundColor: productTheme.surface,
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: productTheme.ink,
  },
  container: {
    padding: 16,
  },
  stepBar: {
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
    opacity: 0.4,
  },
  stepActive: {
    opacity: 1,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: productTheme.line,
    fontSize: 12,
    fontWeight: '800',
    color: productTheme.ink,
    textAlign: 'center',
    lineHeight: 24,
  },
  stepNumActive: {
    backgroundColor: productTheme.green,
    color: '#FFFFFF',
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: productTheme.ink,
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginHorizontal: 10,
    backgroundColor: productTheme.line,
  },
  card: {
    padding: 20,
    borderRadius: 20,
    backgroundColor: productTheme.surface,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: productTheme.ink,
    marginBottom: 8,
  },
  subCopy: {
    fontSize: 13,
    color: productTheme.muted,
    marginBottom: 16,
  },
  modeTabs: {
    marginBottom: 16,
    flexDirection: 'row',
    gap: 10,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: productTheme.line,
    backgroundColor: productTheme.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modeTabActive: {
    borderColor: productTheme.green,
    backgroundColor: productTheme.greenPale,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: '700',
    color: productTheme.muted,
  },
  modeTabTextActive: {
    color: productTheme.greenDark,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.ink,
  },
  input: {
    minHeight: 48,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 12,
    backgroundColor: productTheme.surface,
    fontSize: 15,
    color: productTheme.ink,
  },
  textarea: {
    minHeight: 140,
    paddingTop: 12,
    paddingBottom: 12,
  },
  errorText: {
    marginBottom: 12,
    fontSize: 13,
    fontWeight: '600',
    color: productTheme.red,
  },
  primaryBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: productTheme.green,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  btnDisabled: {
    opacity: 0.6,
  },
  secondaryBtn: {
    height: 50,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: productTheme.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: productTheme.ink,
  },
  btnRow: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 10,
  },
  levelList: {
    gap: 10,
    marginBottom: 10,
  },
  levelOption: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: productTheme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  levelOptionActive: {
    borderColor: productTheme.green,
    backgroundColor: productTheme.greenPale,
  },
  levelRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: productTheme.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: productTheme.green,
  },
  levelOptionText: {
    fontSize: 15,
    fontWeight: '700',
    color: productTheme.ink,
  },
  levelOptionTextActive: {
    color: productTheme.greenDark,
  },
  previewMeta: {
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: productTheme.ink,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: productTheme.greenPale,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: productTheme.greenDark,
  },
  wordCountText: {
    fontSize: 12,
    color: productTheme.muted,
  },
  previewBox: {
    maxHeight: 220,
    padding: 14,
    borderRadius: 12,
    backgroundColor: productTheme.background,
  },
  previewContent: {
    fontSize: 14,
    lineHeight: 22,
    color: productTheme.ink,
  },
});
