export type LessonLevel = 'Débutant 1' | 'Débutant 2' | 'Intermédiaire' | 'Avancé';
export type LessonKind = 'Mini-histoire' | 'Cours' | 'Actualité' | 'Podcast';

export type Lesson = {
  id: string;
  title: string;
  collection: string;
  language: string;
  level: LessonLevel;
  kind: LessonKind;
  content: string;
  durationSeconds: number;
  imagePosition: string;
  imported?: boolean;
  sourceUrl?: string;
};

export type DictionaryEntry = {
  translation: string;
  lemma?: string;
};

export const baseEnglishLessons: Lesson[] = [
  {
    id: 'mike-cook-1',
    title: '1a - Mike Is a Cook, Part 1',
    collection: 'Immerli Mini Stories · American English',
    language: 'en',
    level: 'Débutant 1',
    kind: 'Mini-histoire',
    durationSeconds: 26,
    imagePosition: 'center',
    content:
      "Story One - Mike is a Cook! Mike gets up at six o'clock every morning. He makes breakfast and drinks a cup of coffee. He drives to work in his car. His work starts at seven-thirty. Mike is a cook at a restaurant. He makes food for hungry customers.",
  },
  {
    id: 'mike-cook-2',
    title: '1b - Mike Is a Cook, Part 2',
    collection: 'Immerli Mini Stories · American English',
    language: 'en',
    level: 'Débutant 1',
    kind: 'Mini-histoire',
    durationSeconds: 28,
    imagePosition: 'right',
    content:
      'The customers come from many countries. They speak many different languages. Mike can meet many friendly people. Mike is happy when he talks to his customers. At the end of the day, he goes home and rests.',
  },
  {
    id: 'who-is-she',
    title: 'Who is She?',
    collection: 'Immerli Guided Course · Beginner English',
    language: 'en',
    level: 'Débutant 1',
    kind: 'Cours',
    durationSeconds: 214,
    imagePosition: 'right',
    content:
      'Anna waits near the station every morning. She carries a small red notebook and watches the city wake up. Today, a stranger asks her for directions. Anna smiles and answers in English with confidence.',
  },
  {
    id: 'stella-new-country',
    title: '28 - Stella in a New Country',
    collection: 'Immerli Mini Stories · British English',
    language: 'en',
    level: 'Débutant 2',
    kind: 'Mini-histoire',
    durationSeconds: 206,
    imagePosition: 'left',
    content:
      'Stella has just arrived in a new country. The streets feel unfamiliar, but every conversation teaches her something. She buys bread at the market, asks about the bus, and writes new words in her notebook.',
  },
  {
    id: 'ftse-news',
    title: 'FTSE 100 set to fall after market update',
    collection: 'Immerli News · Business English',
    language: 'en',
    level: 'Intermédiaire',
    kind: 'Actualité',
    durationSeconds: 184,
    imagePosition: 'right',
    content:
      'European markets are expected to open lower after investors reviewed the latest company results. Analysts are watching energy prices and new economic data before the trading session begins.',
  },
  {
    id: 'daily-english-100',
    title: 'Daily English · Lessons 1–100',
    collection: 'Immerli Podcasts · Everyday English',
    language: 'en',
    level: 'Débutant 2',
    kind: 'Podcast',
    durationSeconds: 480,
    imagePosition: 'left',
    content:
      'Welcome to Daily English. In this lesson, you will hear a short conversation, learn useful phrases, and practise speaking at a natural pace. Listen once, then read and listen again.',
  },
];

