# Immerli

**Turn real-world content into language you remember.**

Immerli is an immersion-first language-learning product. Learners can open or import a lesson, tap any word for an in-context meaning, save vocabulary, listen to pronunciation, and review with spaced repetition.

## What works today

- Responsive marketing site and authenticated web app
- Demo sign-in and first-time account setup
- Searchable, level-filtered lesson library
- Manual text import with automatic sentence and token creation
- Interactive reader with translation, pronunciation, and saved-word states
- Vocabulary collection, spaced-repetition review, goals, and progress statistics
- Expo SDK 57 app foundation for iOS, Android, and web
- Supabase Postgres/RLS production schema ready to apply after project approval
- Vercel production configuration without embedded secrets

## Repository

```text
apps/
  api/       NestJS API and local Prisma/SQLite development database
  mobile/    Expo Router native app
  web/       Next.js web product
packages/    Shared workspace packages
prototypes/  Protected iPhone/Pixel visual prototype
supabase/    Production Postgres schema and RLS policies
screens/     Product reference captures supplied for design research
```

## Local development

Requirements: Node.js 22.13 or newer and pnpm 9 or newer.

```bash
pnpm install
pnpm dev
```

The web app runs on `http://localhost:3000` and the API on `http://localhost:3001/api`.

Run the native app separately:

```bash
pnpm --filter @immerli/mobile start
```

### Demo account

```text
Email: demo@immerli.com
Password: demo123456
```

## Verification

```bash
pnpm build
pnpm --filter @immerli/web type-check
pnpm --filter @immerli/mobile exec tsc --noEmit
cd apps/mobile && npx expo-doctor@latest
```

## Production path

The checked-in Supabase migration contains profiles, multi-language settings,
lessons, tokenized text, vocabulary, review scheduling, playlists, activity
logs, explicit Data API grants, and row-level security. Creating the hosted
Supabase project is intentionally gated on explicit account/cost confirmation.
See `SUPABASE_BACKEND.md` for the remaining auth integration boundary before
deployment.

App Store and Play Store builds are configured through `apps/mobile/eas.json`; final signing and submission require the owner's Expo, Apple Developer, and Google Play credentials.

## Brand

The working product name is **Immerli**. Live checks showed `immerli.com` and `immerli.app` as available at the time of research, but no domain has been purchased and availability is not reserved.

MIT © 2026 Immerli
