'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  BookOpen,
  Brain,
  Check,
  Clock3,
  Flame,
  Pencil,
  Settings,
  Sparkles,
  Target,
} from 'lucide-react';
import { useProductStore } from '@/lib/product-store';

export default function ProfilePage() {
  const profile = useProductStore((state) => state.profile);
  const words = useProductStore((state) => state.words);
  const updateProfile = useProductStore((state) => state.updateProfile);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name);
  const knownWords = words.filter((word) => word.status === 5).length;
  const learningWords = words.filter((word) => word.status < 5).length;
  const goalPercent = Math.min(100, Math.round((profile.coins / profile.dailyGoal) * 100));
  const weekdayLabels = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short' });
    return Array.from({ length: 7 }, (_, index) =>
      formatter.format(new Date(Date.now() - (6 - index) * 86_400_000)).replace('.', '')
    );
  }, []);

  const saveName = () => {
    const cleanName = name.trim();
    if (!cleanName) return;
    const initials = cleanName
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
    updateProfile({ name: cleanName, initials });
    setEditing(false);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f1f3f4] px-4 py-6 sm:px-8">
      <h1 className="sr-only">Profil de {profile.name}</h1>
      <div className="mx-auto max-w-[1296px]">
        <nav className="mb-6 flex gap-1 overflow-x-auto" aria-label="Sections du profil">
          <span className="min-h-10 rounded-xl bg-slate-200 px-4 py-2 text-sm font-bold">
            Mon profil
          </span>
          <Link
            href="/stats"
            className="min-h-10 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
          >
            Statistiques
          </Link>
          <Link
            href="/settings"
            className="min-h-10 rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white"
          >
            Configuration
          </Link>
        </nav>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <main className="space-y-6">
            <section>
              <div className="mb-3 flex items-center justify-between">
                <h1 className="text-lg font-bold">Activité 7 jours</h1>
                <Link
                  href="/stats"
                  className="inline-flex min-h-9 items-center gap-2 rounded-lg px-3 text-sm font-semibold hover:bg-white"
                >
                  Voir les détails <BarChart3 className="h-4 w-4" />
                </Link>
              </div>
              <div className="divide-y divide-slate-300 border-y border-slate-300">
                {[
                  {
                    label: 'Nombre de mots lus',
                    value: profile.totalWordsRead,
                    goal: 700,
                    icon: BookOpen,
                  },
                  {
                    label: "Minutes d'écoute",
                    value: profile.minutesListened,
                    goal: 70,
                    icon: Clock3,
                  },
                  { label: 'Mots sauvegardés', value: words.length, goal: 25, icon: Sparkles },
                  { label: 'Cartes révisées', value: profile.cardsReviewed, goal: 50, icon: Brain },
                ].map(({ label, value, goal, icon: Icon }) => (
                  <div
                    key={label}
                    className="relative flex min-h-14 items-center gap-3 bg-white/30 px-2"
                  >
                    <Icon className="h-4 w-4 text-slate-500" />
                    <strong className="text-xl">{value}</strong>
                    <span className="text-sm">{label}</span>
                    <span className="ml-auto text-sm font-semibold text-slate-500">
                      objectif {goal}
                    </span>
                    <span
                      className="absolute bottom-0 left-0 h-0.5 bg-emerald-500"
                      style={{ width: `${Math.min(100, (value / goal) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
            </section>

            <section className="flex items-center gap-5 rounded-[32px] bg-white p-4 shadow-sm">
              <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border-[8px] border-slate-200 text-lg font-bold text-emerald-700">
                <span>{profile.coins}</span>
                <span className="absolute inset-[-8px] rounded-full border-[8px] border-lime-400 border-r-transparent" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {profile.coins}/{profile.dailyGoal} points
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Encore {Math.max(0, profile.dailyGoal - profile.coins)} points pour atteindre
                  votre objectif quotidien.
                </p>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="font-bold">{profile.streak} jours de série</h2>
                <Flame className="h-5 w-5 text-orange-500" />
              </div>
              <div className="mt-5 grid grid-cols-7 gap-2">
                {weekdayLabels.map((day, index) => (
                  <div key={`${day}-${index}`} className="text-center">
                    <span
                      className={`mx-auto grid h-10 w-10 place-items-center rounded-full ${index >= 7 - profile.streak ? 'bg-orange-50 text-orange-500' : 'bg-slate-100 text-slate-300'}`}
                    >
                      <Flame className="h-5 w-5 fill-current" />
                    </span>
                    <span className="mt-2 block text-xs font-semibold text-slate-500">{day}</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="mb-3 text-lg font-bold">Statistiques</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                <Metric label="Mots connus" value={knownWords} icon={Check} />
                <Metric label="En apprentissage" value={learningWords} icon={Brain} />
                <Metric label="Mots lus" value={profile.totalWordsRead} icon={BookOpen} />
              </div>
            </section>
          </main>

          <aside className="space-y-5">
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-4">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-[#e5b5c5] text-xl font-bold text-[#7c4056]">
                  {profile.initials}
                </span>
                <div className="min-w-0 flex-1">
                  {editing ? (
                    <div className="flex gap-2">
                      <input
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        name="profile-name"
                        autoComplete="name"
                        aria-label="Nom affiché"
                        className="h-10 min-w-0 flex-1 rounded-xl border border-slate-300 px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                      />
                      <button
                        type="button"
                        onClick={saveName}
                        className="grid h-10 w-10 place-items-center rounded-xl bg-[#0b1c2d] text-white"
                        aria-label="Enregistrer le nom"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <h2 className="truncate text-lg font-bold">{profile.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">Compte local YAPRO</p>
                    </>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setEditing((value) => !value)}
                  className="grid h-10 w-10 place-items-center rounded-xl border border-slate-300 hover:bg-slate-50"
                  aria-label="Modifier le profil"
                >
                  <Pencil className="h-4 w-4" />
                </button>
              </div>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-xl">
                  🇬🇧
                </span>
                <div>
                  <p className="font-bold">{profile.targetLanguageLabel}</p>
                  <p className="text-sm text-slate-500">{profile.levelLabel}</p>
                </div>
              </div>
              <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-slate-200">
                <span
                  className="block h-full bg-blue-500"
                  style={{ width: `${Math.max(8, knownWords)}%` }}
                />
              </div>
              <p className="mt-2 text-right text-sm">
                <strong>{knownWords}</strong> mots connus
              </p>
            </section>
            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <h2 className="text-sm font-bold uppercase tracking-[0.12em]">
                Votre objectif du jour
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <Target className="h-8 w-8 text-blue-600" />
                <div className="flex-1">
                  <div className="flex justify-between text-sm">
                    <span>Progression</span>
                    <strong>{goalPercent}%</strong>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <span
                      className="block h-full rounded-full bg-blue-500"
                      style={{ width: `${goalPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>
            <Link
              href="/settings"
              className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white text-sm font-bold hover:bg-slate-50"
            >
              <Settings className="h-4 w-4" />
              Configurer votre expérience
            </Link>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof BookOpen;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <Icon className="h-5 w-5 text-emerald-600" />
      <p className="mt-4 text-3xl font-bold">{value.toLocaleString('fr-FR')}</p>
      <p className="mt-1 text-sm text-slate-500">{label}</p>
    </div>
  );
}
