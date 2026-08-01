import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { ImageBackground } from 'expo-image';
import { SymbolView } from '@/components/symbol-view';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProduct } from '@/lib/product-store';
import { productTheme } from '@/constants/product-theme';

const hero = require('@/assets/images/yapro-hero.png');

type Choice = {
  id: string;
  label: string;
  sublabel?: string;
  symbol: string;
};

const languageChoices: Choice[] = [
  { id: 'en', label: 'anglais', symbol: 'globe.europe.africa.fill' },
  { id: 'zh', label: 'chinois (Simplifié)', symbol: 'globe.asia.australia.fill' },
  { id: 'de', label: 'allemand', symbol: 'globe.europe.africa.fill' },
  { id: 'es', label: 'espagnol', symbol: 'globe.americas.fill' },
  { id: 'fr', label: 'français', symbol: 'globe.europe.africa.fill' },
  { id: 'it', label: 'italien', symbol: 'globe.europe.africa.fill' },
  { id: 'ja', label: 'japonais', symbol: 'globe.asia.australia.fill' },
  { id: 'ko', label: 'coréen', symbol: 'globe.asia.australia.fill' },
];

const reasonChoices: Choice[] = [
  { id: 'travel', label: 'Voyager et découvrir le monde', symbol: 'airplane' },
  { id: 'career', label: 'Booster ma carrière ou mes études', symbol: 'briefcase.fill' },
  { id: 'culture', label: 'Profiter de la culture', symbol: 'theatermasks.fill' },
  { id: 'family', label: 'Me rapprocher de ma famille et de mes amis', symbol: 'person.2.fill' },
  { id: 'mind', label: 'Garder mon cerveau vif', symbol: 'brain.head.profile' },
];

const skillChoices: Choice[] = [
  { id: 'listen', label: 'Écoute', symbol: 'headphones' },
  { id: 'speak', label: 'Expression orale', symbol: 'waveform' },
  { id: 'grammar', label: 'Grammaire', symbol: 'text.book.closed.fill' },
  { id: 'vocabulary', label: 'Vocabulaire', symbol: 'character.book.closed.fill' },
  { id: 'reading', label: 'Lecture', symbol: 'book.pages.fill' },
  { id: 'writing', label: 'Écriture', symbol: 'pencil.line' },
];

const interestChoices: Choice[] = [
  { id: 'entertainment', label: 'Divertissement', symbol: 'popcorn.fill' },
  { id: 'food', label: 'Alimentation', symbol: 'cup.and.saucer.fill' },
  { id: 'health', label: 'Santé', symbol: 'heart.fill' },
  { id: 'children', label: 'Enfants', symbol: 'figure.2.and.child.holdinghands' },
  { id: 'lifestyle', label: 'Style de vie', symbol: 'house.fill' },
  { id: 'sport', label: 'Sport', symbol: 'figure.run' },
  { id: 'travel', label: 'Voyage', symbol: 'airplane' },
];

const learningModes: Choice[] = [
  { id: 'immersive', label: 'Immersif', sublabel: 'Histoires réelles, podcasts et émissions', symbol: 'headphones' },
  { id: 'autonomous', label: 'Autonome', sublabel: "Contrôlez votre expérience d'apprentissage", symbol: 'safari.fill' },
  { id: 'guided', label: 'Guidé', sublabel: 'Suivez un parcours clair et recommandé', symbol: 'graduationcap.fill' },
  { id: 'interactive', label: 'Interactif', sublabel: 'Apprenez en discutant et en vous entraînant', symbol: 'message.fill' },
];

const minuteChoices = [
  { minutes: 10, label: 'Décontracté' },
  { minutes: 20, label: 'Constant' },
  { minutes: 40, label: 'Passionné' },
  { minutes: 60, label: 'Intensif' },
];

