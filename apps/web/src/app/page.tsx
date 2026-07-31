import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, Headphones, Languages, Play, Sparkles } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';

const benefits = [
  {
    icon: BookOpen,
    title: 'Read what pulls you in',
    copy: 'Open a short story, article, or transcript at your level. The lesson library grows with your interests.',
  },
  {
    icon: Languages,
    title: 'Understand every word',
    copy: 'Tap unfamiliar words for an instant translation, keep the useful ones, and see them highlighted next time.',
  },
  {
    icon: Sparkles,
    title: 'Remember without cramming',
    copy: 'A lightweight review queue brings vocabulary back at the right moment, always in its original context.',
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <nav
        className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"
        aria-label="Main navigation"
      >
        <div className="mx-auto flex h-[72px] max-w-[1240px] items-center justify-between px-5 sm:px-8">
          <Link href="/" aria-label="Immerli home">
            <BrandMark />
          </Link>
          <div className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how-it-works" className="transition-colors hover:text-teal-800">
              How it works
            </a>
            <a href="#reader" className="transition-colors hover:text-teal-800">
              The reader
            </a>
            <a href="#mobile" className="transition-colors hover:text-teal-800">
              Mobile
            </a>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:px-4"
            >
              Log in
            </Link>
            <Link
              href="/library"
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 sm:px-5"
            >
              Ouvrir l’app <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      <section className="relative isolate min-h-[720px] overflow-hidden bg-[#041f21]">
        <Image
          src="/brand/immerli-hero.png"
          alt="Worlds of books, conversation, travel and culture connected through language"
          fill
          priority
          className="object-cover object-[65%_center] opacity-95"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#041f21] via-[#041f21]/80 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#041f21] to-transparent" />
        <div className="relative mx-auto flex min-h-[720px] max-w-[1240px] items-center px-5 py-24 sm:px-8">
          <div className="max-w-[650px]">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-teal-300/20 bg-teal-200/10 px-4 py-2 text-sm font-medium text-teal-100 backdrop-blur">
              <Headphones className="h-4 w-4" /> Language learning that feels like living
            </div>
            <h1 className="font-display text-5xl font-semibold leading-[1.04] tracking-[-0.045em] text-white sm:text-6xl lg:text-[76px]">
              Get lost in the story. Find your voice.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-slate-200 sm:text-xl">
              Learn Spanish through stories, conversations, and ideas you actually care about. Tap a
              word, understand it, and keep moving.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/library"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[#f2763a] px-7 py-4 font-semibold text-white shadow-[0_14px_36px_rgba(242,118,58,.25)] transition hover:-translate-y-0.5 hover:bg-[#df642d]"
              >
                Commencer à lire <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/import"
                className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-7 py-4 font-semibold text-white backdrop-blur transition hover:bg-white/15"
              >
                <Play className="h-4 w-4 fill-current" /> Importer un texte
              </Link>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              {['No credit card', 'Real reading context', 'Web and mobile'].map((label) => (
                <span key={label} className="inline-flex items-center gap-2">
                  <Check className="h-4 w-4 text-teal-300" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
            A better loop
          </p>
          <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            Learn inside the things you love.
          </h2>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            Immerli turns authentic content into a calm, interactive learning space—so curiosity
            does the heavy lifting.
          </p>
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {benefits.map(({ icon: Icon, title, copy }, index) => (
            <article
              key={title}
              className="rounded-[28px] border border-slate-200 bg-[#f7fbfa] p-7 transition hover:-translate-y-1 hover:border-teal-200 hover:shadow-[0_20px_60px_rgba(15,118,110,.09)]"
            >
              <div className="flex items-center justify-between">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-teal-700 text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-sm font-bold text-slate-400">0{index + 1}</span>
              </div>
              <h3 className="mt-8 text-xl font-semibold tracking-tight">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="reader" className="overflow-hidden bg-[#ecf8f5] py-24 sm:py-32">
        <div className="mx-auto grid max-w-[1240px] items-center gap-14 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-700">
              The Immerli reader
            </p>
            <h2 className="mt-4 font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
              Never leave the page to understand it.
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Select a word and its meaning appears alongside the sentence. Save it with one tap,
              then return to the story without losing your place.
            </p>
            <Link
              href="/library"
              className="mt-8 inline-flex items-center gap-2 font-semibold text-teal-800 hover:text-teal-950"
            >
              Essayer le lecteur interactif <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="overflow-hidden rounded-[30px] border border-teal-950/10 bg-white shadow-[0_28px_80px_rgba(4,47,46,.18)]">
            <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f2763a]" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal-400" />
              <span className="ml-3 text-xs font-medium text-slate-400">Una tarde en Madrid</span>
            </div>
            <div className="grid min-h-[390px] md:grid-cols-[1fr_250px]">
              <div className="p-7 sm:p-10">
                <p className="font-display text-2xl font-semibold">Una tarde en Madrid</p>
                <p className="mt-7 font-serif text-[19px] leading-10 text-slate-700">
                  Clara salió de casa cuando la ciudad empezaba a despertar. En la esquina, el
                  panadero ya había abierto y el{' '}
                  <span className="rounded-md bg-amber-200 px-1.5 py-1">aroma</span> del pan llenaba
                  la calle. Caminó sin prisa hacia el{' '}
                  <span className="rounded-md bg-sky-200 px-1.5 py-1 ring-2 ring-sky-400">
                    mercado
                  </span>
                  .
                </p>
              </div>
              <aside className="border-l border-slate-200 bg-slate-50 p-5">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Selected word
                </p>
                <p className="mt-3 text-2xl font-semibold">mercado</p>
                <p className="mt-1 text-sm text-slate-500">noun · Spanish</p>
                <div className="mt-5 rounded-xl border border-teal-200 bg-white p-4">
                  <p className="text-xs font-semibold text-teal-700">Meaning</p>
                  <p className="mt-1 font-medium">market</p>
                </div>
                <button className="mt-4 min-h-11 w-full rounded-xl bg-teal-700 px-4 font-semibold text-white">
                  Save word
                </button>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="mobile" className="mx-auto max-w-[1240px] px-5 py-24 sm:px-8 sm:py-32">
        <div className="rounded-[36px] bg-[#062f31] px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-teal-200">
            One learning life
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
            Your library and vocabulary, wherever the day takes you.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            The responsive experience is being built on one shared data model, ready for native iOS
            and Android companions.
          </p>
          <Link
            href="/library"
            className="mt-9 inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 font-semibold text-teal-950 transition hover:bg-teal-50"
          >
            Ouvrir votre espace d’apprentissage <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-slate-200">
        <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-5 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <BrandMark />
          <p>Read deeply. Listen closely. Speak naturally.</p>
          <p>© {new Date().getFullYear()} Immerli</p>
        </div>
      </footer>
    </main>
  );
}
