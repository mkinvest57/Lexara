'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ReviewCard {
  id: string;
  term: string;
  translation: string;
}

interface ReviewModalProps {
  cards: ReviewCard[];
  onComplete: (reviewedIds: string[]) => void | Promise<void>;
  onClose: () => void;
}

type MatchCard = {
  key: string;
  pairId: string;
  text: string;
  type: 'term' | 'translation';
};

export function ReviewModal({ cards, onComplete, onClose }: ReviewModalProps) {
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [matchedKeys, setMatchedKeys] = useState<Set<string>>(new Set());
  const [locked, setLocked] = useState(false);
  const completionSent = useRef(false);

  const reviewCards = useMemo(() => cards.slice(0, 3), [cards]);
  const matchCards = useMemo<MatchCard[]>(() => {
    const terms = reviewCards.map((card) => ({
      key: `term-${card.id}`,
      pairId: card.id,
      text: card.term,
      type: 'term' as const,
    }));
    const translations = reviewCards
      .map((card) => ({
        key: `translation-${card.id}`,
        pairId: card.id,
        text: card.translation,
        type: 'translation' as const,
      }))
      .sort(() => Math.random() - 0.5);

    return [...terms, ...translations];
  }, [reviewCards]);

  useEffect(() => {
    if (
      matchCards.length > 0 &&
      matchedKeys.size === matchCards.length &&
      !completionSent.current
    ) {
      completionSent.current = true;
      const completionTimer = window.setTimeout(() => {
        void onComplete(reviewCards.map((card) => card.id));
      }, 450);

      return () => window.clearTimeout(completionTimer);
    }
  }, [matchCards.length, matchedKeys.size, onComplete, reviewCards]);

  const handleCardClick = (card: MatchCard) => {
    if (locked || matchedKeys.has(card.key) || selectedKeys.includes(card.key)) {
      return;
    }

    const nextSelection = [...selectedKeys, card.key];
    setSelectedKeys(nextSelection);

    if (nextSelection.length !== 2) return;

    const firstCard = matchCards.find((item) => item.key === nextSelection[0]);
    const secondCard = matchCards.find((item) => item.key === nextSelection[1]);
    const isMatch =
      firstCard &&
      secondCard &&
      firstCard.type !== secondCard.type &&
      firstCard.pairId === secondCard.pairId;

    setLocked(true);
    window.setTimeout(
      () => {
        if (isMatch) {
          setMatchedKeys((previous) => new Set([...previous, ...nextSelection]));
        }
        setSelectedKeys([]);
        setLocked(false);
      },
      isMatch ? 240 : 520
    );
  };

  const progress = matchCards.length ? (matchedKeys.size / matchCards.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-[70] bg-[#f7f8f6] p-4 sm:p-7">
      <div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
        <div className="flex items-center gap-5 px-5 py-5 sm:px-8">
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close review">
            <X className="h-5 w-5" />
          </Button>
          <div className="flex flex-1 items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-teal-500 transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="min-w-12 text-sm font-semibold text-teal-700">
              {matchedKeys.size / 2}/{reviewCards.length}
            </span>
          </div>
          <Button variant="ghost" size="icon" aria-label="Review options">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center px-5 py-8">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
            Quick review
          </p>
          <h2 className="mb-10 text-2xl font-bold text-slate-950 sm:text-3xl">
            Match each word to its meaning
          </h2>

          <div className="grid w-full max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {matchCards.map((card) => {
              const isSelected = selectedKeys.includes(card.key);
              const isMatched = matchedKeys.has(card.key);

              return (
                <button
                  key={card.key}
                  type="button"
                  onClick={() => handleCardClick(card)}
                  disabled={isMatched || locked}
                  className={`min-h-24 rounded-2xl border px-6 py-5 text-lg font-semibold transition-[transform,background-color,border-color,box-shadow,opacity] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/25 ${
                    isMatched
                      ? 'border-teal-200 bg-teal-50 text-teal-700 opacity-55'
                      : isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-950 shadow-sm'
                        : 'border-slate-200 bg-white text-slate-900 shadow-[0_8px_24px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.12)]'
                  }`}
                >
                  {card.text}
                </button>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-center">
          <Button variant="ghost" onClick={onClose} className="text-slate-500">
            Review later
          </Button>
        </div>
      </div>
    </div>
  );
}
