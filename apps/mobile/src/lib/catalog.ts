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
  { code: 'yue', name: 'cantonais', nameEn: 'Cantonese', flag: '🇭🇰' },
  { code: 'fa', name: 'farsi / persan', nameEn: 'Persian', flag: '🇮🇷' },
  { code: 'af', name: 'afrikaans', nameEn: 'Afrikaans', flag: '🇿🇦' },
  { code: 'hy', name: 'arménien', nameEn: 'Armenian', flag: '🇦🇲' },
  { code: 'be', name: 'biélorusse', nameEn: 'Belarusian', flag: '🇧🇾' },
  { code: 'bg', name: 'bulgare', nameEn: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', name: 'catalan', nameEn: 'Catalan', flag: '🏴' },
  { code: 'hr', name: 'croate', nameEn: 'Croatian', flag: '🇭🇷' },
  { code: 'gu', name: 'goudjarati', nameEn: 'Gujarati', flag: '🇮🇳' },
  { code: 'ka', name: 'géorgien', nameEn: 'Georgian', flag: '🇬🇪' },
  { code: 'hi', name: 'hindi', nameEn: 'Hindi', flag: '🇮🇳' },
  { code: 'hu', name: 'hongrois', nameEn: 'Hungarian', flag: '🇭🇺' },
  { code: 'id', name: 'indonésien', nameEn: 'Indonesian', flag: '🇮🇩' },
  { code: 'ga', name: 'irlandais', nameEn: 'Irish', flag: '🇮🇪' },
  { code: 'is', name: 'islandais', nameEn: 'Icelandic', flag: '🇮🇸' },
  { code: 'km', name: 'khmer', nameEn: 'Khmer', flag: '🇰🇭' },
  { code: 'mk', name: 'macédonien', nameEn: 'Macedonian', flag: '🇲🇰' },
  { code: 'ms', name: 'malais', nameEn: 'Malay', flag: '🇲🇾' },
  { code: 'ur', name: 'ourdou', nameEn: 'Urdu', flag: '🇵🇰' },
  { code: 'pa', name: 'pendjabi', nameEn: 'Punjabi', flag: '🇮🇳' },
  { code: 'sr', name: 'serbe', nameEn: 'Serbian', flag: '🇷🇸' },
  { code: 'sl', name: 'slovène', nameEn: 'Slovenian', flag: '🇸🇮' },
  { code: 'sw', name: 'swahili', nameEn: 'Swahili', flag: '🇰🇪' },
  { code: 'tl', name: 'tagalog', nameEn: 'Tagalog', flag: '🇵🇭' },
  { code: 'cs', name: 'tchèque', nameEn: 'Czech', flag: '🇨🇿' },
  { code: 'th', name: 'thaï', nameEn: 'Thai', flag: '🇹🇭' },
  { code: 'vi', name: 'vietnamien', nameEn: 'Vietnamese', flag: '🇻🇳' },
];

export const BASE_LANGUAGES: { code: BaseLanguage; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
];

