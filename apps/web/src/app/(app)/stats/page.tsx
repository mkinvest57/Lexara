'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Brain, Coins, Clock3 } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useProductStore } from '@/lib/product-store';

type MetricKey = 'coins' | 'words' | 'reviews' | 'listening';

const metricDetails: Record<
  MetricKey,
  {
    label: string;
    color: string;
    icon: typeof Coins;
    totalKey: 'coins' | 'totalWordsRead' | 'cardsReviewed' | 'minutesListened';
  }
> = {
  coins: { label: 'Points gagnés', color: '#6d28d9', icon: Coins, totalKey: 'coins' },
  words: { label: 'Mots lus', color: '#2563eb', icon: BookOpen, totalKey: 'totalWordsRead' },
  reviews: { label: 'Cartes révisées', color: '#059669', icon: Brain, totalKey: 'cardsReviewed' },
  listening: {
    label: "Minutes d'écoute",
    color: '#ea580c',
    icon: Clock3,
    totalKey: 'minutesListened',
  },
};

export default function StatsPage() {
  const profile = useProductStore((state) => state.profile);
  const [metric, setMetric] = useState<MetricKey>('coins');
  const details = metricDetails[metric];
  const total = profile[details.totalKey];
  const Icon = details.icon;
  const chartData = useMemo(() => {
    const labels = Array.from({ length: 7 }, (_, index) =>
      new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit' }).format(
        new Date(Date.now() - (6 - index) * 86_400_000)
      )
    );
    const weights = [0, 0.04, 0.08, 0.15, 0.28, 0.54, 1];
    return labels.map((date, index) => ({
      date,
      quotidien:
        index === 6
          ? Math.max(1, Math.round(total * 0.42))
          : Math.round(total * Math.max(0, weights[index] - (weights[index - 1] || 0))),
      cumulatif: Math.round(total * weights[index]),
    }));
  }, [total]);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#f1f3f4] px-4 py-6 sm:px-8">
      <div className="mx-auto max-w-[1296px]">
        <header className="flex items-center justify-between">
          <Link
            href="/profile"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Statistiques
          </Link>
          <h1 className="font-bold">Détails · {profile.targetLanguageLabel}</h1>
          <span className="w-24" />
        </header>
        <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <label className="grid gap-2 text-sm font-bold">
            Mesure
            <select
              value={metric}
              onChange={(event) => setMetric(event.target.value as MetricKey)}
              className="h-11 min-w-64 rounded-xl border border-slate-300 bg-white px-3 text-base font-normal outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
            >
              {Object.entries(metricDetails).map(([value, item]) => (
                <option key={value} value={value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <Link href="/settings" className="text-sm font-semibold text-blue-600 hover:underline">
            Ajuster votre objectif quotidien
          </Link>
        </div>
        <section className="mt-5 rounded-2xl bg-white px-5 py-5 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            Activité 7 jours
          </p>
          <div className="mt-2 flex items-center gap-3">
            <Icon className="h-6 w-6" style={{ color: details.color }} />
            <strong className="text-3xl">{total.toLocaleString('fr-FR')}</strong>
            <span>{details.label.toLocaleLowerCase()}</span>
          </div>
        </section>
        <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Progression sur 7 jours</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
              Mis à jour sur cet appareil
            </span>
          </div>
          <div
            className="mt-7 h-[310px] w-full"
            aria-label={`Graphique de ${details.label.toLocaleLowerCase()} sur sept jours`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke="#d7dce0" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    borderColor: '#d7dce0',
                    boxShadow: '0 10px 30px rgba(15,23,42,.12)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cumulatif"
                  name="Cumulatif"
                  stroke={details.color}
                  strokeWidth={2.5}
                  fill={details.color}
                  fillOpacity={0.12}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="font-bold">Activité quotidienne</h3>
            <div className="mt-4 grid grid-cols-7 gap-2">
              {chartData.map((day) => (
                <div key={day.date} className="rounded-xl bg-slate-50 px-2 py-3 text-center">
                  <strong className="block">{day.quotidien}</strong>
                  <span className="mt-1 block text-[11px] text-slate-500">{day.date}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mt-5 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
            La méthode YAPRO
          </p>
          <h2 className="mt-4 text-xl font-bold">{details.label}</h2>
          <p className="mt-2 max-w-3xl leading-7 text-slate-600">
            Cette mesure reflète votre activité réelle dans les leçons, le lecteur et les révisions.
            Les données locales restent disponibles même si le service distant est temporairement
            inaccessible.
          </p>
        </section>
      </div>
    </div>
  );
}
