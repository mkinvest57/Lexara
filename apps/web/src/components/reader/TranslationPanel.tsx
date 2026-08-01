'use client';

import { useEffect, useState } from 'react';
import { BookMarked, Check, Loader2, Trash2, Volume2, X } from 'lucide-react';
import { statusBarLevel } from '@yapro/core';
import { requestTranslation } from '@/lib/translate';
import { speakEnglishWeb } from '@/lib/speech';
import {
  translations,
  useProductStore,
  type LearningStatus,
  type SavedWord,
} from '@/lib/product-store';

interface TranslationPanelProps {
  word: string;
  sentence: string;
  sourceLanguage?: string;
  savedWord?: SavedWord;
  onSave: (translation: string, status: LearningStatus) => void | Promise<void>;
  onRemove?: () => void;
  onClose: () => void;
}

const statuses: { value: LearningStatus; label: string }[] = [
  { value: 1, label: 'Nouveau' },
  { value: 2, label: 'En apprentissage 2' },
  { value: 3, label: 'En apprentissage 3' },
  { value: 4, label: 'Presque connu' },
  { value: 'known', label: 'Connu' },
];

export function TranslationPanel({
  word,
  sentence,
  onSave,
  onRemove,
  onClose,
  sourceLanguage = 'en',
  savedWord,
}: TranslationPanelProps) {
  const showPronunciation = useProductStore((state) => state.preferences.showPronunciation);
  const speechRate = useProductStore((state) => state.preferences.speechRate);
  const localMeaning = translations[word.toLocaleLowerCase()] || savedWord?.translation || '';
  const [meaning, setMeaning] = useState(savedWord?.translation || localMeaning);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<LearningStatus>(savedWord?.status || 1);
  const [message, setMessage] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setMeaning(savedWord?.translation || translations[word.toLocaleLowerCase()] || '');
    setStatus(savedWord?.status || 1);
    setMessage('');
    setSuggestions([]);
  }, [savedWord, word]);

  useEffect(() => {
    if (savedWord?.translation || translations[word.toLocaleLowerCase()]) return;
    const controller = new AbortController();
    let active = true;
    const translate = async () => {
      setLoading(true);
      try {
        const result = await requestTranslation(word, 'fr', sourceLanguage, controller.signal);
        if (!active) return;
        if (result.translatedText) setMeaning(result.translatedText);
        setSuggestions(result.alternatives);
      } catch (error) {
        if (active && (error as { name?: string })?.name !== 'AbortError')
          setMessage('Traduction automatique indisponible : ajoutez votre propre sens.');
      } finally {
        if (active) setLoading(false);
      }
    };
    void translate();
    return () => {
      active = false;
      controller.abort();
    };
  }, [savedWord?.translation, sourceLanguage, word]);

  const speak = () => void speakEnglishWeb(word, { rate: Math.min(0.86, speechRate) });

  const save = async (nextStatus: LearningStatus = status) => {
    if (!meaning.trim()) {
      setMessage('Ajoutez un sens avant de sauvegarder ce mot.');
      return;
    }
    setSaving(true);
    setStatus(nextStatus);
    setMessage('');
    try {
      await onSave(meaning.trim(), nextStatus);
      setMessage(
        nextStatus === 'known' ? 'Mot marqué comme connu.' : 'Mot sauvegardé dans votre vocabulaire.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <aside
      className="flex h-full w-full flex-col overscroll-contain bg-white lg:w-[392px] lg:border-l lg:border-slate-300"
      aria-label={`Dictionnaire pour ${word}`}
    >
      <div className="flex items-start justify-between border-b border-slate-200 px-5 py-5">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={speak}
              className="grid h-9 w-9 place-items-center rounded-full hover:bg-slate-100"
              aria-label={`Écouter ${word}`}
            >
              <Volume2 className="h-5 w-5" />
            </button>
            <h2 className="text-2xl font-bold tracking-tight">{word}</h2>
          </div>
          <p className="mt-1 pl-11 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
            {showPronunciation && savedWord?.pronunciation ? `${savedWord.pronunciation} · ` : ''}
            {sourceLanguage} → français
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 place-items-center rounded-full hover:bg-slate-100"
          aria-label="Fermer le dictionnaire"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <label
          htmlFor="saved-meaning"
          className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500"
        >
          Signification sauvegardée
        </label>
        <div className="relative mt-3">
          <textarea
            id="saved-meaning"
            name="saved-meaning"
            autoComplete="off"
            value={meaning}
            onChange={(event) => setMeaning(event.target.value)}
            placeholder="Entrez une nouvelle signification…"
            className="min-h-20 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-3 py-3 pr-10 text-base outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/15"
          />
          {loading && (
            <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-slate-400" />
          )}
        </div>

        <section className="mt-7">
          <h3 className="text-sm font-bold">Traductions suggérées</h3>
          <div className="mt-3 space-y-2">
            {[localMeaning, savedWord?.translation, ...suggestions]
              .filter(
                (value, index, list): value is string =>
                  Boolean(value) && list.indexOf(value) === index
              )
              .map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setMeaning(suggestion)}
                  className="flex min-h-10 w-full items-center justify-between rounded-lg bg-slate-100 px-3 text-left text-sm text-blue-600 hover:bg-blue-50"
                >
                  <span>{suggestion}</span>
                  <span className="text-lg">+</span>
                </button>
              ))}
          </div>
        </section>

        <section className="mt-7">
          <h3 className="text-sm font-bold">Dans cette phrase</h3>
          <blockquote className="mt-3 border-l-2 border-blue-400 pl-4 text-sm leading-6 text-slate-600">
            {sentence}
          </blockquote>
        </section>

        {message && (
          <p
            role="status"
            className={`mt-5 rounded-xl px-3 py-2 text-sm ${message.includes('indisponible') || message.includes('Ajoutez') ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}
          >
            {message}
          </p>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          {savedWord && onRemove && (
            <button
              type="button"
              onClick={onRemove}
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-300 text-slate-500 hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              aria-label={`Supprimer ${word} du vocabulaire`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
          {statuses.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              disabled={saving}
              onClick={() => void save(value)}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border text-sm font-bold transition ${status === value && savedWord ? (value === 1 ? 'border-amber-400 bg-amber-200' : value === 'known' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-blue-400 bg-blue-50 text-blue-700') : 'border-slate-300 bg-white text-slate-600 hover:border-blue-400'}`}
              aria-label={`Définir le statut : ${label}`}
              title={label}
            >
              {value === 'known' ? <Check className="h-4 w-4" /> : statusBarLevel(value)}
            </button>
          ))}
          {!savedWord && (
            <button
              type="button"
              onClick={() => void save()}
              disabled={saving || !meaning.trim()}
              className="ml-auto inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#0b1c2d] px-4 text-sm font-bold text-white disabled:opacity-40"
            >
              <BookMarked className="h-4 w-4" />
              Sauver
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
