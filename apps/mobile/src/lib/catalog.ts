export type LessonLevel = 'Débutant 1' | 'Débutant 2' | 'Intermédiaire' | 'Avancé';
export type LessonKind = 'Mini-histoire' | 'Cours' | 'Actualité' | 'Podcast';

export type BaseLanguage = 'fr' | 'en' | 'es' | 'it' | 'ja';

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
  { code: 'yue', nameFr: 'cantonais', nameEn: 'Cantonese', flag: '🇭🇰' },
  { code: 'fa', nameFr: 'farsi / persan', nameEn: 'Persian', flag: '🇮🇷' },
  { code: 'af', nameFr: 'afrikaans', nameEn: 'Afrikaans', flag: '🇿🇦' },
  { code: 'hy', nameFr: 'arménien', nameEn: 'Armenian', flag: '🇦🇲' },
  { code: 'be', nameFr: 'biélorusse', nameEn: 'Belarusian', flag: '🇧🇾' },
  { code: 'bg', nameFr: 'bulgare', nameEn: 'Bulgarian', flag: '🇧🇬' },
  { code: 'ca', nameFr: 'catalan', nameEn: 'Catalan', flag: '🏴' },
  { code: 'hr', nameFr: 'croate', nameEn: 'Croatian', flag: '🇭🇷' },
  { code: 'gu', nameFr: 'goudjarati', nameEn: 'Gujarati', flag: '🇮🇳' },
  { code: 'ka', nameFr: 'géorgien', nameEn: 'Georgian', flag: '🇬🇪' },
  { code: 'hi', nameFr: 'hindi', nameEn: 'Hindi', flag: '🇮🇳' },
  { code: 'hu', nameFr: 'hongrois', nameEn: 'Hungarian', flag: '🇭🇺' },
  { code: 'id', nameFr: 'indonésien', nameEn: 'Indonesian', flag: '🇮🇩' },
  { code: 'ga', nameFr: 'irlandais', nameEn: 'Irish', flag: '🇮🇪' },
  { code: 'is', nameFr: 'islandais', nameEn: 'Icelandic', flag: '🇮🇸' },
  { code: 'km', nameFr: 'khmer', nameEn: 'Khmer', flag: '🇰🇭' },
  { code: 'mk', nameFr: 'macédonien', nameEn: 'Macedonian', flag: '🇲🇰' },
  { code: 'ms', nameFr: 'malais', nameEn: 'Malay', flag: '🇲🇾' },
  { code: 'ur', nameFr: 'ourdou', nameEn: 'Urdu', flag: '🇵🇰' },
  { code: 'pa', nameFr: 'pendjabi', nameEn: 'Punjabi', flag: '🇮🇳' },
  { code: 'sr', nameFr: 'serbe', nameEn: 'Serbian', flag: '🇷🇸' },
  { code: 'sl', nameFr: 'slovène', nameEn: 'Slovenian', flag: '🇸🇮' },
  { code: 'sw', nameFr: 'swahili', nameEn: 'Swahili', flag: '🇰🇪' },
  { code: 'tl', nameFr: 'tagalog', nameEn: 'Tagalog', flag: '🇵🇭' },
  { code: 'cs', nameFr: 'tchèque', nameEn: 'Czech', flag: '🇨🇿' },
  { code: 'th', nameFr: 'thaï', nameEn: 'Thai', flag: '🇹🇭' },
  { code: 'vi', nameFr: 'vietnamien', nameEn: 'Vietnamese', flag: '🇻🇳' },
];

export const BASE_LANGUAGES: { code: BaseLanguage; name: string; flag: string }[] = [
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
];

type NativeTemplate = {
  makeTitle: (i: number, kind: string, flag: string) => string;
  makeContent: (i: number) => string;
  makeTranslation: (i: number, baseLang: BaseLanguage) => string;
};

