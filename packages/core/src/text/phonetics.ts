/**
 * Reading aids: furigana (Japanese), pinyin (Mandarin), transliteration.
 *
 * The pinyin engine is injected rather than imported so that the mobile bundle
 * is not forced to include `pinyin-pro`. Web registers the real provider at
 * startup; without a provider we degrade to the built-in lookup tables.
 */

export type PhoneticMode = 'off' | 'pinyin' | 'furigana' | 'romaji';

export type PinyinProvider = (text: string) => string | null;

let pinyinProvider: PinyinProvider | null = null;

export function registerPinyinProvider(provider: PinyinProvider): void {
  pinyinProvider = provider;
}

const FURIGANA: Record<string, string> = {
  日本語: 'にほんご',
  学習: 'がくしゅう',
  毎日: 'まいにち',
  文章: 'ぶんしょう',
  語彙力: 'ごいりょく',
  会話: 'かいわ',
  単語: 'たんご',
  私: 'わたし',
  人: 'ひと',
  本: 'ほん',
};

const ARABIC_TRANSLITERATION: Record<string, string> = {
  'مرحباً': 'marhaban',
  'الدرس': 'ad-dars',
  'العربية': 'al-arabiyyah',
  'القراءة': "al-qira'ah",
  'الاستماع': "al-istima'",
  'المفردات': 'al-mufradat',
  'شكراً': 'shukran',
  'جميل': 'jameel',
};

const CYRILLIC_TRANSLITERATION: Record<string, string> = {
  Привет: 'Privet',
  Урок: 'Urok',
  русский: 'russkiy',
  чтение: 'chteniye',
  словарь: "slovar'",
};

/** Character-level Cyrillic fallback so unseen words still get a reading. */
const CYRILLIC_MAP: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z',
  и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r',
  с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh',
  щ: 'shch', ъ: '', ы: 'y', ь: "'", э: 'e', ю: 'yu', я: 'ya',
};

function transliterateCyrillic(text: string): string {
  return Array.from(text)
    .map((char) => {
      const lower = char.toLocaleLowerCase('ru');
      const mapped = CYRILLIC_MAP[lower];
      if (mapped === undefined) return char;
      return char === lower ? mapped : mapped.charAt(0).toUpperCase() + mapped.slice(1);
    })
    .join('');
}

export function getPhoneticAnnotation(text: string, languageCode: string): string | null {
  const lang = languageCode.toLowerCase();
  const clean = text.trim();
  if (!clean) return null;

  if (lang === 'ja') {
    return FURIGANA[clean] ?? null;
  }

  if (lang === 'zh' || lang === 'zh-tw' || lang === 'zh-trad' || lang === 'yue') {
    if (pinyinProvider) {
      try {
        return pinyinProvider(clean);
      } catch {
        return null;
      }
    }
    return null;
  }

  if (lang === 'ar' || lang === 'fa' || lang === 'ur') {
    return ARABIC_TRANSLITERATION[clean] ?? null;
  }

  if (lang === 'ru' || lang === 'uk' || lang === 'bg' || lang === 'sr') {
    return CYRILLIC_TRANSLITERATION[clean] ?? transliterateCyrillic(clean);
  }

  return null;
}

/** The reading aid that applies to a language, used to default user settings. */
export function defaultPhoneticMode(languageCode: string): PhoneticMode {
  const lang = languageCode.toLowerCase();
  if (lang === 'ja') return 'furigana';
  if (lang.startsWith('zh') || lang === 'yue') return 'pinyin';
  if (['ar', 'fa', 'ur', 'ru', 'uk', 'bg', 'sr', 'he', 'th', 'ko'].includes(lang)) return 'romaji';
  return 'off';
}
