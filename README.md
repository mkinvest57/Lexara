# YAPRO

**Turn real-world content into language you remember.**

YAPRO is an immersion-first language-learning app inspired by LingQ. Import any content, tap words for in-context definitions, build vocabulary with spaced repetition, and track your progress across 50+ target languages.

## Features

- **Reader** — real word-status colouring (new / learning 1–4 / known), paginated lessons, sentence mode, karaoke mode, inline translation, AI coach (Lynx)
- **Vocabulary & SRS** — 5 review activities (flashcard, reverse, cloze, dictation, multiple choice) powered by ts-fsrs
- **Import** — paste text, fetch a web article (Readability), YouTube (subtitles + AI transcription), EPUB, PDF
- **Library** — Netflix-style shelves, unified search, level filters
- **Audio** — TTS with speed presets, background playback on mobile
- **Playlists** — create, reorder, shuffle, sequential playback
- **Stats & gamification** — streak, daily goal, coins, milestone badges, activity graphs
- **AI** — Lynx in-reader coach, AI translation, lesson simplification (Supabase Edge Functions, no client-side API keys)
- **Dark mode** — full support on web and mobile
- **Mobile** — Expo SDK 57 (iOS + Android), phrase swipe, share extension

## Stack

| Layer | Tech |
|-------|------|
| Web | Next.js 15 (App Router, TypeScript) |
| Mobile | Expo SDK 57 + Expo Router |
| Backend | Supabase (Postgres + RLS + Edge Functions) |
| UI | shadcn/ui + Tailwind CSS |
| SRS | ts-fsrs |
| Monorepo | pnpm workspaces |

## Repository

```
apps/
  web/        Next.js web app (@yapro/web)
  mobile/     Expo native app (@yapro/mobile)
packages/
  core/       Shared logic — SRS engine, tokenizer, word statuses, phonetics
  types/      Shared TypeScript types
  ui/         Shared UI primitives
  config/     Shared tooling config
supabase/     Postgres schema, RLS policies, Edge Functions, seeds
```

## Local development

Requirements: Node.js 22.13+ and pnpm 9+.

```bash
pnpm install
pnpm dev
```

Web app → `http://localhost:3000`  
API → `http://localhost:3001`

Mobile (separate terminal):

```bash
pnpm --filter @yapro/mobile start
```

## Verification

```bash
pnpm build
pnpm --filter @yapro/web exec tsc --noEmit
pnpm --filter @yapro/mobile exec tsc --noEmit
```

## Supabase

The migration in `supabase/migrations/` contains 15 tables, 52 RLS policies, and all Edge Functions. Apply it to a new Supabase project:

```bash
supabase link --project-ref <your-ref>
supabase db push
supabase functions deploy
```

Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `ANTHROPIC_API_KEY` in your environment.

MIT © 2026 YAPRO
