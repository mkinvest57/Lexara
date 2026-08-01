'use client';

import { useMemo } from 'react';
import {
  tokenize,
  needsLeadingSpace,
  isRtl,
  paintFor,
  type RawToken,
  type WordStatus,
  type SplitSentence,
} from '@yapro/core';

interface ReaderTextProps {
  sentences: SplitSentence[];
  languageCode: string;
  /** Called on every render; statusVersion from the store drives re-renders. */
  getStatus: (lemma: string) => WordStatus;
  selectedLemma?: string | null;
  onTokenClick: (token: RawToken, sentenceText: string) => void;
  fontSize?: number;
  lineHeight?: number;
}

export function ReaderText({
  sentences,
  languageCode,
  getStatus,
  selectedLemma,
  onTokenClick,
  fontSize = 20,
  lineHeight = 2.15,
}: ReaderTextProps) {
  const rtl = useMemo(() => isRtl(languageCode), [languageCode]);

  // Tokenize once per page change; status colours are applied via inline styles
  // on every render so statusVersion drives re-colouring without re-tokenizing.
  const parsed = useMemo(
    () => sentences.map((s) => ({ sentence: s, tokens: tokenize(s.text, languageCode) })),
    [sentences, languageCode]
  );

  return (
    <div
      className="font-medium text-[#101923]"
      style={{ fontSize, lineHeight, direction: rtl ? 'rtl' : 'ltr' }}
    >
      {parsed.map(({ sentence, tokens }) => (
        <span key={sentence.position}>
          {tokens.map((token, idx) => {
            if (!token.isWord) return <span key={idx}>{token.form}</span>;

            const status = getStatus(token.lemma);
            const paint = paintFor(status);
            const isSelected = selectedLemma !== null && token.lemma === selectedLemma;
            const prev = idx > 0 ? tokens[idx - 1] : undefined;
            const space = needsLeadingSpace(token, prev, languageCode);

            return (
              <span key={idx}>
                {space && !rtl ? ' ' : ''}
                <button
                  type="button"
                  onClick={() => onTokenClick(token, sentence.text)}
                  className={`inline rounded-[3px] px-0.5 py-px transition-[background-color] hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50${
                    isSelected ? ' ring-2 ring-[#0b1c2d]/60' : ''
                  }`}
                  style={
                    paint.background
                      ? { backgroundColor: paint.background, color: paint.text }
                      : undefined
                  }
                >
                  {token.form}
                </button>
                {space && rtl ? ' ' : ''}
              </span>
            );
          })}{' '}
        </span>
      ))}
    </div>
  );
}
