# Immerli API

NestJS API for local Immerli development. It provides authentication, language profiles, lesson tokenization, contextual translation, saved vocabulary, spaced repetition, and progress statistics.

```bash
pnpm --filter @immerli/api prisma:generate
pnpm --filter @immerli/api prisma:seed
pnpm --filter @immerli/api dev
```

The API runs at `http://localhost:3001/api` and uses `prisma/dev.db` locally.

Demo credentials: `demo@immerli.com` / `demo123456`.

The hosted production data model and row-level security policies live in the
versioned migration under `../../supabase/migrations`. See
`../../SUPABASE_BACKEND.md` for the security model and remaining auth adapter.
