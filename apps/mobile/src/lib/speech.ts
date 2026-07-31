import * as Speech from 'expo-speech';
import type { SpeechOptions, Voice } from 'expo-speech';

const langCodeMap: Record<string, string> = {
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  it: 'it-IT',
  pt: 'pt-PT',
  ru: 'ru-RU',
  ja: 'ja-JP',
  zh: 'zh-CN',
  'zh-sim': 'zh-CN',
  'zh-trad': 'zh-TW',
  ko: 'ko-KR',
  ar: 'ar-SA',
  nl: 'nl-NL',
  pl: 'pl-PL',
  sv: 'sv-SE',
  no: 'nb-NO',
  fi: 'fi-FI',
  da: 'da-DK',
  el: 'el-GR',
  tr: 'tr-TR',
  uk: 'uk-UA',
  ro: 'ro-RO',
  sk: 'sk-SK',
  la: 'la',
  eo: 'eo',
};

let speechRequest = 0;

export async function getVoiceForLanguage(langCode: string = 'en'): Promise<Voice | undefined> {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const prefix = langCode.split('-')[0].toLowerCase();
    return voices.find((v) => v.language.toLowerCase().startsWith(prefix));
  } catch {
    return undefined;
  }
}

export async function getPreferredEnglishVoice(): Promise<Voice | undefined> {
  return getVoiceForLanguage('en');
}

export type SpeakOptions = Pick<
  SpeechOptions,
  'onBoundary' | 'onDone' | 'onError' | 'onStart' | 'onStopped'
> & {
  rate?: number;
  language?: string;
};

export async function speakLanguage(text: string, langCode: string = 'en', options: SpeakOptions = {}) {
  const cleanText = text.trim();
  if (!cleanText) return;

  const request = ++speechRequest;
  await Speech.stop();
  const voice = await getVoiceForLanguage(langCode);
  if (request !== speechRequest) return;

  const defaultLang = langCodeMap[langCode] || `${langCode}-${langCode.toUpperCase()}`;
  const isCurrent = () => request === speechRequest;

  Speech.speak(cleanText, {
    language: voice?.language || defaultLang,
    voice: voice?.identifier,
    rate: options.rate ?? 0.9,
    pitch: 1,
    onBoundary: options.onBoundary,
    onStart: () => {
      if (isCurrent()) options.onStart?.();
    },
    onDone: () => {
      if (isCurrent()) options.onDone?.();
    },
    onStopped: () => {
      if (isCurrent()) options.onStopped?.();
    },
    onError: (error) => {
      if (isCurrent()) options.onError?.(error);
    },
  });
}

export async function speakEnglish(text: string, options: SpeakOptions = {}) {
  return speakLanguage(text, options.language || 'en', options);
}

export async function speakSlow(text: string, options: SpeakOptions = {}) {
  return speakLanguage(text, options.language || 'en', { ...options, rate: 0.55 });
}

export async function stopSpeech() {
  speechRequest += 1;
  await Speech.stop();
}