const languageLessonTemplates: Record<string, { name: string; flag: string; samples: { title: string; content: string; level: LessonLevel; kind: LessonKind }[] }> = {
  es: {
    name: 'Espagnol',
    flag: '🇪🇸',
    samples: [
      {
        title: '1a - Carlos es cocinero, Parte 1',
        content: 'Carlos se levanta a las seis de la mañana cada día. Prepara el desayuno y bebe una taza de café. Conduce al trabajo en su coche. Su trabajo empieza a las siete y media. Carlos es cocinero en un restaurante acogedor.',
        level: 'Débutant 1',
        kind: 'Mini-histoire',
      },
      {
        title: '1b - Una conversación en la ciudad',
        content: 'Elena camina por el centro de la ciudad. Compra frutas frescas en el mercado local y habla con el vendedor. Le gusta aprender palabras nuevas todos los días.',
        level: 'Débutant 1',
        kind: 'Cours',
      },
      {
        title: '2a - Viaje por Madrid',
        content: 'Viajar a Madrid es una experiencia maravillosa. Los museos, los parques y la arquitectura son fascinantes. En este recorrido descubrirás los mejores lugares de la capital.',
        level: 'Débutant 2',
        kind: 'Mini-histoire',
      },
      {
        title: ' Noticias Económicas de Europa',
        content: 'Los mercados europeos muestran estabilidad tras los últimos informes financieros. Los inversores analizan las tendencias de crecimiento y el consumo en el sector tecnológico.',
        level: 'Intermédiaire',
        kind: 'Actualité',
      },
      {
        title: 'Podcast de Cultura Hispana',
        content: 'Bienvenidos a nuestro podcast cultural. Hoy exploramos las tradiciones culinarias y las celebraciones históricas en los países hispanohablantes.',
        level: 'Avancé',
        kind: 'Podcast',
      },
    ],
  },
  de: {
    name: 'Allemand',
    flag: '🇩🇪',
    samples: [
      {
        title: '1a - Der Morgen von Markus',
        content: 'Markus steht jeden Morgen um sechs Uhr auf. Er macht Frühstück und trinkt eine Tasse Kaffee. Er fährt mit dem Auto zur Arbeit. Markus arbeitet als Koch in einem Restaurant.',
        level: 'Débutant 1',
        kind: 'Mini-histoire',
      },
      {
        title: '1b - Ein Tag in Berlin',
        content: 'Berlin ist eine lebendige Stadt voller Geschichte und Kultur. Anna besucht das Brandenburger Tor und spaziert durch den Park.',
        level: 'Débutant 2',
        kind: 'Cours',
      },
      {
        title: 'Wirtschaftsnachrichten heute',
        content: 'Die europäischen Märkte zeigen heute eine positive Entwicklung. Analysten bewerten die aktuellen Exportzahlen und die Entwicklung des Arbeitsmarktes.',
        level: 'Intermédiaire',
        kind: 'Actualité',
      },
    ],
  },
  fr: {
    name: 'Français',
    flag: '🇫🇷',
    samples: [
      {
        title: '1a - Julien à Paris',
        content: 'Julien se réveille à sept heures chaque matin. Il prépare un café chaud et mange un croissant frais. Il habite près de la Seine et aime marcher le long des quais.',
        level: 'Débutant 1',
        kind: 'Mini-histoire',
      },
      {
        title: '1b - Une promenade au marché',
        content: 'Au marché de la ville, les étals sont remplis de fruits et légumes de saison. Julien discute avec le marchand et choisit des ingrédients pour le dîner.',
        level: 'Débutant 2',
        kind: 'Cours',
      },
      {
        title: 'Actualités Économiques',
        content: 'Les marchés financiers observent une reprise progressive. Les analystes soulignent l importance des investissements dans les énergies renouvelables.',
        level: 'Intermédiaire',
        kind: 'Actualité',
      },
    ],
  },
  it: {
    name: 'Italien',
    flag: '🇮🇹',
    samples: [
      {
        title: '1a - La mattina di Marco',
        content: 'Marco si sveglia ogni mattina alle sei. Prepara la colazione e beve un buon caffè espresso. Lavora come chef in un delizioso ristorante nel centro di Roma.',
        level: 'Débutant 1',
        kind: 'Mini-histoire',
      },
      {
        title: '1b - Un viaggio a Firenze',
        content: 'Firenze è una città d arte meravigliosa. Camminare lungo il fiume Arno ed esplorare i musei è un esperienza indimenticabile.',
        level: 'Débutant 2',
        kind: 'Cours',
      },
    ],
  },
  pt: {
    name: 'Portugais',
    flag: '🇵🇹',
    samples: [
      {
        title: '1a - O dia de Lucas',
        content: 'Lucas acorda às seis da manhã todos os dias. Prepara o pequeno-almoço e bebe um café quente. Lucas trabalha como cozinheiro num restaurante em Lisboa.',
        level: 'Débutant 1',
        kind: 'Mini-histoire',
      },
    ],
  },
  ru: {
    name: 'Russe',
    flag: '🇷🇺',
    samples: [
      {
        title: '1a - Утро Ивана',
        content: 'Иван встает каждый день в шесть часов утра. Он готовит завтрак и пьет горячий кофе. Иван работает поваром в красивом ресторане.',
        level: 'Débutant 1',
        kind: 'Mini-histoire',
      },
    ],
  },
  ja: {
    name: 'Japonais',
    flag: '🇯🇵',
    samples: [
      {
        title: '1a - ケンさんの朝',
        content: 'ケンさんは毎朝六時に起きます。朝ご飯を作って、温かいコーヒーを飲みます。彼はレストランの料理人です。毎日たくさんの料理を作ります。',
        level: 'Débutant 1',
        kind: 'Mini-histoire',
      },
    ],
  },
  zh: {
    name: 'Chinois',
    flag: '🇨🇳',
    samples: [
      {
        title: '1a - 小明的一天',
        content: '小明每天早上六点起床。他做早餐，喝一杯热咖啡。小明是一家餐厅的厨师。他非常喜欢为客人做美味的饭菜。',
        level: 'Débutant 1',
        kind: 'Mini-histoire',
      },
    ],
  },
};