const nativeTemplates: Record<string, NativeTemplate> = {
  ar: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'قصة قصيرة' : kind === 'Cours' ? 'درس تعليمي' : kind === 'Actualité' ? 'أخبار اليوم' : 'بودكاست'} - تعلم العربية ${flag}`,
    makeContent: (i) => `مرحباً بكم في الدرس الرائع رقم ${i} لتعلم اللغة العربية. القراءة والاستماع اليومي يبني مهارات المفردات والفهم والتحدث بسرعة وثقة. استمتع بقراءة هذه القصة الممتازة وسجل الكلمات الجديدة لتراجعها لاحقاً!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Arabic. Daily reading and listening builds your vocabulary, comprehension, and speaking confidence.`
      : `Bienvenue dans la leçon ${i} d'apprentissage de l'arabe. La lecture et l'écoute quotidiennes renforcent votre vocabulaire et votre compréhension oral et écrit.`,
  },
  es: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Mini historia' : kind === 'Cours' ? 'Lección' : kind === 'Actualité' ? 'Noticias' : 'Pódcast'} - Aprender Español ${flag}`,
    makeContent: (i) => `Bienvenidos a la lección número ${i} para aprender español. Leer y escuchar todos los días desarrolla tu vocabulario y tu fluidez para hablar con confianza. ¡Disfruta de esta historia divertida y guarda las palabras nuevas en tu libreta!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Spanish. Reading and listening every day improves your vocabulary and speaking fluency.`
      : `Bienvenue dans la leçon ${i} d'apprentissage de l'espagnol. Lire et écouter chaque jour améliore votre vocabulaire et votre aisance d'expression.`,
  },
  de: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Kurzgeschichte' : kind === 'Cours' ? 'Lektion' : kind === 'Actualité' ? 'Nachrichten' : 'Podcast'} - Deutsch lernen ${flag}`,
    makeContent: (i) => `Willkommen zu Lektion Nummer ${i} zum Deutschlernen. Tägliches Lesen und Hören baut Ihren Wortschatz und Ihre Sprachkompetenz nachhaltig auf. Genießen Sie diese interessante Geschichte und speichern Sie neue Wörter zum Üben!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning German. Daily reading and listening builds your vocabulary and language confidence.`
      : `Bienvenue dans la leçon ${i} d'apprentissage de l'allemand. La lecture et l'écoute quotidiennes enrichissent votre vocabulaire et votre aisance.`,
  },
  it: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Breve storia' : kind === 'Cours' ? 'Lezione' : kind === 'Actualité' ? 'Notizie' : 'Podcast'} - Imparare l'Italiano ${flag}`,
    makeContent: (i) => `Benvenuti alla lezione numero ${i} per imparare l'italiano. Leggere e ascoltare ogni giorno sviluppa il tuo vocabolario e la tua fluidità con naturalezza. Goditi questa bella storia e salva le nuove parole per ripassare!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Italian. Reading and listening every day develops your vocabulary naturally.`
      : `Bienvenue dans la leçon ${i} d'apprentissage de l'italien. La lecture et l'écoute quotidiennes développent votre vocabulaire et votre fluidité.`,
  },
  pt: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Mini-história' : kind === 'Cours' ? 'Lição' : kind === 'Actualité' ? 'Notícias' : 'Podcast'} - Aprender Português ${flag}`,
    makeContent: (i) => `Bem-vindo à lição número ${i} de aprendizagem de português. Ler e ouvir diariamente desenvolve o seu vocabulário e a sua fluência para falar com confiança. Aprecie esta história envolvente e guarde as palavras novas!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Portuguese. Daily reading and listening improves your vocabulary and speech.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du portugais. Lire et écouter tous les jours améliore votre vocabulaire.`,
  },
  ru: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Короткий рассказ' : kind === 'Cours' ? 'Урок' : kind === 'Actualité' ? 'Новости' : 'Подкаст'} - Учим русский ${flag}`,
    makeContent: (i) => `Добро пожаловать на урок номер ${i} по изучению русского языка. Ежедневное чтение и слушание эффективно развивает ваш словарный запас и беглость речи. Наслаждайтесь этой историей и сохраняйте новые слова!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Russian. Daily reading and listening expands your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du russe. La lecture quotidienne enrichit votre vocabulaire.`,
  },
  ja: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'ショートストーリー' : kind === 'Cours' ? '講座' : kind === 'Actualité' ? 'ニュース' : 'ポッドキャスト'} - 日本語学習 ${flag}`,
    makeContent: (i) => `日本語学習の第 ${i} 課へようこそ。毎日文章を読んで聴くことで、語彙力と会話の流暢さが着実に向上します。新しい単語を保存して練習しましょう！`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Japanese. Daily reading and listening steadily improves your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du japonais. La lecture et l'écoute quotidiennes développent vos connaissances.`,
  },
  zh: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? '微故事' : kind === 'Cours' ? '汉语课' : kind === 'Actualité' ? '新闻' : '播客'} - 学习中文 ${flag}`,
    makeContent: (i) => `欢迎来到第 ${i} 课中文学习课程。每天进行阅读和听力训练能快速提升您的词汇量和表达能力。好好享受这一课并记录下您学到的新词汇！`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Chinese. Daily reading and listening quickly boosts your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du chinois. La lecture et l'écoute renforcent votre vocabulaire.`,
  },
  'zh-trad': {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? '微故事' : kind === 'Cours' ? '漢語課' : kind === 'Actualité' ? '新聞' : '播客'} - 學習中文 ${flag}`,
    makeContent: (i) => `歡迎來到第 ${i} 課中文學習課程。每天進行閱讀和聽力訓練能快速提升您的詞彙量和表達能力。好好享受這一課並記錄下您學到的新詞彙！`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Traditional Chinese.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du chinois traditionnel.`,
  },
  ko: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? '짧은 이야기' : kind === 'Cours' ? '강좌' : kind === 'Actualité' ? '뉴스' : '팟캐스트'} - 한국어 학습 ${flag}`,
    makeContent: (i) => `한국어 학습 ${i}번째 레슨에 오신 것을 환영합니다. 매일 글을 읽고 듣는 연습은 어휘력과 말하기 능력을 크게 향상시킵니다. 새로운 단어를 저장하고 실력을 키워보세요!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Korean. Daily reading and listening enhances your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du coréen. L'écoute et la lecture quotidiennes améliorent votre vocabulaire.`,
  },
  el: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Μικρή ιστορία' : kind === 'Cours' ? 'Μάθημα' : kind === 'Actualité' ? 'Νέα' : 'Πόντκαστ'} - Μαθαίνω Ελληνικά ${flag}`,
    makeContent: (i) => `Καλώς ήρθατε στο μάθημα ${i} εκμάθησης ελληνικών. Η καθημερινή ανάγνωση και ακρόαση αναπτύσσει το λεξιλόγιό σας και την άνεση στην ομιλία. Απολαύστε αυτή την ιστορία και σημειώστε τις νέες λέξεις!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Greek. Daily reading and listening develops your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du grec. La lecture et l'écoute quotidiennes enrichissent votre vocabulaire.`,
  },
  tr: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Kısa Hikaye' : kind === 'Cours' ? 'Ders' : kind === 'Actualité' ? 'Haberler' : 'Podcast'} - Türkçe Öğren ${flag}`,
    makeContent: (i) => `Türkçe öğrenme dersi ${i}'e hoş geldiniz. Her gün okumak ve dinlemek kelime bilginizi ve akıcılığınızı hızla geliştirir. Bu harika hikayenin tadını çıkarın ve yeni kelimeleri kaydedin!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Turkish. Reading and listening daily improves your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du turc. Lire et écouter tous les jours développe votre vocabulaire.`,
  },
  uk: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Коротка історія' : kind === 'Cours' ? 'Урок' : kind === 'Actualité' ? 'Новини' : 'Подкаст'} - Вивчаємо українську ${flag}`,
    makeContent: (i) => `Ласкаво просимо на урок №${i} з вивчення української мови. Щоденне читання та слухання розширює ваш словниковий запас та покращує мовлення. Насолоджуйтесь цим уроком!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Ukrainian. Daily reading expands your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage de l'ukrainien. La lecture quotidienne élargit votre vocabulaire.`,
  },
  hi: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'लघु कहानी' : kind === 'Cours' ? 'पाठ' : kind === 'Actualité' ? 'समाचार' : 'पॉडकास्ट'} - हिंदी सीखें ${flag}`,
    makeContent: (i) => `हिंदी सीखने के पाठ नंबर ${i} में आपका स्वागत है। रोज पढ़ना और सुनना आपकी शब्दावली और बोलने की क्षमता को तेजी से बढ़ाता है। इस कहानी का आनंद लें और नए शब्द सहेजें!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Hindi. Daily reading and listening boosts your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du hindi. La lecture et l'écoute quotidiennes enrichissent votre vocabulaire.`,
  },
  th: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'เรื่องสั้น' : kind === 'Cours' ? 'บทเรียน' : kind === 'Actualité' ? 'ข่าว' : 'พอดคาสต์'} - เรียนภาษาไทย ${flag}`,
    makeContent: (i) => `ยินดีต้อนรับสู่บทเรียนเรียนภาษาไทยหมายเลข ${i} การอ่านและการฟังทุกวันช่วยพัฒนาคำศัพท์และความคล่องแคล่วของคุณ สนุกกับการอ่านเรื่องนี้และบันทึกคำศัพท์ใหม่!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Thai. Daily reading improves your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du thaï. La lecture quotidienne améliore votre vocabulaire.`,
  },
  vi: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Truyện ngắn' : kind === 'Cours' ? 'Bài học' : kind === 'Actualité' ? 'Tin tức' : 'Podcast'} - Học tiếng Việt ${flag}`,
    makeContent: (i) => `Chào mừng bạn đến với bài học tiếng Việt số ${i}. Đọc và nghe hàng ngày giúp phát triển vốn từ vựng và sự lưu loát của bạn. Hãy thưởng thức câu chuyện này và lưu lại từ mới!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Vietnamese. Daily reading and listening improves your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du vietnamien. La lecture et l'écoute quotidiennes développent votre vocabulaire.`,
  },
  nl: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Kort verhaal' : kind === 'Cours' ? 'Les' : kind === 'Actualité' ? 'Nieuws' : 'Podcast'} - Nederlands leren ${flag}`,
    makeContent: (i) => `Welkom bij les nummer ${i} Nederlands leren. Dagelijks lezen en luisteren bouwt je woordenschat en spreekvaardigheid gestaag op. Geniet van dit verhaal en bewaar nieuwe woorden!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Dutch. Daily reading builds your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du néerlandais. La lecture quotidienne enrichit votre vocabulaire.`,
  },
  pl: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Krótka historia' : kind === 'Cours' ? 'Lekcja' : kind === 'Actualité' ? 'Wiadomości' : 'Podcast'} - Nauka polskiego ${flag}`,
    makeContent: (i) => `Witamy w lekcji numer ${i} nauki języka polskiego. Codzienne czytanie i słuchanie rozwija Twój zasób słownictwa i płynność wypowiedzi. Ciesz się tą historią i zapisuj nowe słowa!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Polish. Daily reading develops your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du polonais. La lecture quotidienne enrichit votre vocabulaire.`,
  },
  sv: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Kort historia' : kind === 'Cours' ? 'Lektion' : kind === 'Actualité' ? 'Nyheter' : 'Podcast'} - Lär dig svenska ${flag}`,
    makeContent: (i) => `Välkommen till lektion nummer ${i} i att lära sig svenska. Daglig läsning och lyssnande utvecklar ditt ordförråd och din flyt i språket. Njut av den här historien och spara nya ord!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Swedish. Daily reading develops your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du suédois. La lecture quotidienne développe votre vocabulaire.`,
  },
  no: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Kort historie' : kind === 'Cours' ? 'Leksjon' : kind === 'Actualité' ? 'Nyheter' : 'Podcast'} - Lær norsk ${flag}`,
    makeContent: (i) => `Velkommen til leksjon nummer ${i} i å lære norsk. Daglig lesing og lytting utvikler ordforrådet ditt og flyten din. Nyt denne historien og lagre nye ord!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} for learning Norwegian. Daily reading improves your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du norvégien. La lecture quotidienne développe votre vocabulaire.`,
  },
  fi: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Lyhyt tarina' : kind === 'Cours' ? 'Oppitunti' : kind === 'Actualité' ? 'Uutiset' : 'Podcast'} - Opittelemaan suomea ${flag}`,
    makeContent: (i) => `Tervetuloa suomen kielen oppitunnille numero ${i}. Päivittäinen lukeminen ja kuunteleminen kasvattaa sanavarastoasi ja sujuvuuttasi. Nauti tästä tarinasta ja tallenna uudet sanat!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Finnish. Daily reading grows your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du finnois. La lecture quotidienne enrichit votre vocabulaire.`,
  },
  da: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Kort historie' : kind === 'Cours' ? 'Lektion' : kind === 'Actualité' ? 'Nyheder' : 'Podcast'} - Lær dansk ${flag}`,
    makeContent: (i) => `Velkommen til lektion nummer ${i} i at lære dansk. Daglig læsning og lytning udvikler dit ordforråd og din flydende tale. Nyd denne historie og gem nye ord!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Danish. Daily reading develops your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du danois. La lecture quotidienne développe votre vocabulaire.`,
  },
  ro: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Scurtă poveste' : kind === 'Cours' ? 'Lecție' : kind === 'Actualité' ? 'Știri' : 'Podcast'} - Învață română ${flag}`,
    makeContent: (i) => `Bun venit la lecția numărul ${i} de învățare a limbii române. Citirea și ascultarea zilnică vă dezvoltă vocabularul și fluența. Bucurați-vă de această poveste și salvați cuvintele noi!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Romanian. Daily reading develops your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du roumain. La lecture quotidienne enrichit votre vocabulaire.`,
  },
  sk: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Krátky príbeh' : kind === 'Cours' ? 'Lekcia' : kind === 'Actualité' ? 'Správy' : 'Podcast'} - Učenie slovenčiny ${flag}`,
    makeContent: (i) => `Vitajte na lekcii číslo ${i} učenia sa slovenského jazyka. Denné čítanie a počúvanie rozvíja vašu slovnú zásobu a plynulosť. Vychutnajte si tento príbeh a uložte si nové slová!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Slovak. Daily reading develops your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du slovaque. La lecture quotidienne enrichit votre vocabulaire.`,
  },
  la: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Fabula brevis' : kind === 'Cours' ? 'Lectio' : kind === 'Actualité' ? 'Nuntii' : 'Podcast'} - Lingua Latina ${flag}`,
    makeContent: (i) => `Salvi sitis ad lectionem numerum ${i} linguae Latinae. Cotidie legere et audire verborum copiam et eloquentiam valde auget. Fruimini hac fabula et nova verba adnotatione servate!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Latin. Daily reading greatly increases your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage du latin. La lecture quotidienne enrichit votre vocabulaire.`,
  },
  eo: {
    makeTitle: (i, kind, flag) => `${i}. ${kind === 'Mini-histoire' ? 'Novedeto' : kind === 'Cours' ? 'Leciono' : kind === 'Actualité' ? 'Novaĵoj' : 'Podkasto'} - Lernu Esperanton ${flag}`,
    makeContent: (i) => `Bonvenon al la leciono numero ${i} pri lernado de Esperanto. Ĉiutaga legado kaj aŭskultado evoluigas vian vortprovizon kaj fluecon. Ĝuu ĉi tiun rakonton kaj konservu novajn vortojn!`,
    makeTranslation: (i, baseLang) => baseLang === 'en'
      ? `Welcome to lesson ${i} of learning Esperanto. Daily reading develops your vocabulary.`
      : `Bienvenue dans la leçon ${i} d'apprentissage de l'espéranto. La lecture quotidienne développe votre vocabulaire.`,
  },
};

