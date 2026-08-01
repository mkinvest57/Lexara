/**
 * Script-aware tokenizer.
 *
 * Space-delimited languages split on whitespace. CJK and Thai have no word
 * boundaries, so each character (or grapheme run) becomes its own token; this
 * is a coarse but honest fallback until a per-language segmenter is wired in.
 */

export type ScriptFamily = 'latin' | 'cyrillic' | 'arabic' | 'hebrew' | 'cjk' | 'thai' | 'indic';

export interface RawToken {
  form: string;
  /** Lowercased lookup key used to resolve word status. */
  lemma: string;
  /** Character offset within the sentence. */
  offset: number;
  isWord: boolean;
}

const NO_SPACE_SCRIPTS: ReadonlySet<ScriptFamily> = new Set(['cjk', 'thai']);

const SCRIPT_BY_LANGUAGE: Record<string, ScriptFamily> = {
  ja: 'cjk',
  zh: 'cjk',
  'zh-TW': 'cjk',
  yue: 'cjk',
  ko: 'cjk',
  th: 'thai',
  km: 'thai',
  ar: 'arabic',
  fa: 'arabic',
  ur: 'arabic',
  he: 'hebrew',
  ru: 'cyrillic',
  uk: 'cyrillic',
  bg: 'cyrillic',
  sr: 'cyrillic',
  be: 'cyrillic',
  mk: 'cyrillic',
  hi: 'indic',
  gu: 'indic',
  pa: 'indic',
};

export function scriptFor(languageCode: string): ScriptFamily {
  const exact = SCRIPT_BY_LANGUAGE[languageCode];
  if (exact) return exact;
  const base = languageCode.split('-')[0];
  return SCRIPT_BY_LANGUAGE[base] ?? 'latin';
}

export function isRtl(languageCode: string): boolean {
  const script = scriptFor(languageCode);
  return script === 'arabic' || script === 'hebrew';
}

const PUNCTUATION = /^[\p{P}\p{S}\s]+$/u;

export function isPunctuation(value: string): boolean {
  return PUNCTUATION.test(value);
}

/** Normalises a surface form into the key used for status lookup. */
export function toLemma(form: string, languageCode: string): string {
  const script = scriptFor(languageCode);
  const trimmed = form.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, '');
  // Casing is meaningless in CJK/Thai; lowercasing is safe elsewhere.
  return NO_SPACE_SCRIPTS.has(script) ? trimmed : trimmed.toLocaleLowerCase(languageCode);
}

function tokenizeNoSpace(text: string): RawToken[] {
  const tokens: RawToken[] = [];
  // Group runs of the same character class so numbers and latin words stay whole.
  const pattern = /(\p{Script=Han}|\p{Script=Hiragana}+|\p{Script=Katakana}+|\p{Script=Hangul}+|\p{Script=Thai}+|\p{Script=Khmer}+|[\p{Script=Latin}\p{Nd}]+|[\p{P}\p{S}]|\s+)/gu;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const form = match[0];
    if (/^\s+$/.test(form)) continue;
    tokens.push({
      form,
      lemma: form,
      offset: match.index,
      isWord: !isPunctuation(form),
    });
  }
  return tokens;
}

function tokenizeSpaced(text: string, languageCode: string): RawToken[] {
  const tokens: RawToken[] = [];
  const pattern = /([\p{L}\p{M}\p{Nd}]+(?:['’\-][\p{L}\p{M}]+)*|[\p{P}\p{S}])/gu;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    const form = match[0];
    const word = !isPunctuation(form);
    tokens.push({
      form,
      lemma: word ? toLemma(form, languageCode) : form,
      offset: match.index,
      isWord: word,
    });
  }
  return tokens;
}

export function tokenize(text: string, languageCode: string): RawToken[] {
  const script = scriptFor(languageCode);
  return NO_SPACE_SCRIPTS.has(script)
    ? tokenizeNoSpace(text)
    : tokenizeSpaced(text, languageCode);
}

/** Whether a space should be rendered before this token. */
export function needsLeadingSpace(
  token: RawToken,
  previous: RawToken | undefined,
  languageCode: string
): boolean {
  if (!previous) return false;
  if (NO_SPACE_SCRIPTS.has(scriptFor(languageCode))) return false;
  if (!token.isWord) return false;
  return true;
}

export function countWords(text: string, languageCode: string): number {
  return tokenize(text, languageCode).filter((token) => token.isWord).length;
}
