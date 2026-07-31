import * as Speech from 'expo-speech';
import type { SpeechOptions, Voice } from 'expo-speech';

const DEFAULT_LANGUAGE = 'en-US';
const preferredVoiceNames = [
  'ava',
  'aria',
  'jenny',
  'samantha',
  'serena',
  'daniel',
  'guy',
  'google us english',
  'google uk english female',
  'microsoft',
];
const noveltyVoiceNames = ['bad news', 'bells', 'bubbles', 'cellos', 'whisper', 'zarvox'];

let voicePromise: Promise<Voice | undefined> | undefined;
let speechRequest = 0;

function scoreVoice(voice: Voice) {
  const language = voice.language.toLocaleLowerCase();
  const name = voice.name.toLocaleLowerCase();
  let score = 0;

  if (language === 'en-us') score += 500;
  else if (language.startsWith('en-')) score += 300;
  if (voice.quality === Speech.VoiceQuality.Enhanced) score += 240;
  if (/natural|neural|premium|enhanced/.test(name)) score += 120;

  const preferredIndex = preferredVoiceNames.findIndex((candidate) => name.includes(candidate));
  if (preferredIndex >= 0) score += 100 - preferredIndex * 4;
  if (noveltyVoiceNames.some((candidate) => name.includes(candidate))) score -= 500;

  return score;
}

export async function getPreferredEnglishVoice() {
  if (!voicePromise) {
    voicePromise = Speech.getAvailableVoicesAsync()
      .then((voices) =>
        voices
          .filter((voice) => voice.language.toLocaleLowerCase().startsWith('en'))
          .sort((left, right) => scoreVoice(right) - scoreVoice(left))[0],
      )
      .catch(() => undefined);
  }
  return voicePromise;
}

export type SpeakEnglishOptions = Pick<
  SpeechOptions,
  'onBoundary' | 'onDone' | 'onError' | 'onStart' | 'onStopped'
> & {
  rate?: number;
};

export async function speakEnglish(text: string, options: SpeakEnglishOptions = {}) {
  const cleanText = text.trim();
  if (!cleanText) return;

  const request = ++speechRequest;
  await Speech.stop();
  const voice = await getPreferredEnglishVoice();
  if (request !== speechRequest) return;

  const isCurrent = () => request === speechRequest;
  Speech.speak(cleanText, {
    language: voice?.language || DEFAULT_LANGUAGE,
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

export async function stopSpeech() {
  speechRequest += 1;
  await Speech.stop();
}