const authenticLanguageStories: Record<string, { title: string; content: string; translationFr: string; translationEn: string; level: LessonLevel; kind: LessonKind }[]> = {
  ar: [
    {
      title: '1a - صباح أمين في القاهرة',
      content: 'يستيقظ أمين كل يوم في الساعة السادسة صباحاً. يعد وجبة الإفطار ويشرب كوباً من القهوة الدافئة. يعمل طاهياً في مطعم جميل وسط القاهرة. يحضر الطعام اللذيذ للزبائن الجائعين.',
      translationFr: 'Amine se réveille chaque jour à six heures du matin. Il prépare le petit-déjeuner et boit du café chaud. Il travaille comme cuisinier dans un beau restaurant au centre du Caire.',
      translationEn: 'Amine wakes up every day at six in the morning. He prepares breakfast and drinks a cup of warm coffee. He works as a chef in a restaurant in downtown Cairo.',
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
    {
      title: '1b - جولة في خان الخليلي',
      content: 'تسير سارة في الأزقة التاريخية لسوق خان الخليلي. تشتري التوابل المعطرة والهدايا التذكارية من الباعة المحاليين. تتحدث مع الناس باللغة العربية وتعلم كلمات جديدة كل يوم.',
      translationFr: 'Sarah se promène dans les ruelles historiques du souk Khan el-Khalili. Elle achète des épices parfumées et des souvenirs aux vendeurs locaux.',
      translationEn: 'Sarah walks through the historic alleys of the Khan el-Khalili market. She buys fragrant spices and souvenirs from local vendors.',
      level: 'Débutant 1',
      kind: 'Cours',
    },
  ],
  es: [
    {
      title: '1a - Carlos es cocinero, Parte 1',
      content: 'Carlos se levanta a las seis de la mañana cada día. Prepara el desayuno y bebe una taza de café caliente. Conduce al trabajo en su coche. Su trabajo empieza a las siete y media. Carlos es cocinero en un restaurante acogedor en el centro de Madrid.',
      translationFr: 'Carlos se lève à six heures du matin chaque jour. Il prépare le petit-déjeuner et boit une tasse de café chaud. Il va au travail en voiture.',
      translationEn: 'Carlos gets up at six o\'clock every morning. He makes breakfast and drinks a cup of hot coffee. He drives to work in his car.',
      level: 'Débutant 1',
      kind: 'Mini-histoire',
    },
  ],
};

export function getLessonsForLanguage(targetLangCode: string = 'en', baseLang: BaseLanguage = 'fr'): Lesson[] {
  const code = targetLangCode.toLowerCase();
  const langDef = SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];
  const langName = baseLang === 'en' ? (langDef.nameEn || langDef.code) : (langDef.nameFr || langDef.code);
  const flag = langDef.flag;

  const authentic = authenticLanguageStories[code] || [];
  const lessons: Lesson[] = [];

  // Add custom defined authentic stories
  authentic.forEach((story, idx) => {
    lessons.push({
      id: `${code}-auth-${idx + 1}`,
      title: story.title,
      collection: `YAPRO ${story.kind}s · ${langName} ${flag}`,
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
  const template = nativeTemplates[code];

  for (let i = lessons.length + 1; i <= 52; i++) {
    const lvl = levels[i % levels.length];
    const knd = kinds[i % kinds.length];

    if (template) {
      lessons.push({
        id: `${code}-lesson-${i}`,
        title: template.makeTitle(i, knd, flag),
        collection: `YAPRO ${knd}s · ${langName} ${flag}`,
        language: code,
        level: lvl,
        kind: knd,
        durationSeconds: 90 + (i % 6) * 40,
        imagePosition: i % 3 === 0 ? 'left' : i % 3 === 1 ? 'center' : 'right',
        content: template.makeContent(i),
        translation: template.makeTranslation(i, baseLang),
      });
    } else {
      // Fallback for languages without native template: clean bilingual story in target language & base language
      lessons.push({
        id: `${code}-lesson-${i}`,
        title: `${i}. ${knd} : Leçon ${langName} ${flag}`,
        collection: `YAPRO ${knd}s · ${langName} ${flag}`,
        language: code,
        level: lvl,
        kind: knd,
        durationSeconds: 90 + (i % 6) * 40,
        imagePosition: i % 3 === 0 ? 'left' : i % 3 === 1 ? 'center' : 'right',
        content: `Learning ${langName} ${flag} · Lesson ${i}. Daily reading and listening in ${langName} builds your vocabulary, oral comprehension, and fluency. Practice reading carefully, explore new words, and enjoy your progress!`,
        translation: `Bienvenue dans la leçon ${i} d'apprentissage de la langue ${langName} ${flag}. Développez votre vocabulaire et votre compréhension orale chaque jour !`,
      });
    }
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
  return value.toLocaleLowerCase().replace(/[’']/g, "'").replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, '');
}

export function getWordCount(content: string) {
  return content.split(/\s+/).filter(Boolean).length;
}

export function formatDuration(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`;
}