export default function OnboardingScreen() {
  const { finishOnboarding } = useProduct();
  const [step, setStep] = useState(0);
  const [language, setLanguage] = useState('en');
  const [reason, setReason] = useState<string>();
  const [level, setLevel] = useState<'Débutant 1' | 'Débutant 2' | 'Intermédiaire' | 'Avancé'>();
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [learningMode, setLearningMode] = useState<string>();
  const [minutes, setMinutes] = useState(20);

  const totalSteps = 8;
  const canContinue = useMemo(() => {
    if (step === 1) return language === 'en';
    if (step === 2) return Boolean(reason);
    if (step === 3) return Boolean(level);
    if (step === 4) return skills.length > 0;
    if (step === 5) return interests.length > 0;
    if (step === 6) return Boolean(learningMode);
    return true;
  }, [interests.length, language, learningMode, level, reason, skills.length, step]);

  const next = () => {
    if (step < totalSteps - 1) {
      setStep((value) => value + 1);
      return;
    }
    finishOnboarding({
      targetLanguage: 'en',
      targetLanguageLabel: 'anglais',
      level: level ?? 'Débutant 1',
      dailyMinutes: minutes,
      dailyWordGoal: minutes <= 10 ? 50 : minutes <= 20 ? 100 : minutes <= 40 ? 200 : 400,
      interests,
    });
    router.replace('/');
  };

  if (step === 0) {
    return (
      <View style={styles.welcomeScreen}>
        <ImageBackground source={hero} style={styles.welcomeImage} contentFit="cover">
          <View style={styles.welcomeShade} />
          <SafeAreaView style={styles.welcomeContent}>
            <View style={styles.welcomeBrand}>
              <View style={styles.brandMark}>
                <SymbolView name="text.book.closed.fill" tintColor="#FFFFFF" size={25} />
              </View>
              <Text style={styles.brandName}>YAPRO</Text>
            </View>
            <View style={styles.welcomeBottom}>
              <Text style={styles.welcomeTitle}>Apprenez des langues avec du contenu que vous aimez</Text>
              <Text style={styles.welcomeCopy}>
                Lisez, écoutez et transformez chaque mot en progrès concret.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Démarrer"
                onPress={next}
                style={({ pressed }) => [styles.welcomePrimary, pressed && styles.pressed]}>
                <Text style={styles.welcomePrimaryText}>Démarrer</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </ImageBackground>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.progressHeader}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Revenir à l’étape précédente"
          onPress={() => setStep((value) => Math.max(0, value - 1))}
          style={styles.backButton}>
          <SymbolView name="chevron.left" tintColor={productTheme.ink} size={19} />
        </Pressable>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / (totalSteps - 1)) * 100}%` }]} />
        </View>
      </View>
      <ScrollView
        contentContainerStyle={styles.stepContent}
        showsVerticalScrollIndicator={false}>
        {step === 1 ? (
          <ChoiceList
            title="Quelle langue souhaitez-vous apprendre ?"
            choices={languageChoices}
            selected={[language]}
            onToggle={(id) => setLanguage(id)}
          />
        ) : null}
        {step === 2 ? (
          <ChoiceList
            title="Pourquoi voulez-vous apprendre anglais ?"
            choices={reasonChoices}
            selected={reason ? [reason] : []}
            onToggle={setReason}
          />
        ) : null}
        {step === 3 ? (
          <View>
            <Text style={styles.stepTitle}>Comment évalueriez-vous votre niveau actuel ?</Text>
            <Text style={styles.stepSubtitle}>Vous pourrez l’ajuster plus tard.</Text>
            <View style={styles.levelList}>
              {(['Débutant 1', 'Débutant 2', 'Intermédiaire', 'Avancé'] as const).map(
                (item, index) => (
                  <Pressable
                    key={item}
                    onPress={() => setLevel(item)}
                    style={[styles.levelCard, level === item && styles.choiceSelected]}>
                    <View style={styles.levelBars}>
                      {[0, 1, 2, 3].map((bar) => (
                        <View
                          key={bar}
                          style={[
                            styles.levelBar,
                            { height: 6 + bar * 5 },
                            bar <= index && styles.levelBarActive,
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.levelLabel}>{item}</Text>
                  </Pressable>
                ),
              )}
            </View>
          </View>
        ) : null}
        {step === 4 ? (
          <ChoiceList
            title="Sur quelles compétences voulez-vous vous concentrer ?"
            subtitle="Sélectionnez toutes les compétences concernées."
            choices={skillChoices}
            selected={skills}
            onToggle={(id) =>
              setSkills((current) =>
                current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
              )
            }
          />
        ) : null}
        {step === 5 ? (
          <ChoiceList
            title="Quels sujets aimez-vous ?"
            subtitle="Choisissez vos centres d’intérêt."
            choices={interestChoices}
            selected={interests}
            grid
            onToggle={(id) =>
              setInterests((current) =>
                current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
              )
            }
          />
        ) : null}
        {step === 6 ? (
          <ChoiceList
            title="Comment souhaitez-vous apprendre anglais ?"
            choices={learningModes}
            selected={learningMode ? [learningMode] : []}
            onToggle={setLearningMode}
          />
        ) : null}
        {step === 7 ? (
          <View>
            <Text style={styles.stepTitle}>
              Combien de temps pouvez-vous consacrer à l’apprentissage de l’anglais ?
            </Text>
            <View style={styles.minutesList}>
              {minuteChoices.map((item) => (
                <Pressable
                  key={item.minutes}
                  onPress={() => setMinutes(item.minutes)}
                  style={[styles.minuteCard, minutes === item.minutes && styles.choiceSelected]}>
                  <Text style={styles.minuteValue}>{item.minutes} min/jour</Text>
                  <Text style={styles.minuteLabel}>{item.label}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.summaryCard}>
              <SymbolView name="checkmark.circle.fill" tintColor={productTheme.green} size={26} />
              <View style={styles.summaryCopy}>
                <Text style={styles.summaryTitle}>Votre espace est prêt</Text>
                <Text style={styles.summaryText}>
                  Objectif : {minutes} minutes par jour, avec des leçons adaptées à votre niveau.
                </Text>
              </View>
            </View>
          </View>
        ) : null}
      </ScrollView>
      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={step === totalSteps - 1 ? 'Créer mon espace' : 'Continuer'}
          disabled={!canContinue}
          onPress={next}
          style={({ pressed }) => [
            styles.primaryButton,
            !canContinue && styles.primaryDisabled,
            pressed && canContinue && styles.pressed,
          ]}>
          <Text style={styles.primaryText}>
            {step === totalSteps - 1 ? 'Créer mon espace' : 'Continuer'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function ChoiceList({
  title,
  subtitle,
  choices,
  selected,
  onToggle,
  grid = false,
}: {
  title: string;
  subtitle?: string;
  choices: Choice[];
  selected: string[];
  onToggle(id: string): void;
  grid?: boolean;
}) {
  return (
    <View>
      <Text style={styles.stepTitle}>{title}</Text>
      {subtitle ? <Text style={styles.stepSubtitle}>{subtitle}</Text> : null}
      <View style={[styles.choiceList, grid && styles.choiceGrid]}>
        {choices.map((choice) => {
          const active = selected.includes(choice.id);
          return (
            <Pressable
              key={choice.id}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => onToggle(choice.id)}
              style={[
                styles.choice,
                grid && styles.choiceGridItem,
                active && styles.choiceSelected,
              ]}>
              <View style={[styles.choiceIcon, active && styles.choiceIconActive]}>
                <SymbolView
                  name={choice.symbol as never}
                  tintColor={active ? '#FFFFFF' : productTheme.blue}
                  size={18}
                />
              </View>
              <View style={styles.choiceCopy}>
                <Text style={styles.choiceLabel}>{choice.label}</Text>
                {choice.sublabel ? <Text style={styles.choiceSublabel}>{choice.sublabel}</Text> : null}
              </View>
              {active ? (
                <SymbolView name="checkmark.circle.fill" tintColor={productTheme.green} size={21} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  welcomeScreen: {
    flex: 1,
    backgroundColor: productTheme.ink,
  },
  welcomeImage: {
    flex: 1,
  },
  welcomeShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(7,18,35,.56)',
  },
  welcomeContent: {
    flex: 1,
    paddingHorizontal: 22,
  },
  welcomeBrand: {
    marginTop: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 31,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  welcomeBottom: {
    marginTop: 'auto',
    paddingBottom: 28,
  },
  welcomeTitle: {
    fontSize: 37,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  welcomeCopy: {
    marginTop: 15,
    fontSize: 16,
    lineHeight: 23,
    color: 'rgba(255,255,255,.82)',
    textAlign: 'center',
  },
  welcomePrimary: {
    minHeight: 54,
    marginTop: 26,
    borderRadius: 8,
    backgroundColor: '#4DAA65',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomePrimaryText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  screen: {
    flex: 1,
    backgroundColor: productTheme.surface,
  },
  progressHeader: {
    minHeight: 58,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: productTheme.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTrack: {
    height: 5,
    flex: 1,
    overflow: 'hidden',
    borderRadius: 4,
    backgroundColor: '#E2E4E7',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: productTheme.ink,
  },
  stepContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 120,
  },
  stepTitle: {
    maxWidth: 500,
    alignSelf: 'center',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '900',
    letterSpacing: -0.5,
    color: productTheme.ink,
    textAlign: 'center',
  },
  stepSubtitle: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: productTheme.muted,
    textAlign: 'center',
  },
  choiceList: {
    marginTop: 24,
    gap: 9,
  },
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  choice: {
    minHeight: 58,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 10,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  choiceGridItem: {
    width: '48.6%',
    minHeight: 92,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceSelected: {
    borderColor: productTheme.green,
    backgroundColor: productTheme.greenPale,
  },
  choiceIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: productTheme.bluePale,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconActive: {
    backgroundColor: productTheme.blue,
  },
  choiceCopy: {
    minWidth: 0,
    flex: 1,
  },
  choiceLabel: {
    fontSize: 15,
    lineHeight: 19,
    fontWeight: '700',
    color: productTheme.ink,
  },
  choiceSublabel: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 15,
    color: productTheme.muted,
  },
  levelList: {
    marginTop: 24,
    gap: 10,
  },
  levelCard: {
    minHeight: 83,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 10,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  levelBars: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  levelBar: {
    width: 7,
    borderRadius: 2,
    backgroundColor: '#D8DADF',
  },
  levelBarActive: {
    backgroundColor: productTheme.green,
  },
  levelLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: productTheme.ink,
  },
  minutesList: {
    marginTop: 25,
    gap: 10,
  },
  minuteCard: {
    minHeight: 58,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: productTheme.line,
    borderRadius: 9,
    backgroundColor: productTheme.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  minuteValue: {
    fontSize: 15,
    fontWeight: '700',
    color: productTheme.ink,
  },
  minuteLabel: {
    fontSize: 14,
    color: productTheme.muted,
  },
  summaryCard: {
    marginTop: 24,
    padding: 17,
    borderRadius: 14,
    backgroundColor: productTheme.greenPale,
    flexDirection: 'row',
    gap: 12,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: productTheme.ink,
  },
  summaryText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: productTheme.inkSoft,
  },
  footer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: productTheme.lineSoft,
    backgroundColor: 'rgba(255,255,255,.97)',
  },
  primaryButton: {
    minHeight: 54,
    borderRadius: 8,
    backgroundColor: productTheme.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryDisabled: {
    backgroundColor: '#DCE9DF',
  },
  primaryText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  pressed: {
    opacity: 0.67,
  },
});
