# Supabase backend readiness

The production schema is ready for a new Supabase project, but no remote project
has been created or mutated. Project creation remains gated on the owner's
organization choice and explicit cost confirmation.

## Source of truth

- Local Supabase configuration: `supabase/config.toml`
- Versioned bootstrap migration:
  `supabase/migrations/20260730105621_bootstrap_immerli_product.sql`
- `supabase/schema.sql` is a compatibility pointer, not a second schema copy.

The migration covers Supabase Auth-backed profiles, the language catalog and
per-user language settings, public and imported lessons, sentences and tokens,
private vocabulary and occurrences, SRS scheduling, reading progress,
playlists, review sessions/events, and activity statistics.

Every table in the exposed `public` schema has RLS enabled. The migration also
contains explicit `GRANT` statements because new tables are no longer exposed
to the Supabase Data API automatically by default in 2026. Anonymous access is
limited to enabled languages and published lesson content. All learner data is
scoped to `auth.uid()`.

## Local validation

Supabase CLI 2.109.0 was used to create the migration. With Docker available:

```bash
pnpm dlx supabase@2.109.0 db reset
pnpm dlx supabase@2.109.0 migration list --local
pnpm dlx supabase@2.109.0 db lint --local --level warning
```

Run the security and performance advisors again after applying the migration to
a confirmed hosted project.

## Runtime configuration

`apps/api/src/config/environment.ts` validates local Nest configuration and
optional Supabase values. Copy `apps/api/.env.example`, then fill these values
only after the hosted project exists:

```text
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
```

`SUPABASE_SECRET_KEY` is server-only. It must never use a `NEXT_PUBLIC_` or
`EXPO_PUBLIC_` prefix and must never be bundled into the website or mobile app.

## Remaining integration boundary

The existing Nest API still authenticates with its own JWT and reads the local
Prisma/SQLite database. Supabase Auth issues different tokens and uses UUID user
IDs, so the two auth systems must not be mixed implicitly. Before production,
choose one of these paths and implement it end-to-end:

1. Use Supabase Auth plus the Data API directly from web/mobile under RLS, with
   trusted background jobs using the secret key; or
2. Validate Supabase access tokens in Nest and replace the Prisma repositories
   with Postgres/Supabase adapters.

Until that adapter is complete, the local Prisma path remains the honest
development fallback.

## Sensitive local database

`apps/api/prisma/dev.db` currently exists in Git history and must be treated as
sensitive local data. This work intentionally does not delete or rewrite it.
Do not deploy or publish the repository until the file has been removed from
tracking with a reviewed, recoverable cleanup plan.
