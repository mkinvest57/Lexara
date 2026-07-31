'use client';

import { ExternalLink } from 'lucide-react';

interface ExternalDictionariesProps {
  word: string;
  sourceLang?: string;
  targetLang?: string;
}

export function ExternalDictionaries({ word, sourceLang = 'en', targetLang = 'fr' }: ExternalDictionariesProps) {
  const cleanWord = encodeURIComponent(word.trim());

  const providers = [
    {
      name: 'Reverso Context',
      url: `https://context.reverso.net/traduction/${sourceLang}-${targetLang}/${cleanWord}`,
      badge: 'Contexte',
    },
    {
      name: 'DeepL Translate',
      url: `https://www.deepl.com/translator#${sourceLang}/${targetLang}/${cleanWord}`,
      badge: 'IA',
    },
    {
      name: 'Wiktionary',
      url: `https://${sourceLang}.wiktionary.org/wiki/${cleanWord}`,
      badge: 'Définitions',
    },
    {
      name: 'Cambridge',
      url: `https://dictionary.cambridge.org/dictionary/english/${cleanWord}`,
      badge: 'IPA',
    },
  ];

  return (
    <div className="mt-4 border-t border-slate-200 pt-3">
      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
        Dictionnaires Comparatifs Externes
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        {providers.map((p) => (
          <a
            key={p.name}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-teal-50 hover:text-teal-900"
          >
            <span>{p.name}</span>
            <span className="rounded bg-teal-900 px-1 py-0.5 text-[9px] font-bold text-white">
              {p.badge}
            </span>
            <ExternalLink className="h-3 w-3 text-slate-400" />
          </a>
        ))}
      </div>
    </div>
  );
}
