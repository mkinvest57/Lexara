# Déployer Immerli sur Vercel

Ce dépôt peut produire une preview du site web, mais il n'est pas encore prêt
pour un lancement public avec comptes et synchronisation. Vercel déploie ici
uniquement `apps/web`. Le serveur NestJS, la base locale SQLite et l'application
Expo ne sont pas hébergés par cette configuration.

## État réel avant déploiement

Les points suivants bloquent encore une production fonctionnelle :

1. Aucun projet Supabase distant n'a été créé. Sa création nécessite le choix
   explicite de l'organisation Supabase, l'affichage du coût, puis la
   confirmation du propriétaire.
2. La migration dans `supabase/migrations` n'a donc pas encore été appliquée à
   une base distante. Les advisors de sécurité/performance et la génération des
   types distants restent à exécuter après cette confirmation.
3. Le web utilise actuellement NextAuth Credentials et appelle le serveur Nest
   via `NEXT_PUBLIC_API_URL`. Nest utilise encore son propre JWT et Prisma/SQLite;
   il ne valide pas les jetons Supabase et ne lit pas encore le schéma Supabase.
4. `apps/api/prisma/dev.db` est toujours suivi par Git. `.vercelignore` l'exclut
   de l'artefact Vercel, mais cela ne le retire ni du dépôt ni de son historique.
   Le dépôt ne doit pas être rendu public avant un nettoyage revu et récupérable.

Une page peut donc s'afficher en preview, mais il ne faut pas présenter cette
preview comme un produit synchronisé ou prêt à recevoir de vrais utilisateurs.

## Choisir le backend de production

Une seule stratégie doit être terminée avant la mise en ligne.

### Option A — Supabase directement depuis web/mobile

Migrer l'authentification vers Supabase Auth et les lectures/écritures vers la
Data API sous RLS. C'est la voie la plus directe avec le schéma préparé.

Après intégration dans le code, les clients publics pourront recevoir :

```text
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Une éventuelle `SUPABASE_SECRET_KEY` reste strictement côté serveur. Elle ne doit
jamais avoir un préfixe `NEXT_PUBLIC_` ou `EXPO_PUBLIC_`.

### Option B — Conserver NestJS

Déployer Nest séparément sur une plateforme avec une URL HTTPS stable, remplacer
SQLite par un adaptateur Postgres/Supabase, puis choisir et implémenter une seule
chaîne d'identité : jetons Supabase vérifiés par Nest, ou authentification Nest
entièrement distincte avec un modèle de données compatible.

Dans ce cas seulement, configurer sur Vercel :

```text
NEXT_PUBLIC_API_URL=https://api.votre-domaine.fr/api
```

`NEXT_PUBLIC_API_URL` ne doit jamais contenir `localhost`, `127.0.0.1`, une IP de
réseau local ou une URL HTTP en production. Le CORS de Nest doit autoriser le
domaine Vercel/de production exact.

## Configuration du projet Vercel

Le `vercel.json` à la racine définit déjà :

```text
Framework       Next.js
Install         pnpm install --frozen-lockfile
Build           pnpm --filter @immerli/web build
Output          apps/web/.next
```

Lors de l'import GitHub :

1. Importer le dépôt dans un nouveau projet Vercel.
2. Laisser **Root Directory vide** — donc à la racine du dépôt.
3. Ne pas la remplacer par `apps/web` : cela rendrait les chemins du
   `vercel.json` racine incohérents et pourrait empêcher l'accès au workspace.
4. Garder le Framework Preset `Next.js` et les commandes du fichier.
5. Utiliser Node.js 22 dans les paramètres du projet.
6. Activer d'abord les Preview Deployments, pas la production automatique.

Vercel documente cette variante monorepo avec une racine vide, une commande
filtrée et un output `apps/web/.next` dans sa documentation Turborepo.

## Variables Vercel

Configurer séparément Preview et Production dans Project Settings >
Environment Variables.

Si NextAuth Credentials est conservé temporairement :

```text
NEXTAUTH_URL=https://votre-domaine-vercel-ou-custom
NEXTAUTH_SECRET=<secret-aléatoire-long-et-unique>
```

Puis ajouter **soit** les variables publiques Supabase après l'intégration de
l'option A, **soit** `NEXT_PUBLIC_API_URL` avec l'API HTTPS réelle après
l'intégration de l'option B. Ne pas configurer les deux chemins à moitié.

Marquer toute clé secrète comme Sensitive dans Vercel. Ne jamais copier dans le
dashboard une valeur de `.env.local` sans vérifier son environnement et sa
portée. Les variables `NEXT_PUBLIC_*` sont incorporées dans le bundle navigateur
pendant le build et ne sont donc pas secrètes.

## Portes obligatoires avant la première preview

- [ ] Le choix Supabase/Nest est implémenté de bout en bout.
- [ ] L'URL backend de Preview est HTTPS et joignable depuis Internet.
- [ ] Aucune variable de Preview/Production ne contient `localhost`.
- [ ] Les secrets de production sont uniques et non présents dans Git.
- [ ] `git ls-files apps/api/prisma/dev.db` ne retourne plus rien après le
      nettoyage approuvé de la base locale.
- [ ] La migration Supabase est appliquée au projet confirmé.
- [ ] Les advisors Supabase sécurité et performance ne signalent aucun problème
      bloquant.
- [ ] Les builds et tests du commit exact passent avant de demander une preview.

## Déploiement recommandé

Utiliser l'intégration Git Vercel : une branche produit une preview isolée. Ne
promouvoir cette preview qu'après les vérifications suivantes :

1. inscription/connexion réelle ;
2. bibliothèque et import d'une leçon ;
3. ouverture du lecteur, sauvegarde d'un mot et révision ;
4. rechargement complet avec données toujours présentes ;
5. inspection du réseau : aucune requête vers `localhost` ;
6. absence d'erreurs dans les logs Vercel et backend ;
7. test sur téléphone et navigateur desktop.

Pour un workflow CLI, épingler une version Vercel CLI approuvée au lieu
d'installer `latest`, puis exécuter les commandes depuis la racine du dépôt :

```bash
pnpm dlx vercel@<version-épinglée> pull --environment=preview
pnpm dlx vercel@<version-épinglée> build
pnpm dlx vercel@<version-épinglée> deploy --prebuilt
```

La production doit être une promotion de l'artefact preview déjà vérifié, pas un
nouveau build non testé :

```bash
pnpm dlx vercel@<version-épinglée> promote <url-preview>
```

## Validation après mise en ligne

Conserver dans le compte-rendu de lancement : URL, commit, environnement,
résultat des parcours critiques, état des migrations, advisors Supabase et scan
des logs. En cas de régression, utiliser immédiatement le rollback Vercel vers
le dernier déploiement validé.

Références :

- [Déployer Turborepo sur Vercel](https://vercel.com/docs/monorepos/turborepo)
- [Configurer un build Vercel](https://vercel.com/docs/builds/configure-a-build)
- [Configuration `vercel.json`](https://vercel.com/docs/project-configuration/vercel-json)
- [Sécuriser la Data API Supabase](https://supabase.com/docs/guides/api/securing-your-api)
- [Changement Data API 2026](https://supabase.com/changelog/45329-breaking-change-tables-not-exposed-to-data-and-graphql-api-automatically)
