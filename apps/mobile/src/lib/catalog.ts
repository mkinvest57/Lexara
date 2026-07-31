export type LessonLevel = 'Débutant 1' | 'Débutant 2' | 'Intermédiaire' | 'Avancé';
export type LessonKind = 'Mini-histoire' | 'Cours' | 'Actualité' | 'Podcast';

export type Lesson = {
  id: string;
  title: string;
  collection: string;
  language: 'en';
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

export const seedLessons: Lesson[] = [
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
  return value.toLocaleLowerCase('en').replace(/[’']/g, "'").replace(/^[^a-z]+|[^a-z]+$/g, '');
}

export function getWordCount(content: string) {
  return content.split(/\s+/).map(normalizeWord).filter(Boolean).length;
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}
