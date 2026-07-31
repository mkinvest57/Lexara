'use client';

import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ClipboardPaste,
  FileText,
  Globe2,
  Loader2,
  Upload,
} from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { useProductStore } from '@/lib/product-store';

type SourceType = 'text' | 'web' | 'file';

const sourceOptions: {
  id: SourceType;
  title: string;
  copy: string;
  icon: typeof ClipboardPaste;
}[] = [
  {
    id: 'text',
    title: 'Texte copié-collé',
    copy: 'Collez un article, une histoire ou une transcription.',
    icon: ClipboardPaste,
  },
  {
    id: 'web',
    title: 'Lien web',
    copy: 'Conservez la source puis ajoutez le texte à apprendre.',
    icon: Globe2,
  },
  {
    id: 'file',
    title: 'Fichier texte',
    copy: 'Importez un fichier .txt ou .md depuis votre appareil.',
    icon: FileText,
  },
];

export default function ImportPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const token = (session as { accessToken?: string } | null)?.accessToken;
  const importLesson = useProductStore((state) => state.importLesson);
  const mergeRemote = useProductStore((state) => state.mergeRemote);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [source, setSource] = useState<SourceType>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [level, setLevel] = useState<'debutant-1' | 'debutant-2' | 'intermediaire-1'>('debutant-1');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const wordCount = useMemo(() => content.trim().split(/\s+/).filter(Boolean).length, [content]);
  const canContinue =
    title.trim().length >= 2 && wordCount >= 8 && (source !== 'web' || Boolean(sourceUrl.trim()));

  useEffect(() => {
    if (!content.trim() || busy) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [busy, content]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!/\.(txt|md)$/i.test(file.name)) {
      setError('Choisissez un fichier .txt ou .md.');
      return;
    }
    setError('');
    const text = await file.text();
    setContent(text);
    if (!title) setTitle(file.name.replace(/\.(txt|md)$/i, ''));
  };

  const createLesson = async () => {
    if (!canContinue) return;
    setBusy(true);
    setError('');
    const common = {
      title: title.trim(),
      content: content.trim(),
      type: source === 'web' ? 'Article web' : source === 'file' ? 'Document' : 'Texte',
      level,
      levelLabel:
        level === 'debutant-1'
          ? 'Débutant 1'
          : level === 'debutant-2'
            ? 'Débutant 2'
            : 'Intermédiaire 1',
      collection: 'Leçons importées',
      image: '/brand/immerli-hero.png',
      translation: 'Ajoutez votre traduction depuis le lecteur.',
      duration: `${Math.max(1, Math.ceil(wordCount / 120))
        .toString()
        .padStart(2, '0')}:00`,
      sourceUrl: sourceUrl.trim() || undefined,
    } as const;

    try {
      if (token) {
        try {
          const profile = await apiClient.getLanguageProfile(token);
          const remoteLesson = await apiClient.createLesson(token, {
            profileId: profile.id,
            title: common.title,
            content: common.content,
            type: common.type,
            level: level.startsWith('debutant') ? 'beginner' : 'intermediate',
            sourceUrl: common.sourceUrl,
          });
          mergeRemote({ lessons: [{ ...remoteLesson, imported: true, imageUrl: common.image }] });
          router.push(`/lesson/${remoteLesson.id}`);
          return;
        } catch {
          // The local copy below is the intentional offline fallback.
        }
      }

      const lesson = importLesson(common);
      router.push(`/lesson/${lesson.id}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f1f3f4] px-4 py-8 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1260px]">
        <ol className="grid grid-cols-3 gap-2" aria-label="Progression de l’import">
          {(
            [
              [1, 'Choisir la source'],
              [2, 'Ajouter le contenu'],
              [3, 'Vérifier et importer'],
            ] as [1 | 2 | 3, string][]
          ).map(([number, label]) => {
            const active = step === number;
            const complete = step > number;
            return (
              <li key={number} className="relative flex flex-col items-center text-center">
                <span
                  className={`relative z-10 grid h-8 w-8 place-items-center rounded-full border text-sm font-bold ${active ? 'border-blue-600 bg-blue-600 text-white' : complete ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-[#f1f3f4] text-slate-500'}`}
                >
                  {complete ? <Check className="h-4 w-4" /> : number}
                </span>
                <span
                  className={`mt-2 text-xs font-semibold ${active ? 'text-blue-700' : 'text-slate-500'}`}
                >
                  {label}
                </span>
                {number !== 3 && (
                  <span className="absolute left-[calc(50%+20px)] right-[calc(-50%+20px)] top-4 h-px bg-slate-300" />
                )}
              </li>
            );
          })}
        </ol>

        <header className="mx-auto mt-9 max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Le véritable progrès commence par{' '}
            <span className="text-blue-600">du contenu réel.</span>
          </h1>
          <p className="mt-3 text-slate-600">
            Créez une leçon interactive à partir d’un texte que vous avez le droit d’utiliser.
          </p>
        </header>

        <section className="mt-8 overflow-hidden rounded-2xl border border-emerald-500 bg-white shadow-sm">
          {step === 1 && (
            <div className="grid divide-y divide-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">
              {sourceOptions.map(({ id, title: optionTitle, copy, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSource(id);
                    setStep(2);
                    setError('');
                  }}
                  className="flex min-h-[260px] flex-col items-center justify-center px-8 py-10 text-center transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-inset focus-visible:ring-blue-500/25"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eef4ff] text-blue-600">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-5 text-lg font-bold">{optionTitle}</h2>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">{copy}</p>
                  <span className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-bold">
                    Choisir <ArrowRight className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="mx-auto max-w-3xl p-6 sm:p-9">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Changer de source
              </button>
              <div className="mt-5 grid gap-5">
                <label className="grid gap-2 text-sm font-bold">
                  Titre de la leçon
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Ex. Une promenade à Londres…"
                    name="lesson-title"
                    autoComplete="off"
                    className="h-12 rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                  />
                </label>
                {source === 'web' && (
                  <label className="grid gap-2 text-sm font-bold">
                    Lien source
                    <input
                      type="url"
                      value={sourceUrl}
                      onChange={(event) => setSourceUrl(event.target.value)}
                      placeholder="https://…"
                      name="lesson-source-url"
                      autoComplete="off"
                      className="h-12 rounded-xl border border-slate-300 px-4 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                    />
                    <span className="text-xs font-normal leading-5 text-slate-500">
                      Pour respecter les sites sources et éviter les erreurs d’extraction, collez
                      aussi le texte ci-dessous.
                    </span>
                  </label>
                )}
                {source === 'file' && (
                  <label className="flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed border-slate-300 px-4 text-sm font-bold text-slate-600 hover:border-blue-400 hover:bg-blue-50/40">
                    <Upload className="h-5 w-5" />
                    Choisir un fichier .txt ou .md
                    <input
                      type="file"
                      accept=".txt,.md,text/plain,text/markdown"
                      onChange={handleFile}
                      className="sr-only"
                    />
                  </label>
                )}
                <label className="grid gap-2 text-sm font-bold">
                  Texte de la leçon
                  <textarea
                    value={content}
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Collez le texte original ici…"
                    name="lesson-content"
                    autoComplete="off"
                    className="min-h-64 resize-y rounded-xl border border-slate-300 px-4 py-3 font-normal leading-7 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                  />
                  <span className="text-right text-xs font-normal text-slate-500">
                    {wordCount} mots · minimum 8
                  </span>
                </label>
                <label className="grid gap-2 text-sm font-bold">
                  Niveau
                  <select
                    value={level}
                    onChange={(event) => setLevel(event.target.value as typeof level)}
                    className="h-12 rounded-xl border border-slate-300 bg-white px-4 font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                  >
                    <option value="debutant-1">Débutant 1</option>
                    <option value="debutant-2">Débutant 2</option>
                    <option value="intermediaire-1">Intermédiaire 1</option>
                  </select>
                </label>
                {error && (
                  <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!canContinue}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#0b1c2d] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Vérifier la leçon <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="mx-auto max-w-4xl p-6 sm:p-9">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                <ArrowLeft className="h-4 w-4" />
                Modifier
              </button>
              <div className="mt-5 grid gap-6 lg:grid-cols-[260px_1fr]">
                <div className="rounded-2xl bg-[#0b1c2d] p-6 text-white">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-300">
                    Aperçu
                  </p>
                  <h2 className="mt-3 text-2xl font-bold leading-tight">{title}</h2>
                  <dl className="mt-8 space-y-4 text-sm">
                    <div>
                      <dt className="text-slate-400">Source</dt>
                      <dd className="mt-1 font-semibold capitalize">{source}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Longueur</dt>
                      <dd className="mt-1 font-semibold">{wordCount} mots</dd>
                    </div>
                    <div>
                      <dt className="text-slate-400">Niveau</dt>
                      <dd className="mt-1 font-semibold">
                        {level === 'debutant-1'
                          ? 'Débutant 1'
                          : level === 'debutant-2'
                            ? 'Débutant 2'
                            : 'Intermédiaire 1'}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Premiers mots
                  </p>
                  <p className="mt-4 line-clamp-[9] whitespace-pre-wrap text-lg leading-8 text-slate-700">
                    {content}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={createLesson}
                disabled={busy}
                className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création de la leçon…
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    Importer et ouvrir le lecteur
                  </>
                )}
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
