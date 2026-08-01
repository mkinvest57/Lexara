# PROMPT POUR CLAUDE CODE — YAPRO (CLONE LINGQ)

Tu es déconnecté du contexte précédent. Voici TOUT ce que tu dois savoir.

---

## CONTEXTE GLOBAL

**YAPRO** = clone de LingQ (app d'apprentissage de langues par immersion).
Path : `/Users/sashimi/Desktop/YAPRO`

**Stack** : Turborepo monorepo — Next.js 15 (web), Expo SDK 57 (mobile), NestJS (API — sera supprimée), Supabase (Postgres + RLS), Prisma/SQLite (dev local), shadcn/ui + Tailwind.

Architecture cible :
```
packages/core/     → types, SRS, tokenizer, phonetics, supabase client
apps/web/          → Next.js App Router
apps/mobile/       → Expo Router
supabase/          → source unique de vérité (migrations, RLS, edge functions)
```

---

## ÉTAT ACTUEL

Déjà implémenté : auth, library basique, reader tokenized text, WordModal, TranslationPanel, BottomBar, vocab saving avec SRS levels basiques, flashcard matching, stats dashboard, profile, import manuel, 19 routes mobile, package core partagé avec types/SRS/supabase client, Supabase migration complète (15 tables, 52 policies RLS).

Fichiers clés à lire avant de commencer :
- `LINGQ_FEATURE_SPEC.md` — spec complète de LingQ (1073 lignes)
- `YAPRO_BUILD_PLAN.md` — plan de construction en 12 phases (234 lignes)
- `apps/web/src/components/reader/TokenizedText.tsx` — reader actuel
- `apps/web/src/components/reader/WordModal.tsx` — popup mot actuelle
- `packages/core/src/` — tout le package partagé existant
- `supabase/migrations/` — schéma DB existant

---

## TU AS ACCÈS AU MCP GITHUB

Utilise `gh` / MCP GitHub pour :
- Lister les fichiers d'un repo
- Lire le code source des fichiers pertinents
- Extraire et adapter le code dans YAPRO

Chaque phase ci-dessous liste les repos exacts à explorer et les fichiers à en extraire.

---

## RÈGLES ABSOLUES

1. **Ne jamais coder from scratch.** Lis d'abord le repo GitHub listé, trouve le code qui résout le problème, copie/adapte.
2. **Lis le code existant avant de modifier.** Ne casse rien.
3. **Tout code partagé → `packages/core/src/`.** Pas de duplication web/mobile.
4. **Supabase = source unique.** Pas de SQLite, pas de données hardcodées.
5. **`pnpm build` doit passer après chaque phase.**
6. **Mode caveman ON.** Réponses ultra-courtes, pas de blabla.
7. **Procède phase par phase.** Termine une phase avant de passer à la suivante. Vérifie visuellement dans le navigateur (localhost:3000 et localhost:8082).

Pour lancer le projet :
```bash
cd /Users/sashimi/Desktop/YAPRO
pnpm dev          # → localhost:3000 (web) + localhost:3001 (API)
pnpm --filter @immerli/mobile start --web --port 8082   # → localhost:8082 (mobile web)
```

---

# PHASE 0 — FINIR LES FONDATIONS (bloquant)

Ce qui reste :
1. Déplacer TOUT le contenu hardcodé de `apps/web/src/lib/product-store.ts` vers `supabase/seed.sql` — les 6 leçons doivent être en DB
2. Réécrire `product-store.ts` en cache Supabase avec optimistic updates
3. Supprimer `apps/api/` et déplacer sa logique utile dans `packages/core/` ou en Edge Functions Supabase
4. Ajouter au schéma Supabase : `courses`, `pages`, `challenges`, `challenge_participants`, `word_status_history`, `tags`, `lesson_tags`, `daily_stats`, `coin_transactions`, `user_review_config`
5. Supprimer TOUS les fichiers dupliqués entre web et mobile (phonetics.ts, anki-exporter.ts, speech.ts, voice-recorder-modal, etc.) — ils doivent venir de `packages/core/`

---

# PHASE 1 — CŒUR DU READER (la feature signature)

**Repos à explorer** :
- `pacexy/flow` → architecture reader (src/reader/, pagination, virtualisation, thèmes)
- `gerhardsletten/react-reader` → wrapper ePub.js React, sélection texte
- `altmshfkgudtjr/react-epub-viewer` → reader ePub simple, facile à forker
- `victorsoares96/epubjs-react-native` → reader ePub React Native/Expo (Phase 10 aussi)
- `open-spaced-repetition/ts-fsrs` → SRS engine FSRS6 (déjà intégré, à étendre)
- `VienDinhCom/supermemo` → alternative SM2 si besoin plus simple

**Ce qu'il faut construire** :

1. **Word status system** : Enum `new | 1 | 2 | 3 | 4 | known | ignored` + paliers `4a`(30j), `4b`(90j), `4c`(never). Table `word_statuses` indexée par `(user_id, language_code, lemma)` pour persistance cross-leçon.

2. **Word color-coding** : Réécrire `TokenizedText.tsx` :
   - 🔵 Bleu = nouveau (jamais vu)
   - 🟡 Jaune dégradé = statut 1→4 (intensité croissante)
   - ⚪ Blanc = connu
   - Invisible = ignoré
   - Virtualisation pour leçons >5000 mots

3. **Word popup enrichie** : Réécrire `WordModal.tsx` :
   - Barre de statut cliquable 1–2–3–4–✓
   - Définitions multi-dictionnaires (scroll horizontal)
   - Traduction IA
   - Google Images intégré
   - Boutons "Connu" / "Ignorer"
   - Détection de phrases (surlignage gris des mots voisins, sélection multi-mots → créer LingQ de phrase)

4. **Découpage en pages** + comportement "changement de page → marque comme connu" (activable/désactivable)

5. **Vocab list dans le reader** : Onglets LingQs / Nouveaux mots / Tous les mots

6. **Bouton Review dans le reader** avec sous-options : Page, Phrase, Dus (SRS), Leçon

---

# PHASE 2 — MODES DE LECTURE

**Repos à explorer** :
- `umd-mith/webvtt-player` → synchronisation texte/audio pour mode karaoké
- `contours/react-transcript-player` → alternative transcript player React
- `E-Kuerschner/useAudioPlayer` (react-use-audio-player) → hooks audio web
- `doublesymmetry/react-native-track-player` → audio mobile background

1. **Mode Phrase** : Une phrase à la fois, traduction repliable, audio phrase, liste des LingQs de la phrase, swipe mobile
2. **Mode Karaoké** : Plein écran, texte auto-défilant synchronisé à l'audio, phrase courante surlignée, fallback scroll manuel sans timestamps
3. **Activités de révision par phrase** : Unscramble (reconstituer) + Speaking (VoiceRecorderModal existe déjà)
4. **Traductions en ligne** : Traduction sous chaque ligne, activable via menu
5. **Éditeur de phrase** : Pour leçons importées (texte, traduction, note, timestamp audio)

---

# PHASE 3 — VOCABULAIRE ET SRS COMPLET

**Repos à explorer** :
- `open-spaced-repetition/ts-fsrs` → scheduler FSRS6
- `open-spaced-repetition/sm-2-ts` → alternative SM2 si besoin
- `stevendaye/duolingo-clone` → structure de leçons/progression/XP (inspiration UX)

1. **5 types d'activités** (l'enum SQL existe déjà) :
   - Flashcards classiques
   - Flashcards inversées
   - Cloze deletion (mot masqué dans la phrase d'origine)
   - Dictée (audio → saisie texte)
   - QCM multiple choice
   - + Matching déjà prévu
2. **Logique "2 bonnes réponses consécutives → statut +1"** (1 seule suffit à partir du statut 4)
3. **Progression manuelle** par clic barre de statut (partout où un mot apparaît)
4. **Page vocabulaire enrichie** : Tris (date, statut, alphabétique, leçon, aléatoire), filtres (statut, cours, tag, période), actions groupées (statut ±1, connu, supprimer, marquer révisé, taguer), export CSV
5. **LingQs du jour** : Liste quotidienne configurable (jusqu'à 200), historique 14j, email quotidien
6. **Réglages de révision** : Activer/désactiver chaque activité, configurer recto/verso, nombre d'options QCM, TTS auto

---

# PHASE 4 — AUDIO

**Repos à explorer** :
- `E-Kuerschner/useAudioPlayer` (react-use-audio-player) → hooks audio web
- `doublesymmetry/react-native-track-player` → audio mobile background
- `umd-mith/webvtt-player` → synchronisation transcript

1. **Lecteur complet** : Vitesse 0.5x–2.0x, saut ±5s, barre de progression cliquable, volume, mini-barre persistante
2. **TTS** : Génération audio pour leçons importées, choix de voix par langue, réglages
3. **Timestamps audio** : Outil d'alignement pour karaoké sur contenu importé
4. **Suivi temps réel d'écoute**
5. **Audio background mobile**

---

# PHASE 5 — PLAYLISTS

1. Playlists multiples (créer, renommer, supprimer, réordonner)
2. Ajout depuis fiche leçon
3. Lecture séquentielle, aléatoire, répétition, lecture auto
4. Sync multi-appareils via Supabase Realtime
5. Téléchargement offline (mobile)
6. Mini-player persistant (`mini-player.tsx` existe déjà côté mobile)

---

# PHASE 6 — IMPORT

**Repos à explorer** :
- `extractus/article-extractor` → Readability articles web (1.7k★)
- `mozilla/readability` → moteur Readability original (Firefox Reader Mode, 5k★)
- `devhims/youtube-caption-extractor` → sous-titres YouTube
- `stavkamil/youtube-captions-ts` → alternative TS typée pour YouTube
- `pacexy/flow` → parsing EPUB
- `mozilla/pdf.js` → extraction PDF (46k★)
- `wxt-dev/wxt` → framework MV3 TypeScript multi-navigateurs (9.8k★)
- `PlasmoHQ/plasmo` → alternative à WXT (11.8k★, plus "app React")
- `crxjs/chrome-extension-tools` → plugin Vite pour extensions MV3 (4.1k★)
- `mefengl/wxt-starter` → template WXT prêt à l'emploi
- `webclipper/web-clipper` → modèle complet de clipping (6.6k★)
- `obsidianmd/obsidian-clipper` → pattern UX clipper→app (4.7k★)
- `xtang/netflix_trans` → hook soustitres Netflix
- `dannvix/NflxMultiSubs` → multi-tracks Netflix (archive, référence)

1. **Formulaire d'import complet** : titre, langue, image, texte, URL source, audio (60 Mo/60 min max), traduction, vidéo, niveau, tags, cours, découpage auto contenus longs
2. **YouTube** : Route `/api/youtube` existe, la durcir (fallback transcription IA si pas de sous-titres)
3. **Articles web** : Extraction Readability depuis URL
4. **eBooks** : EPUB, PDF, TXT avec découpage par chapitre
5. **Extension navigateur** (WXT, Manifest V3, Chrome/Firefox/Safari/Edge) : Import 1-clic, capture titre/texte/image/sous-titres/URL, cible aussi Netflix/Prime Video/Disney+/Apple TV/TikTok
6. **Import mobile** via menu Partager iOS/Android
7. **Transcription IA** podcasts/audiobooks

---

# PHASE 7 — BIBLIOTHÈQUE ET CONTENU

**Repos à explorer** :
- `jason-liu22/netflix-clone-react-typescript` → shelves horizontales, patterns
- `Shivamrai15/Netflix-Clone` → fullstack Next+Prisma pour référence
- `Somesh-Debnath/Netflix-Clone` → Netflix clone Next+Firebase, léger
- `saulsharma/netflix-ui` → UI Expo mobile Netflix

1. **Étagères Netflix** : Continue Studying, Trending, What's New, Mini Stories, Guided Courses, News Feed, + étagères thématiques (Entertainment, Culture, News, Lifestyle, Science, Food, Sports). Ordre adaptatif.
2. **Génération Mini Stories** : Pipeline IA → 60 histoires progressives par langue (récit + reformulation + questions compréhension + audio TTS)
3. **Flux d'actus** : Agrégation RSS par langue, import 1-clic
4. **Guides de grammaire** structurés multi-langues
5. **Fiche leçon enrichie** : description, niveau, mots, durée audio, % nouveaux/LingQs/connus, ajout playlist, partage
6. **Filtres et recherche** : Niveau, type, tags, texte libre
7. **Cours** : Regroupement de leçons, progression

---

# PHASE 8 — STATS, GAMIFICATION, PROGRESSION

**Repos à explorer** :
- `trophyso/ui` → 17 composants gamification shadcn (streaks, badges, XP, leaderboards)
- `stevendaye/duolingo-clone` + `sanidhyy/duolingo-clone` → patterns XP, streaks, progression
- `HabitRPG/habitica` → inspiration gamification (GPL — référence conceptuelle UNIQUEMENT, pas de copie de code)

1. **Métriques** : mots connus, LingQs créés/appris, mots lus, heures d'écoute, pièces, série, score d'activité
2. **Suivi temps réel** lecture/écoute, agrégation quotidienne `daily_stats`
3. **Graphiques** : Évolution mots connus/lus, heures d'écoute, LingQs créés, activité par jour. Filtres jour/semaine/mois/année
4. **Widget résumé hebdo**
5. **Streak + daily goal** : Icône flamme (couleur changeante), objectif configurable, gels de série
6. **Coins** : Gagnés par activité, dépensés en boutique (mascottes — la boutique existe déjà)
7. **Badges jalons** : 1K, 5K, 10K, 25K, 50K, 100K mots connus

---

# PHASE 9 — RÉGLAGES

1. **Reader** : 12 polices, taille, interlignage 1.0–3.0, largeur page, style surlignage, locutions liées, page→connu, vocab en mode phrase, fusion définitions, sens texte LTR/RTL
2. **Mode sombre** complet web + mobile
3. **Support RTL** (arabe, hébreu)
4. Compte, notifications, i18n (17 langues d'interface)

---

# PHASE 10 — MOBILE À PARITÉ

**Repos à explorer** :
- `saulsharma/netflix-ui` → UI Expo moderne
- `victorsoares96/epubjs-react-native` → reader ePub React Native
- `calebnance/expo-netflix` → navigation Expo ancienne mais patterns valables
- `angelrepublic24/duolingoClone` → clone Duolingo Expo/TS avec navigation tab

1. Navigation par onglets : Bibliothèque, Playlists, Reader, Vocabulaire, Plus
2. Mode hors ligne (téléchargement leçons, sync vocabulaire, résolution conflits)
3. Mode phrase au swipe
4. Mode karaoké fluide
5. Widget série écran d'accueil
6. Extension partage pour import

---

# PHASE 11 — IA

**Repos à explorer** :
- `OrangeViolin/content-pipeline` → architecture pipeline IA
- `claude-world/notebooklm-skill` → pattern skill multi-étapes

1. Chatbot Lynx en lecture (expliquer mot/phrase/grammaire)
2. Traductions IA suggérées dans popup
3. Voix IA TTS naturelles
4. Transcription audio
5. Simplification de leçon par IA

TOUT ce qui est IA passe par Edge Functions Supabase — JAMAIS de clé API côté client.

---

# PHASE 12 — REPORTÉ

NE PAS FAIRE : marketplace tuteurs, réservation sessions, Points, forum Discourse, Writing Exchange, groupes/classes, profil social, parrainage, pricing tiers.

---

## TEMPLATES SAAS (auth + Stripe + Supabase déjà prêts)

Ces templates servent de référence pour la structure auth/billing. Copier les parties pertinentes (webhooks Stripe, gestion abonnements, emails) :

- `KolbySisk/next-supabase-stripe-starter` → le meilleur (800★, Next 15, Supabase, Stripe, webhooks, MIT)
- `ShenSeanChen/launch-mvp-stripe-nextjs-supabase` → production-ready (~1k★, MIT)
- `dzlau/stripe-supabase-saas-template` → template Vercel officiel (160★)
- `Saas-Starter-Kit/Saas-Kit-supabase` → starter SaaS avec RBAC (150★)
- `gitmvp-com/mvp-launch-stripe-nextjs-supabase` → version minimale (100★)

Ne pas réinventer auth/billing. Ces templates font déjà le job.

---

## ORDRE D'EXÉCUTION STRICT

```
0 → 1 → 6 → 7 → 3 → 2 → 4 → 5 → 8 → 9 → 10 → 11
```

Phase 0 est bloquante. Phase 1 est le cœur du produit. Après, priorité par valeur : import (seule source de contenu), bibliothèque (première impression), SRS complet (rétention), puis le reste.

---

## MODE OPÉRATOIRE

1. Lis la phase dans `YAPRO_BUILD_PLAN.md`
2. Explore les repos GitHub listés avec MCP
3. Extrais le code pertinent
4. Adapte-le à YAPRO (types, imports, Supabase)
5. Vérifie que `pnpm build` passe
6. Ouvre le navigateur et vérifie visuellement
7. Passe à la phase suivante

Commence. Lis `YAPRO_BUILD_PLAN.md` d'abord.
