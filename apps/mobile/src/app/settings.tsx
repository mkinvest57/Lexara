import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProduct } from '@/lib/product-store';
import { getPreferredEnglishVoice, speakEnglish } from '@/lib/speech';
import { productTheme } from '@/constants/product-theme';

type Tab = 'App' | 'Langues' | 'Lecteur' | 'Réviser';

export default function SettingsScreen() {
  const product = useProduct();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('App');
  const [voiceName, setVoiceName] = useState('Voix anglaise du système');

  useEffect(() => {
    let active = true;
    getPreferredEnglishVoice().then((voice) => {
      if (active && voice) setVoiceName(voice.name);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <SafeAreaView style={styles.screen} edges={['top']}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="Fermer les paramètres" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.headerButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={20} />
        </Pressable>
        <Text style={styles.headerTitle}>paramètres</Text>
        <Pressable accessibilityLabel="Enregistrer et fermer" onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={styles.doneButton}>
          <SymbolView name="checkmark" tintColor="#FFFFFF" size={20} />
        </Pressable>
      </View>
      <View style={styles.tabs}>
        {(['App', 'Langues', 'Lecteur', 'Réviser'] as const).map((item) => (
          <Pressable
            key={item}
            accessibilityState={{ selected: tab === item }}
            onPress={() => setTab(item)}
            style={[styles.tab, tab === item && styles.tabActive]}>
            <Text style={[styles.tabText, tab === item && styles.tabTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 40 }]}>
        {tab === 'App' ? (
          <>
            <SectionTitle>COMPTE</SectionTitle>
            <View style={styles.group}>
              <SettingLink label={product.profile.displayName} value="Profil" onPress={() => router.push('/profile')} />
              <SettingLink label="Mon abonnement" value="Gratuit" onPress={() => router.push('/profile')} />
            </View>
            <SectionTitle>PRÉFÉRENCES</SectionTitle>
            <View style={styles.group}>
              <SettingSwitch
                label="Rappel quotidien"
                copy="Conserver un rythme d'apprentissage"
                value={product.preferences.dailyReminder}
                onChange={(value) => product.updatePreferences({ dailyReminder: value })}
              />
              <SettingLink label="Objectif journalier" value={`${product.profile.dailyMinutes} min`} onPress={() => router.push('/stats')} />
            </View>
            <SectionTitle>PARCOURS & STOCKAGE</SectionTitle>
            <View style={styles.group}>
              <SettingLink
                label="Vider le cache de stockage"
                value="Nettoyer (430 ko)"
                onPress={() => {
                  alert("Le cache de stockage de l'application a été vidé avec succès.");
                }}
              />
              <SettingLink
                label="Recommencer l'onboarding"
                value=""
                destructive
                onPress={() => {
                  product.resetOnboarding();
                  router.replace('/onboarding');
                }}
              />
            </View>
          </>
        ) : null}

        {tab === 'Langues' ? (
          <>
            <SectionTitle>ANGLAIS</SectionTitle>
            <View style={styles.group}>
              <SettingLink label="Niveau" value={product.profile.level} onPress={() => router.push('/languages')} />
              <SettingLink label="Objectif journalier" value={`${product.profile.dailyWordGoal} mots`} onPress={() => router.push('/stats')} />
              <SettingLink label="Sujets préférés" value={`${product.profile.interests.length}`} onPress={() => router.push('/languages')} />
            </View>
            <SectionTitle>TOUTES LES LANGUES</SectionTitle>
            <View style={styles.group}>
              <SettingLink label="anglais" value="Active" onPress={() => router.push('/languages')} />
            </View>
          </>
        ) : null}

        {tab === 'Lecteur' ? (
          <>
            <SectionTitle>POLICE</SectionTitle>
            <View style={styles.group}>
              <View style={styles.stepperRow}>
                <View>
                  <Text style={styles.settingTitle}>Taille du texte</Text>
                  <Text style={styles.settingCopy}>
                    {(product.preferences.readerFontScale * 100).toFixed(0)}% Taille Police
                  </Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    accessibilityLabel="Réduire la taille du texte"
                    onPress={() =>
                      product.updatePreferences({
                        readerFontScale: Math.max(0.8, product.preferences.readerFontScale - 0.1),
                      })
                    }
                    style={styles.stepperButton}>
                    <SymbolView name="minus" tintColor={productTheme.blue} size={15} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Augmenter la taille du texte"
                    onPress={() =>
                      product.updatePreferences({
                        readerFontScale: Math.min(1.4, product.preferences.readerFontScale + 0.1),
                      })
                    }
                    style={styles.stepperButton}>
                    <SymbolView name="plus" tintColor={productTheme.blue} size={15} />
                  </Pressable>
                </View>
              </View>
            </View>
            <SectionTitle>LECTURE DU TEXTE</SectionTitle>
            <View style={styles.group}>
              <SettingSwitch
                label="Lecture automatique"
                copy="Lire le texte à l'ouverture"
                value={product.preferences.autoplayAudio}
                onChange={(value) => product.updatePreferences({ autoplayAudio: value })}
              />
              <SettingSwitch
                label="Phrase & Traduction"
                copy="Afficher le mode phrase dans le lecteur"
                value={product.preferences.phraseMode}
                onChange={(value) => product.updatePreferences({ phraseMode: value })}
              />
            </View>
            <SectionTitle>VOIX</SectionTitle>
            <View style={styles.group}>
              <View style={styles.settingRow}>
                <View style={styles.settingCopyWrap}>
                  <Text style={styles.settingTitle}>Voix anglaise</Text>
                  <Text numberOfLines={1} style={styles.settingCopy}>{voiceName}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Écouter un aperçu de la voix"
                  onPress={() =>
                    speakEnglish('Welcome to YAPRO. Read, listen, and learn naturally.', {
                      rate: product.preferences.speechRate,
                    })
                  }
                  style={styles.previewVoiceButton}>
                  <SymbolView name="speaker.wave.2.fill" tintColor={productTheme.blue} size={18} />
                </Pressable>
              </View>
              <View style={styles.stepperRow}>
                <View>
                  <Text style={styles.settingTitle}>Vitesse</Text>
                  <Text style={styles.settingCopy}>{product.preferences.speechRate.toFixed(2)}x</Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    accessibilityLabel="Ralentir la voix"
                    onPress={() =>
                      product.updatePreferences({
                        speechRate: Math.max(0.65, product.preferences.speechRate - 0.05),
                      })
                    }
                    style={styles.stepperButton}>
                    <SymbolView name="minus" tintColor={productTheme.blue} size={15} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Accélérer la voix"
                    onPress={() =>
                      product.updatePreferences({
                        speechRate: Math.min(1.1, product.preferences.speechRate + 0.05),
                      })
                    }
                    style={styles.stepperButton}>
                    <SymbolView name="plus" tintColor={productTheme.blue} size={15} />
                  </Pressable>
                </View>
              </View>
            </View>
          </>
        ) : null}

        {tab === 'Réviser' ? (
          <>
            <SectionTitle>GÉNÉRAL</SectionTitle>
            <View style={styles.group}>
              <View style={styles.stepperRow}>
                <View>
                  <Text style={styles.settingTitle}>Cartes par session</Text>
                  <Text style={styles.settingCopy}>{product.preferences.reviewSessionSize} cartes maximum</Text>
                </View>
                <View style={styles.stepper}>
                  <Pressable
                    accessibilityLabel="Réduire le nombre de cartes"
                    onPress={() =>
                      product.updatePreferences({
                        reviewSessionSize: Math.max(5, product.preferences.reviewSessionSize - 5),
                      })
                    }
                    style={styles.stepperButton}>
                    <SymbolView name="minus" tintColor={productTheme.blue} size={15} />
                  </Pressable>
                  <Pressable
                    accessibilityLabel="Augmenter le nombre de cartes"
                    onPress={() =>
                      product.updatePreferences({
                        reviewSessionSize: Math.min(30, product.preferences.reviewSessionSize + 5),
                      })
                    }
                    style={styles.stepperButton}>
                    <SymbolView name="plus" tintColor={productTheme.blue} size={15} />
                  </Pressable>
                </View>
              </View>
              <SettingSwitch
                label="Cartes mémoire"
                copy="Afficher la traduction après le retournement"
                value
                onChange={() => undefined}
                locked
              />
              <SettingLink label="Mots à réviser" value={`${product.dueVocabulary.length}`} onPress={() => router.push('/review')} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

function SettingLink({
  label,
  value,
  onPress,
  destructive = false,
}: {
  label: string;
  value: string;
  onPress(): void;
  destructive?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.pressed]}>
      <Text style={[styles.settingTitle, destructive && styles.destructive]}>{label}</Text>
      <View style={styles.settingValueRow}>
        {value ? <Text style={styles.settingValue}>{value}</Text> : null}
        <SymbolView name="chevron.right" tintColor={productTheme.mutedLight} size={15} />
      </View>
    </Pressable>
  );
}

function SettingSwitch({
  label,
  copy,
  value,
  onChange,
  locked = false,
}: {
  label: string;
  copy: string;
  value: boolean;
  onChange(value: boolean): void;
  locked?: boolean;
}) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingCopyWrap}>
        <Text style={styles.settingTitle}>{label}</Text>
        <Text style={styles.settingCopy}>{copy}</Text>
      </View>
      <Switch
        disabled={locked}
        value={value}
        onValueChange={onChange}
        trackColor={{ false: '#D7DADF', true: '#6EB4F4' }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: productTheme.background,
  },
  header: {
    minHeight: 59,
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
    fontSize: 16,
    fontWeight: '800',
    color: '#111111',
  },
  doneButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: productTheme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    marginHorizontal: 10,
    padding: 4,
    borderRadius: 10,
    backgroundColor: '#E1E3E7',
    flexDirection: 'row',
  },
  tab: {
    minHeight: 36,
    flex: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: productTheme.surface,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '700',
    color: productTheme.muted,
  },
  tabTextActive: {
    color: productTheme.ink,
  },
  content: {
    paddingBottom: 40,
  },
  sectionTitle: {
    marginTop: 21,
    marginBottom: 7,
    paddingHorizontal: 17,
    fontSize: 11,
    fontWeight: '800',
    color: productTheme.muted,
  },
  group: {
    overflow: 'hidden',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: productTheme.line,
    backgroundColor: productTheme.surface,
  },
  settingRow: {
    minHeight: 61,
    paddingHorizontal: 17,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: productTheme.lineSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  settingCopyWrap: {
    minWidth: 0,
    flex: 1,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111111',
  },
  settingCopy: {
    marginTop: 3,
    fontSize: 10,
    color: productTheme.muted,
  },
  settingValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingValue: {
    fontSize: 13,
    fontWeight: '700',
    color: productTheme.blue,
  },
  destructive: {
    color: productTheme.red,
  },
  stepperRow: {
    minHeight: 73,
    paddingHorizontal: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: productTheme.blue,
    borderRadius: 7,
    flexDirection: 'row',
  },
  stepperButton: {
    width: 36,
    height: 32,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: productTheme.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewVoiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: productTheme.bluePale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.65,
  },
});
