export type PhoneticMode = 'off' | 'pinyin' | 'furigana' | 'romaji';

export function getPhoneticAnnotation(text: string, language: string): string | null {
  const lang = language.toLowerCase();
  const clean = text.trim();
  if (!clean) return null;

  if (lang === 'ja') {
    const jaMap: Record<string, string> = {
      '日本語': 'にほんご',
      '学習': 'がくしゅう',
      '毎日': 'まいにち',
      '文章': 'ぶんしょう',
      '語彙力': 'ごいりょく',
      '会話': 'かいわ',
      '単語': 'たんご',
      '私': 'わたし',
      '人': 'ひと',
      '本': 'ほん',
    };
    return jaMap[clean] || null;
  }

  if (lang === 'zh' || lang === 'zh-trad') {
    const zhMap: Record<string, string> = {
      '汉语': 'hàn yǔ',
      '学习': 'xué xí',
      '每天': 'měi tiān',
      '阅读': 'yuè dú',
      '听力': 'tīng lì',
      '词汇': 'cí huì',
      '表达': 'biǎo dá',
      '课程': 'kè chéng',
      '你好': 'nǐ hǎo',
      '谢谢': 'xiè xie',
    };
    return zhMap[clean] || null;
  }

  if (lang === 'ar') {
    const arMap: Record<string, string> = {
      'مرحباً': 'marhaban',
      'الدرس': 'ad-dars',
      'العربية': 'al-arabiyyah',
      'القراءة': 'al-qira\'ah',
      'الاستماع': 'al-istima\'',
      'المفردات': 'al-mufradat',
      'شكراً': 'shukran',
      'جميل': 'jameel',
    };
    return arMap[clean] || null;
  }

  if (lang === 'ru') {
    const ruMap: Record<string, string> = {
      'Привет': 'Privet',
      'Урок': 'Urok',
      'русский': 'russkiy',
      'чтение': 'chteniye',
      'словарь': 'slovar\'',
    };
    return ruMap[clean] || null;
  }

  return null;
}
