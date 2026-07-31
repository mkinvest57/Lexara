export type LessonLevel = 'Débutant 1' | 'Débutant 2' | 'Intermédiaire' | 'Avancé';
export type LessonKind = 'Mini-histoire' | 'Cours' | 'Actualité' | 'Podcast';

export type BaseLanguage = 'fr' | 'en' | 'es' | 'it' | 'de' | 'ar';

export type Lesson = {
  id: string;
  title: string;
  collection: string;
  language: string;
  level: LessonLevel;
  kind: LessonKind;
  content: string;
  translation?: string;
  durationSeconds: number;
  imagePosition: string;
  imported?: boolean;
  sourceUrl?: string;
};

export type DictionaryEntry = {
  translation: string;
  lemma?: string;
};

export interface LanguageDef {
  code: string;
  nameFr?: string;
  nameEn?: string;
  name?: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageDef[] = [
  { code: 'en', nameFr: 'anglais', nameEn: 'English', flag: '🇬🇧' },
  { code: 'es', nameFr: 'espagnol', nameEn: 'Spanish', flag: '🇪🇸' },
  { code: 'de', nameFr: 'allemand', nameEn: 'German', flag: '🇩🇪' },
  { code: 'fr', nameFr: 'français', nameEn: 'French', flag: '🇫🇷' },
  { code: 'it', nameFr: 'italien', nameEn: 'Italian', flag: '🇮🇹' },
  { code: 'pt', nameFr: 'portugais', nameEn: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', nameFr: 'russe', nameEn: 'Russian', flag: '🇷🇺' },
  { code: 'ja', nameFr: 'japonais', nameEn: 'Japanese', flag: '🇯🇵' },
  { code: 'zh', nameFr: 'chinois (simplifié)', nameEn: 'Chinese (Simplified)', flag: '🇨🇳' },
  { code: 'zh-trad', nameFr: 'chinois (traditionnel)', nameEn: 'Chinese (Traditional)', flag: '🇹🇼' },
  { code: 'ko', nameFr: 'coréen', nameEn: 'Korean', flag: '🇰🇷' },
  { code: 'ar', nameFr: 'arabe', nameEn: 'Arabic', flag: '🇸🇦' },
  { code: 'nl', nameFr: 'néerlandais', nameEn: 'Dutch', flag: '🇳🇱' },
  { code: 'pl', nameFr: 'polonais', nameEn: 'Polish', flag: '🇵🇱' },
  { code: 'sv', nameFr: 'suédois', nameEn: 'Swedish', flag: '🇸🇪' },
  { code: 'no', nameFr: 'norvégien', nameEn: 'Norwegian', flag: '🇳🇴' },
  { code: 'fi', nameFr: 'finnois', nameEn: 'Finnish', flag: '🇫🇮' },
  { code: 'da', nameFr: 'danois', nameEn: 'Danish', flag: '🇩🇰' },
  { code: 'el', nameFr: 'grec', nameEn: 'Greek', flag: '🇬🇷' },
  { code: 'tr', nameFr: 'turc', nameEn: 'Turkish', flag: '🇹🇷' },
  { code: 'uk', nameFr: 'ukrainien', nameEn: 'Ukrainian', flag: '🇺🇦' },
  { code: 'ro', nameFr: 'roumain', nameEn: 'Romanian', flag: '🇷🇴' },
  { code: 'sk', nameFr: 'slovaque', nameEn: 'Slovak', flag: '🇸🇰' },
  { code: 'la', nameFr: 'latin (SPQR)', nameEn: 'Latin', flag: '🏛️' },
  { code: 'eo', nameFr: 'espéranto', nameEn: 'Esperanto', flag: '⭐️' },
];

export const BASE_LANGUAGES: { code: BaseLanguage; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

const authenticLanguageStories: Record<string, { title: string; content: string; translationFr: string; translationEn: string; level: LessonLevel; kind: LessonKind }[]> = {
  es: [
    {
      title: '1a - Carlos es cocinero, Parte 1',
      content: "Carlos se levanta a las seis de la mañana cada día. Prepara el desayuno y bebe una taza de café caliente. Conduce al trabajo en su coche. Su trabajo empieza a las siete y media. Carlos es cocinero en un restaurante acogedor en el centro de Madrid. Prepara comida deliciosa para los clientes.",
      translationFr: "Carlos se lève à six heures du matin chaque jour. Il prépare le petit-déjeuner et boit une tasse de café chaud. Il va au travail en voiture. Son travail commence à sept heures trente. Carlos est cuisinier dans un restaurant chaleureux du centre de Madrid. Il prépare de délicieux plats pour les clients.",
      translationEn: "Carlos gets up at six o'clock every morning. He makes breakfast and drinks a cup of hot coffee. He drives to work in his car. His work starts at seven-thirty. Carlos is a cook at a cozy restaurant in central Madrid. He prepares delicious food for customers.",
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
    {
      title: '1b - Una mañana en el mercado de San Miguel',
      content: "Elena camina por las calles pintorescas de la ciudad. Compra frutas frescas, verduras y pan recién horneado en el mercado. Habla con los vendedores locales y practica su español con alegría.",
      translationFr: "Elena se promène dans les rues pittoresques de la ville. Elle achète des fruits frais, des légumes et du pain frais au marché.",
      translationEn: "Elena walks through the picturesque city streets. She buys fresh fruit, vegetables, and fresh bread at the market.",
      level: 'Débutant 1',
      kind: 'Cours',
    },
  ],
  de: [
    {
      title: '1a - Der Morgen von Markus',
      content: "Markus steht jeden Morgen um sechs Uhr auf. Er macht Frühstück und trinkt eine Tasse heißen Kaffee. Er fährt mit dem Auto zur Arbeit. Markus arbeitet als Chefkoch in einem gemütlichen Restaurant in München.",
      translationFr: "Markus se lève chaque matin à six heures. Il prépare le petit-déjeuner et boit une tasse de café chaud.",
      translationEn: "Markus gets up every morning at six o'clock. He makes breakfast and drinks a cup of hot coffee.",
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
  ],
};

export function getLessonsForLanguage(targetLangCode: string = 'en', baseLang: BaseLanguage = 'fr'): Lesson[] {
  const code = targetLangCode.toLowerCase();
  const langDef = SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
  const langName = baseLang === 'en' ? langDef.nameEn : langDef.nameFr;
  const flag = langDef.flag;

  const authentic = authenticLanguageStories[code] || [];
  const lessons: Lesson[] = [];

  authentic.forEach((story, idx) => {
    lessons.push({
      id: `${code}-auth-${idx + 1}`,
      title: story.title,
      collection: `Immerli ${story.kind}s · ${langName} ${flag}`,
      language: code,
      level: story.level,
      kind: story.kind,
      durationSeconds: 120 + idx * 30,
      imagePosition: idx % 2 === 0 ? 'center' : 'right',
      content: story.content,
      translation: baseLang === 'en' ? story.translationEn : story.translationFr,
    });
  });

  const levels: LessonLevel[] = ['Débutant 1', 'Débutant 2', 'Intermédiaire', 'Avancé'];
  const kinds: LessonKind[] = ['Mini-histoire', 'Cours', 'Actualité', 'Podcast'];

  for (let i = lessons.length + 1; i <= 52; i++) {
    const lvl = levels[i % levels.length];
    const knd = kinds[i % kinds.length];
    lessons.push({
      id: `${code}-lesson-${i}`,
      title: `${i}. ${knd} : Apprendre ${langName} ${flag}`,
      collection: `Immerli ${knd}s · ${langName} ${flag}`,
      language: code,
      level: lvl,
      kind: knd,
      durationSeconds: 90 + (i % 6) * 40,
      imagePosition: i % 3 === 0 ? 'left' : i % 3 === 1 ? 'center' : 'right',
      content: `Bienvenue dans la leçon ${i} d'apprentissage de la langue ${langName} ${flag}. Développez votre vocabulaire et votre aisance chaque jour !`,
      translation: `Welcome to lesson ${i} of learning ${langName} ${flag}. Develop your vocabulary and fluency every day!`,
    });
  }

  return lessons;
}
