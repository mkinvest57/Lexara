'use client';

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

let speechRequest = 0;
let activeStop: (() => void) | undefined;

function scoreVoice(voice: SpeechSynthesisVoice) {
  const language = voice.lang.toLocaleLowerCase();
  const name = voice.name.toLocaleLowerCase();
  let score = 0;
  if (language === 'en-us') score += 500;
  else if (language.startsWith('en-')) score += 300;
  if (/natural|neural|premium|enhanced/.test(name)) score += 180;
  if (voice.localService) score += 20;
  if (voice.default) score += 10;
  const preferredIndex = preferredVoiceNames.findIndex((candidate) => name.includes(candidate));
  if (preferredIndex >= 0) score += 100 - preferredIndex * 4;
  if (noveltyVoiceNames.some((candidate) => name.includes(candidate))) score -= 500;
  return score;
}

async function loadVoices() {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const available = window.speechSynthesis.getVoices();
  if (available.length) return available;

  return new Promise<SpeechSynthesisVoice[]>((resolve) => {
    const finish = () => {
      window.speechSynthesis.removeEventListener('voiceschanged', finish);
      resolve(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', finish, { once: true });
    window.setTimeout(finish, 700);
  });
}

export async function getPreferredEnglishWebVoice() {
  const voices = await loadVoices();
  return voices
    .filter((voice) => voice.lang.toLocaleLowerCase().startsWith('en'))
    .sort((left, right) => scoreVoice(right) - scoreVoice(left))[0];
}

export async function speakEnglishWeb(
  text: string,
  options: {
    rate?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
    onBoundary?: (event: SpeechSynthesisEvent) => void;
  } = {}
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return false;
  const request = ++speechRequest;
  activeStop?.();
  activeStop = undefined;
  window.speechSynthesis.cancel();
  const voice = await getPreferredEnglishWebVoice();
  if (request !== speechRequest) return false;

  const utterance = new SpeechSynthesisUtterance(text.trim());
  utterance.lang = voice?.lang || 'en-US';
  utterance.voice = voice || null;
  utterance.rate = options.rate ?? 0.9;
  utterance.pitch = 1;
  activeStop = () => {
    if (request === speechRequest) options.onEnd?.();
  };
  utterance.onstart = () => request === speechRequest && options.onStart?.();
  utterance.onend = () => {
    if (request !== speechRequest) return;
    activeStop = undefined;
    options.onEnd?.();
  };
  utterance.onerror = () => {
    if (request !== speechRequest) return;
    activeStop = undefined;
    options.onError?.();
  };
  utterance.onboundary = (event) => {
    if (request === speechRequest) options.onBoundary?.(event);
  };
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopWebSpeech() {
  activeStop?.();
  activeStop = undefined;
  speechRequest += 1;
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
