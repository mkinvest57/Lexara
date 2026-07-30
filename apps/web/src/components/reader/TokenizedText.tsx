'use client';

import { cn } from '@/lib/utils';

interface TokenizedTextProps {
  sentences: any[];
  onWordClick: (token: any, sentence: any) => void;
  savedVocabTerms: Set<string>;
}

export function TokenizedText({ sentences, onWordClick, savedVocabTerms }: TokenizedTextProps) {
  const getWordColor = (token: any) => {
    const lemma = (token.lemma || token.form).toLowerCase();

    // Check if word is saved
    if (savedVocabTerms.has(lemma)) {
      return 'bg-yellow-200 dark:bg-yellow-900/50 hover:bg-yellow-300 dark:hover:bg-yellow-800/70';
    }

    // Check if it's punctuation (don't highlight)
    if (/^[.,!?;:()"]$/.test(token.form)) {
      return '';
    }

    // Unknown word (blue)
    return 'hover:bg-blue-100 dark:hover:bg-blue-900/30 cursor-pointer';
  };

  return (
    <div className="space-y-4 text-lg leading-relaxed">
      {sentences.map((sentence) => (
        <p key={sentence.id} className="inline">
          {sentence.tokens.map((token: any, idx: number) => {
            const isPunctuation = /^[.,!?;:()"]$/.test(token.form);
            const needsSpace = idx > 0 && !isPunctuation;

            return (
              <span key={token.id}>
                {needsSpace && ' '}
                <span
                  className={cn(
                    'inline-block rounded px-0.5 transition-colors',
                    getWordColor(token),
                    !isPunctuation && 'cursor-pointer'
                  )}
                  onClick={() => !isPunctuation && onWordClick(token, sentence)}
                >
                  {token.form}
                </span>
              </span>
            );
          })}
          {' '}
        </p>
      ))}
    </div>
  );
}