// Written texts per target language
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
      content: "Elena camina por las calles pintorescas de la ciudad. Compra frutas frescas, verduras y pan recién horneado en el mercado. Habla con los vendedores locales y practica su español con alegría. Le gusta aprender palabras nuevas todos los días.",
      translationFr: "Elena se promène dans les rues pittoresques de la ville. Elle achète des fruits frais, des légumes et du pain frais au marché. Elle discute avec les vendeurs locaux et pratique son espagnol avec joie.",
      translationEn: "Elena walks through the picturesque city streets. She buys fresh fruit, vegetables, and fresh bread at the market. She speaks with local vendors and practices her Spanish with joy.",
      level: 'Débutant 1',
      kind: 'Cours',
    },
    {
      title: '2a - Un viaje inolvidable a Barcelona',
      content: "Viajar a Barcelona es una experiencia inolvidable. La arquitectura de Gaudí, la brisa del mar Mediterráneo y la vida nocturna crean un ambiente único. En este recorrido descubriremos la Sagrada Familia, el Parque Güell y las Ramblas.",
      translationFr: "Voyager à Barcelone est une expérience inoubliable. L'architecture de Gaudí, la brise de la mer Méditerranée et la vie nocturne créent une atmosphère unique.",
      translationEn: "Traveling to Barcelona is an unforgettable experience. Gaudí's architecture, the Mediterranean sea breeze, and the nightlife create a unique atmosphere.",
      level: 'Débutant 2',
      kind: 'Mini-histoire',
    },
    {
      title: 'Noticias: Innovación solar en Andalucía',
      content: "Andalucía lidera la transición hacia las energías renovables con la inauguración de una nueva planta solar fotovoltaica. Este proyecto abastecerá de energía limpia a más de cien mil hogares y creará puestos de trabajo calificados.",
      translationFr: "L'Andalousie mène la transition vers les énergies renouvelables avec l'inauguration d'une nouvelle centrale solaire photovoltaïque.",
      translationEn: "Andalusia leads the transition toward renewable energies with the opening of a new solar photovoltaic plant.",
      level: 'Intermédiaire',
      kind: 'Actualité',
    },
    {
      title: 'Podcast Historia: La literatura del Siglo de Oro',
      content: "Bienvenidos a nuestro episodio sobre la literatura hispánica. Hoy analizamos las obras cumbres de Cervantes, Lope de Vega y Quevedo, explorando el impacto cultural del Siglo de Oro en la Europa del siglo XVII.",
      translationFr: "Bienvenue dans notre épisode sur la littérature hispanique. Aujourd'hui nous analysons les chefs-d'œuvre de Cervantès et Lope de Vega.",
      translationEn: "Welcome to our episode on Hispanic literature. Today we analyze masterworks by Cervantes and Lope de Vega.",
      level: 'Avancé',
      kind: 'Podcast',
    },
  ],

  de: [
    {
      title: '1a - Der Morgen von Markus',
      content: "Markus steht jeden Morgen um sechs Uhr auf. Er macht Frühstück und trinkt eine Tasse heißen Kaffee. Er fährt mit dem Auto zur Arbeit. Markus arbeitet als Chefkoch in einem gemütlichen Restaurant in München. Er kocht köstliche Gerichte für die Gäste.",
      translationFr: "Markus se lève chaque matin à six heures. Il prépare le petit-déjeuner et boit une tasse de café chaud. Il va au travail en voiture. Markus travaille comme chef cuisinier dans un restaurant chaleureux à Munich.",
      translationEn: "Markus gets up every morning at six o'clock. He makes breakfast and drinks a cup of hot coffee. He drives to work by car. Markus works as a chef in a cozy restaurant in Munich.",
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
    {
      title: '1b - Spaziergang durch Berlin',
      content: "Berlin ist eine lebendige Stadt voller Geschichte und Kultur. Sabine besucht das Brandenburger Tor und spaziert durch den Tiergarten. Sie kauft frische Brötchen beim Bäcker und trifft ihre Freunde am Alexanderplatz.",
      translationFr: "Berlin est une ville vivante pleine d'histoire et de culture. Sabine visite la porte de Brandebourg et se promène dans le parc.",
      translationEn: "Berlin is a lively city full of history and culture. Sabine visits the Brandenburg Gate and walks through Tiergarten.",
      level: 'Débutant 1',
      kind: 'Cours',
    },
    {
      title: 'Wirtschaft: Die Energiewende in Deutschland',
      content: "Deutschland investiert kräftig in den Ausbau von Wind- und Solarenergie. Neue Berichte zeigen, dass der Anteil erneuerbarer Energien im Stromnetz einen historischen Höchststand erreicht hat.",
      translationFr: "L'Allemagne investit massivement dans le développement de l'énergie éolienne et solaire.",
      translationEn: "Germany is investing heavily in the expansion of wind and solar energy.",
      level: 'Intermédiaire',
      kind: 'Actualité',
    },
  ],

  fr: [
    {
      title: '1a - Julien à Paris',
      content: "Julien se réveille à sept heures chaque matin. Il prépare un café chaud et mange un croissant frais de la boulangerie. Il habite près de la Seine et aime marcher le long des quais en regardant Notre-Dame.",
      translationFr: "Julien se réveille à sept heures chaque matin. Il prépare un café chaud et mange un croissant frais de la boulangerie.",
      translationEn: "Julien wakes up at seven o'clock every morning. He makes a hot coffee and eats a fresh croissant from the bakery.",
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
    {
      title: '1b - Une journée au marché',
      content: "Au marché du village, les étals brillent de mille couleurs. On y trouve du fromage artisanal, du pain croustillant et des fruits de saison. Julien aime discuter avec les producteurs locaux.",
      translationFr: "Au marché du village, les étals brillent de mille couleurs. On y trouve du fromage artisanal et des fruits de saison.",
      translationEn: "At the village market, the stalls shine with a thousand colors. There you find artisan cheese and seasonal fruit.",
      level: 'Débutant 1',
      kind: 'Cours',
    },
  ],

  it: [
    {
      title: '1a - La mattina di Marco a Roma',
      content: "Marco si sveglia ogni mattina alle sei. Prepara la colazione e beve un delizioso caffè espresso. Lavora come chef in un piccolo ristorante vicino a Piazza Navona a Roma.",
      translationFr: "Marco se réveille chaque matin à six heures. Il prépare le petit-déjeuner et boit un délicieux espresso.",
      translationEn: "Marco wakes up every morning at six o'clock. He makes breakfast and drinks a delicious espresso coffee.",
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
    {
      title: '1b - Passeggiata a Firenze',
      content: "Firenze è una città d'arte mozzafiato. Camminare lungo il fiume Arno e ammirare il Ponte Vecchio al tramonto è un'emozione straordinaria.",
      translationFr: "Florence est une ville d'art époustouflante. Se promener le long de l'Arno et admirer le Ponte Vecchio au coucher du soleil est une émotion extraordinaire.",
      translationEn: "Florence is a breathtaking city of art. Walking along the Arno River and admiring Ponte Vecchio at sunset is an extraordinary experience.",
      level: 'Débutant 2',
      kind: 'Cours',
    },
  ],

  ja: [
    {
      title: '1a - ケンさんの朝 (Ken\'s Morning)',
      content: "ケンさんは毎朝六時に起きます。朝ご飯を作って、温かい緑茶を飲みます。彼は東京のレストランで料理人として働いています。毎日美味しい料理を作ります。",
      translationFr: "Ken se lève à six heures chaque matin. Il prépare le petit-déjeuner et boit du thé vert chaud. Il travaille comme cuisinier dans un restaurant à Tokyo.",
      translationEn: "Ken gets up at six o'clock every morning. He makes breakfast and drinks warm green tea. He works as a cook at a restaurant in Tokyo.",
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
  ],

  zh: [
    {
      title: '1a - 小明的一天 (Xiao Ming\'s Day)',
      content: "小明每天早上六点起床。他做早餐，喝一杯热茶。小明在北京的一家餐厅当厨师。他非常喜欢为客人做美味的饭菜。",
      translationFr: "Xiao Ming se lève à six heures chaque matin. Il prépare le petit-déjeuner et boit un thé chaud. Il est cuisinier dans un restaurant à Pékin.",
      translationEn: "Xiao Ming gets up at six o'clock every morning. He makes breakfast and drinks hot tea. He works as a chef in a restaurant in Beijing.",
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
  ],

  ar: [
    {
      title: '1a - صباح أمين في القاهرة',
      content: "يستيقظ أمين كل يوم في الساعة السادسة صباحاً. يعد وجبة الإفطار ويشرب كوباً من القهوة الدافئة. يعمل طاهياً في مطعم جميل وسط القاهرة.",
      translationFr: "Amine se réveille chaque jour à six heures du matin. Il prépare le petit-déjeuner et boit du café chaud. Il travaille comme cuisinier dans un beau restaurant au centre du Caire.",
      translationEn: "Amine wakes up every day at six in the morning. He prepares breakfast and drinks a cup of warm coffee. He works as a chef in a beautiful restaurant in downtown Cairo.",
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

  // Add authentic stories with translations adapted to base language
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

  // Generate complete set of 52 lessons covering all levels and kinds
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
      content: `Bienvenue dans la leçon ${i} d'apprentissage de la langue ${langName} ${flag}. Développez votre vocabulaire, votre compréhension orale et votre aisance d'expression chaque jour. Pratiquez ce texte attentivement et sauvegardez vos nouveaux mots !`,
      translation: `Welcome to lesson ${i} of learning ${langName} ${flag}. Develop your vocabulary, listening comprehension, and fluency every day!`,
    });
  }

  return lessons;
}

export const seedLessons: Lesson[] = getLessonsForLanguage('en', 'fr');

export const dictionary: Record<string, DictionaryEntry> = {
  a: { translation: 'un / une' },
  about: { translation: 'à propos de' },
  again: { translation: 'encore' },
  answers: { translation: 'répond' },
  asks: { translation: 'demande' },
  breakfast: { translation: 'petit-déjeuner' },
  bus: { translation: 'bus' },
  carries: { translation: 'porte' },
  city: { translation: 'ville' },
  coffee: { translation: 'café' },
  confidence: { translation: 'confiance' },
  cook: { translation: 'cuisinier' },
  countries: { translation: 'pays' },
  customers: { translation: 'clients' },
  directions: { translation: 'indications' },
  drives: { translation: 'conduit' },
  english: { translation: 'anglais' },
  every: { translation: 'chaque' },
  food: { translation: 'nourriture' },
  friendly: { translation: 'sympathique' },
  goes: { translation: 'va' },
  happy: { translation: 'heureux' },
  hear: { translation: 'entendre' },
  home: { translation: 'maison' },
  hungry: { translation: 'affamés' },
  learn: { translation: 'apprendre' },
  lesson: { translation: 'leçon' },
  makes: { translation: 'prépare' },
  market: { translation: 'marché' },
  meet: { translation: 'rencontrer' },
  mike: { translation: 'Mike' },
  morning: { translation: 'matin' },
  restaurant: { translation: 'restaurant' },
  rests: { translation: 'se repose' },
  six: { translation: 'six' },
  small: { translation: 'petit' },
  speaks: { translation: 'parle' },
  starts: { translation: 'commence' },
  station: { translation: 'gare' },
  story: { translation: 'histoire' },
  stranger: { translation: 'inconnu' },
  talks: { translation: 'parle' },
  thirty: { translation: 'trente' },
  today: { translation: "aujourd'hui" },
  useful: { translation: 'utile' },
  waits: { translation: 'attend' },
  watches: { translation: 'observe' },
  words: { translation: 'mots' },
  work: { translation: 'travail' },
};

export function normalizeWord(value: string) {
  return value.toLocaleLowerCase().replace(/[’']/g, "'").replace(/^[^a-z]+|[^a-z]+$/g, '');
}

export function getWordCount(content: string) {
  return content.split(/\s+/).filter(Boolean).length;
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}
