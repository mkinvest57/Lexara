# YAPRO Workflow

## RÈGLE D'OR
Copie d'abord, adapte ensuite. Ne conçois rien from scratch.

## MÉTHODE (chaque feature)
1. `gh clone <repo> /tmp/<repo>`
2. `cp` les fichiers pertinents dans le projet
3. Adapte imports + types
4. `pnpm build`
5. `git commit`
6. Next

## RÈGLES
- Pas de debug > 2 tentatives → skip, note, continue
- Pas de réflexion > 2 minutes
- Mode caveman ON
- Lis LINGQ_FEATURE_SPEC.md et CLAUDE_CODE_PROMPT.md si contexte perdu
- Dernier commit = repère de reprise

## PROJET
- Path: /Users/sashimi/Desktop/YAPRO
- Stack: Next.js 15 + Expo SDK 57 + Supabase + shadcn/ui
- pnpm dev → localhost:3000 (web) + localhost:3001 (API)
- Supabase = source unique de vérité
