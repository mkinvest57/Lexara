# Immerli mobile

Expo SDK 57 application for iOS, Android, and a browser preview.

## Product loop

The implemented local-first loop is:

1. personalize the learning profile;
2. browse or import a lesson;
3. read and listen to the lesson;
4. select and translate words in context;
5. review saved vocabulary with spaced-repetition grading;
6. finish the lesson and update progress, coins, streaks, and statistics.

Learning data is persisted with Expo SQLite on native platforms and
`localStorage` in the browser preview. The prepared Supabase schema lives at the
repository root, but hosted sync is intentionally not enabled until the remote
project and authentication boundary are confirmed.

## Local development

From the repository root:

```bash
pnpm --filter @immerli/mobile start
```

Useful checks:

```bash
pnpm --filter @immerli/mobile lint
pnpm --filter @immerli/mobile type-check
pnpm --filter @immerli/mobile exec expo-doctor
pnpm --filter @immerli/mobile export:web
```

## Store builds

The bundle IDs are `com.immerli.app` on both platforms. Build profiles are in
`eas.json`.

```bash
cd apps/mobile
eas build --profile preview --platform all
eas build --profile production --platform all
```

Production builds and submissions require an authenticated Expo account,
Apple Developer membership, Google Play Console access, final privacy/support
URLs, store copy, screenshots, and the hosted backend decision. Do not submit a
local-only build as if cloud sync were enabled.
