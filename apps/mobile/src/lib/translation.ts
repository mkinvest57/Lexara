import { dictionary, normalizeWord } from './catalog';

const translationCache = new Map<string, string>();

type MyMemoryResponse = {
  responseStatus?: number;
  responseData?: { translatedText?: string };
  matches?: { translation?: string; quality?: number; match?: number }[];
};

function selectTranslation(data: MyMemoryResponse, original: string) {
  const candidates = [
    ...(data.matches ?? []).map((match) => ({
      text: match.translation?.trim() ?? '',
      score: Number(match.quality ?? 0) * Number(match.match ?? 0),
    })),
    { text: data.responseData?.translatedText?.trim() ?? '', score: 0 },
  ]
    .filter((candidate) => candidate.text)
    .sort((left, right) => right.score - left.score);

  const different = candidates.find(
    (candidate) => candidate.text.toLocaleLowerCase() !== original.toLocaleLowerCase(),
  );
  return different?.text || candidates[0]?.text || original;
}

export async function translateText(text: string, sourceLang: string = 'en', targetLang: string = 'fr') {
  const cleanText = text.trim();
  if (!cleanText) return '';

  const normalized = normalizeWord(cleanText);
  if (normalized && sourceLang === 'en' && targetLang === 'fr') {
    const local = dictionary[normalized]?.translation;
    if (local) return local;
  }

  const key = `${sourceLang}:${targetLang}:${cleanText.toLocaleLowerCase()}`;
  const cached = translationCache.get(key);
  if (cached) return cached;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);
  try {
    const query = encodeURIComponent(cleanText.slice(0, 480));
    const langpair = `${sourceLang.split('-')[0]}|${targetLang.split('-')[0]}`;
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${query}&langpair=${langpair}`,
      { signal: controller.signal },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const translation = selectTranslation((await response.json()) as MyMemoryResponse, cleanText);
    if (!translation) throw new Error('missing-translation');
    translationCache.set(key, translation);
    return translation;
  } catch {
    const fallback = (normalized && dictionary[normalized]?.translation) || cleanText;
    return fallback;
  } finally {
    clearTimeout(timeout);
  }
}

export async function translateEnglishToFrench(text: string, sourceLang: string = 'en', targetLang: string = 'fr') {
  return translateText(text, sourceLang, targetLang);
}
