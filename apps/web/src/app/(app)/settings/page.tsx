'use client';

import { useEffect, useState } from 'react';
import {
  Bell,
  BookOpenText,
  Brain,
  Check,
  Languages,
  Settings,
  SlidersHorizontal,
  UserRound,
  Volume2,
} from 'lucide-react';
import { useProductStore } from '@/lib/product-store';
import { getPreferredEnglishWebVoice, speakEnglishWeb } from '@/lib/speech';

type SettingsSection = 'general' | 'reader' | 'review' | 'language';

const sections: { id: SettingsSection; label: string; icon: typeof Settings }[] = [
  { id: 'general', label: 'Général', icon: SlidersHorizontal },
  { id: 'reader', label: 'Lecteur', icon: BookOpenText },
  { id: 'review', label: 'Réviser', icon: Brain },
  { id: 'language', label: 'Langues', icon: Languages },
];

export default function SettingsPage() {
  const profile = useProductStore((state) => state.profile);
  const preferences = useProductStore((state) => state.preferences);
  const updateProfile = useProductStore((state) => state.updateProfile);
  const updatePreferences = useProductStore((state) => state.updatePreferences);
  const [section, setSection] = useState<SettingsSection>('general');
  const [saved, setSaved] = useState('');
  const [voiceName, setVoiceName] = useState('Voix anglaise du système');

  useEffect(() => {
    let active = true;
    getPreferredEnglishWebVoice().then((voice) => {
      if (active && voice) setVoiceName(voice.name);
    });
    return () => {
      active = false;
    };
  }, []);

  const announceSaved = (label: string) => {
    setSaved(`${label} enregistré.`);
    window.setTimeout(() => setSaved(''), 1800);
  };

  return (
    <div className="min-h-[calc(100vh-72px)] bg-white px-4 py-7 sm:px-7">
      <div className="mx-auto grid max-w-[1320px] gap-8 lg:grid-cols-[250px_1fr]">
        <aside>
          <h1 className="flex items-center gap-2 text-xl font-bold">
            <Settings className="h-5 w-5" />
            Configuration
          </h1>
          <div className="mt-5 space-y-1 text-sm text-slate-500">
            <div className="flex min-h-10 items-center gap-3 rounded-xl px-3">
              <UserRound className="h-4 w-4" />
              Compte local
            </div>
            <div className="flex min-h-10 items-center gap-3 rounded-xl px-3">
              <Bell className="h-4 w-4" />
              Préférences
            </div>
          </div>
          <p className="mt-5 px-3 text-sm font-semibold text-slate-700">
            Paramètres de l’application
          </p>
          <nav
            className="mt-2 space-y-1 border-l border-slate-300 pl-3"
            aria-label="Catégories de configuration"
          >
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-semibold ${section === id ? 'bg-[#0b1c2d] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="mx-auto w-full max-w-[700px]">
          {saved && (
            <div
              role="status"
              className="mb-4 flex min-h-11 items-center gap-2 rounded-xl bg-emerald-50 px-4 text-sm font-semibold text-emerald-800"
            >
              <Check className="h-4 w-4" />
              {saved}
            </div>
          )}
          {section === 'general' && (
            <SettingsPanel title="Paramètres généraux">
              <SettingRow
                label="Thème"
                description="L’interface claire est optimisée pour la lecture longue."
              >
                <span className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold">
                  Clair
                </span>
              </SettingRow>
              <SettingRow label="Langue de l’interface">
                <span className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold">
                  Français
                </span>
              </SettingRow>
              <SettingRow
                label="Objectif quotidien"
                description="Points à atteindre grâce à la lecture et aux révisions."
              >
                <select
                  aria-label="Objectif quotidien"
                  value={profile.dailyGoal}
                  onChange={(event) => {
                    updateProfile({ dailyGoal: Number(event.target.value) });
                    announceSaved('Objectif quotidien');
                  }}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                >
                  <option value={50}>Découverte · 50 points</option>
                  <option value={100}>Stable · 100 points</option>
                  <option value={200}>Passionné · 200 points</option>
                  <option value={400}>Intense · 400 points</option>
                </select>
              </SettingRow>
            </SettingsPanel>
          )}
          {section === 'reader' && (
            <SettingsPanel title="Lecteur">
              <SettingRow
                label="Taille du texte"
                description="Ce réglage est appliqué au lecteur web."
              >
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="16"
                    max="30"
                    value={preferences.readerFontSize}
                    onChange={(event) =>
                      updatePreferences({ readerFontSize: Number(event.target.value) })
                    }
                    onPointerUp={() => announceSaved('Taille du texte')}
                    className="w-44 accent-[#0b1c2d]"
                  />
                  <strong className="w-8">{preferences.readerFontSize}</strong>
                </div>
              </SettingRow>
              <SettingRow
                label="Afficher la prononciation"
                description="Affiche la prononciation enregistrée dans le vocabulaire."
              >
                <Switch
                  checked={preferences.showPronunciation}
                  onChange={(checked) => {
                    updatePreferences({ showPronunciation: checked });
                    announceSaved('Prononciation');
                  }}
                  label="Afficher la prononciation"
                />
              </SettingRow>
              <SettingRow
                label="Lecture audio automatique"
                description="Démarre l’audio à l’ouverture d’une leçon lorsque votre navigateur l’autorise."
              >
                <Switch
                  checked={preferences.autoPlayAudio}
                  onChange={(checked) => {
                    updatePreferences({ autoPlayAudio: checked });
                    announceSaved('Lecture audio');
                  }}
                  label="Lecture audio automatique"
                />
              </SettingRow>
              <SettingRow
                label="Voix anglaise"
                description={`Meilleure voix disponible : ${voiceName}`}
              >
                <button
                  type="button"
                  onClick={() =>
                    void speakEnglishWeb(
                      'Welcome to Immerli. Read, listen, and learn naturally.',
                      { rate: preferences.speechRate }
                    )
                  }
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-4 text-sm font-semibold hover:bg-slate-50"
                >
                  <Volume2 className="h-4 w-4" />
                  Écouter
                </button>
              </SettingRow>
              <SettingRow label="Vitesse de lecture" description="Appliquée aux leçons et aux mots.">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0.65"
                    max="1.1"
                    step="0.05"
                    value={preferences.speechRate}
                    onChange={(event) =>
                      updatePreferences({ speechRate: Number(event.target.value) })
                    }
                    onPointerUp={() => announceSaved('Vitesse de lecture')}
                    className="w-40 accent-[#0b1c2d]"
                    aria-label="Vitesse de lecture"
                  />
                  <strong className="w-12 text-sm">{preferences.speechRate.toFixed(2)}x</strong>
                </div>
              </SettingRow>
              <div className="rounded-xl bg-slate-50 p-5">
                <p className="text-sm font-bold">Aperçu</p>
                <p
                  className="mt-3 font-medium leading-[2]"
                  style={{ fontSize: preferences.readerFontSize }}
                >
                  Every story becomes easier when you keep reading.
                </p>
              </div>
            </SettingsPanel>
          )}
          {section === 'review' && (
            <SettingsPanel title="Réviser">
              <SettingRow
                label="Taille de la session"
                description="Nombre maximal de cartes dans une session."
              >
                <select
                  aria-label="Taille de la session de révision"
                  value={preferences.dailyReviewSize}
                  onChange={(event) => {
                    updatePreferences({ dailyReviewSize: Number(event.target.value) });
                    announceSaved('Taille de la session');
                  }}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                >
                  <option value={6}>6 cartes</option>
                  <option value={12}>12 cartes</option>
                  <option value={20}>20 cartes</option>
                  <option value={30}>30 cartes</option>
                </select>
              </SettingRow>
              <SettingRow
                label="Planification SRS"
                description="Les bonnes réponses espaceraient la prochaine révision, les erreurs rapprochent le mot."
              >
                <span className="rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                  Active
                </span>
              </SettingRow>
            </SettingsPanel>
          )}
          {section === 'language' && (
            <SettingsPanel title="Langues">
              <SettingRow label="Langue étudiée">
                <span className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">
                  <Languages className="h-4 w-4" aria-hidden="true" />
                  {profile.targetLanguageLabel}
                </span>
              </SettingRow>
              <SettingRow label="Niveau actuel">
                <select
                  aria-label="Niveau actuel"
                  value={profile.levelLabel}
                  onChange={(event) => {
                    updateProfile({ levelLabel: event.target.value });
                    announceSaved('Niveau');
                  }}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                >
                  <option>Débutant 1</option>
                  <option>Débutant 2</option>
                  <option>Intermédiaire 1</option>
                  <option>Intermédiaire 2</option>
                  <option>Avancé</option>
                </select>
              </SettingRow>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
                Une seule langue active est proposée dans cette version. Vos leçons, mots et
                statistiques restent cohérents dans tout le produit.
              </div>
            </SettingsPanel>
          )}
        </main>
      </div>
    </div>
  );
}

function SettingsPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 text-lg font-bold uppercase tracking-[0.1em]">{title}</h2>
      <div className="divide-y divide-slate-200 border-y border-slate-200">{children}</div>
    </section>
  );
}

function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 py-6 sm:grid-cols-[1fr_auto] sm:items-center">
      <div>
        <h3 className="text-sm font-bold uppercase tracking-[0.04em]">{label}</h3>
        {description && (
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-slate-300'}`}
    >
      <span
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'left-6' : 'left-1'}`}
      />
    </button>
  );
}