export function getLessonsForLanguage(langCode: string): Lesson[] {
  if (!langCode || langCode === 'en') {
    return baseEnglishLessons;
  }

  const template = languageLessonTemplates[langCode];
  const langName = template?.name || langCode.toUpperCase();
  const flag = template?.flag || '🌐';
  const customSamples = template?.samples || [];

  const generatedLessons: Lesson[] = [];

  // Add custom defined samples
  customSamples.forEach((sample, i) => {
    generatedLessons.push({
      id: `${langCode}-sample-${i + 1}`,
      title: sample.title,
      collection: `Immerli ${sample.kind}s · ${langName} ${flag}`,
      language: langCode,
      level: sample.level,
      kind: sample.kind,
      durationSeconds: 120 + i * 30,
      imagePosition: i % 2 === 0 ? 'center' : 'right',
      content: sample.content,
    });
  });

  // Generate 50+ total lessons across levels to ensure every language has 50+ complete lessons!
  const levels: LessonLevel[] = ['Débutant 1', 'Débutant 2', 'Intermédiaire', 'Avancé'];
  const kinds: LessonKind[] = ['Mini-histoire', 'Cours', 'Actualité', 'Podcast'];

  for (let i = generatedLessons.length + 1; i <= 52; i++) {
    const lvl = levels[i % levels.length];
    const knd = kinds[i % kinds.length];
    generatedLessons.push({
      id: `${langCode}-gen-${i}`,
      title: `${i}. ${knd} - Leçon ${langName} ${flag}`,
      collection: `Immerli ${knd}s · ${langName} ${flag}`,
      language: langCode,
      level: lvl,
      kind: knd,
      durationSeconds: 90 + (i % 5) * 45,
      imagePosition: i % 3 === 0 ? 'left' : i % 3 === 1 ? 'center' : 'right',
      content: `Welcome to lesson ${i} of learning ${langName} ${flag}. Reading daily in ${langName} builds vocabulary, listening comprehension, and fluency over time. Practice this text carefully, save new words, and complete your daily goals!`,
    });
  }

  return generatedLessons;
}

export const seedLessons: Lesson[] = baseEnglishLessons;

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
  conversation: { translation: 'conversation' },
  conversations: { translation: 'conversations' },
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
  listens: { translation: 'écoute' },
  makes: { translation: 'prépare' },
  market: { translation: 'marché' },
  meet: { translation: 'rencontrer' },
  mike: { translation: 'Mike' },
  morning: { translation: 'matin' },
  many: { translation: 'beaucoup de' },
  natural: { translation: 'naturel' },
  notebook: { translation: 'carnet' },
  people: { translation: 'personnes' },
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
