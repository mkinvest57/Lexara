# Plan MVP LingQ-like - Version Améliorée

## Analyse du document existant

### Points forts
- Vision claire : apprentissage par immersion avec contenus réels
- Différenciation identifiée : continuité du vocabulaire entre leçons
- Parcours utilisateur bien détaillé à partir des captures d'écran
- Modèle de données complet et réfléchi
- Stack technique cohérent (Next.js + React Native + NestJS)

### Améliorations à apporter
1. **Simplification du MVP P0** : trop de fonctionnalités pour un vrai MVP
2. **Priorisation technique** : démarrer web-only puis mobile
3. **Architecture backend** : clarifier les couches et services
4. **Plan d'implémentation** : ordre concret des développements
5. **Validation produit** : ajouter des jalons de test utilisateur

---

## MVP Revu et Simplifié

### Principe directeur
**Un MVP doit valider l'hypothèse centrale** : les utilisateurs veulent-ils apprendre avec du contenu réel en cliquant sur les mots inconnus ?

Tout le reste (gamification, communauté, IA avancée) vient après validation.

### Périmètre P0 STRICT (4-6 semaines)

#### 1. Authentification & Profil Minimal
- [ ] Signup/login email + password (NextAuth)
- [ ] Un seul profil langue par user (pas de multi-langues au début)
- [ ] Choix : langue cible + niveau (Débutant/Intermédiaire/Avancé)
- **Pas d'onboarding élaboré, pas de sélection d'intérêts** (ajouté en P1)

#### 2. Bibliothèque Ultra-Basique
- [ ] Liste simple de leçons (titre, image, niveau)
- [ ] 5-10 leçons pré-chargées par langue (mini-histoires courtes)
- [ ] Badge "X% nouveaux mots" calculé dynamiquement
- [ ] Bouton "Commencer" qui ouvre le lecteur
- **Pas de sections "Pour toi", pas de filtres avancés**

#### 3. Lecteur Immersif - Cœur du Produit
- [ ] Affichage texte tokenisé par mot
- [ ] Clic sur mot → modal/panneau avec :
  - Traduction (API gratuite : LibreTranslate ou MyMemory)
  - Phrase complète
  - Bouton "Sauvegarder" (créer un LingQ)
- [ ] Colorisation :
  - Gris clair : mot connu
  - Bleu : mot jamais vu
  - Jaune : mot sauvegardé (LingQ)
- [ ] Compteur : "Mots lus : X | LingQs créés : Y"
- **Pas d'audio au début, pas de mode phrase, pas de thèmes**

#### 4. Vocabulaire & Liste des LingQs
- [ ] Page listant tous les mots sauvegardés
- [ ] Colonnes : Mot | Traduction | Phrase source | Date
- [ ] Clic sur une ligne → voir détails + lien vers la leçon
- [ ] Bouton "Marquer comme connu" (change la couleur)
- **Pas de filtres complexes, pas de tags au début**

#### 5. SRS Ultra-Minimal
- [ ] Algorithme simple : révision J+1, J+3, J+7, J+14, J+30
- [ ] Une seule activité : flashcard (mot → traduction)
- [ ] Boutons "Je savais" / "Je ne savais pas"
- [ ] Compteur de progression dans la session
- **Pas de reverse flashcards, pas de cloze, pas de dictée**

#### 6. Dashboard Minimal
- [ ] Stats aujourd'hui : 
  - Mots lus
  - LingQs créés
  - Cartes révisées
- [ ] Total mots connus
- [ ] Bouton "Réviser maintenant" (si ≥1 carte due)
- **Pas de série de jours, pas de graphiques**

---

## Architecture Technique Détaillée

### Stack Final
- **Frontend Web** : Next.js 15 (App Router, TypeScript)
- **Mobile** : React Native + Expo (phase 2, après validation web)
- **Backend** : NestJS + Prisma + PostgreSQL
- **Déploiement** :
  - Web : Vercel
  - DB : Neon (Postgres serverless gratuit)
  - Backend : Railway ou Render (tier gratuit pour proto)

### Justifications

#### Pourquoi Next.js ?
- SSR pour SEO (landing + leçons publiques futures)
- Server Components pour réduire le bundle
- Image optimization native
- Déploiement Vercel en un clic

#### Pourquoi NestJS et pas juste Next.js API routes ?
- **Séparation claire** front/back (mobile pourra consommer la même API)
- **Structure modulaire** pour un domaine complexe (auth, lessons, vocab, SRS)
- **Type safety** de bout en bout avec Prisma
- **Scalabilité** : workers pour transcription, jobs SRS, etc.

#### Pourquoi Prisma ?
- Schéma en un fichier clair (`schema.prisma`)
- Migrations automatiques
- Client TS généré type-safe
- Meilleur DX pour itération rapide

#### Pourquoi Postgres ?
- Relations complexes (lessons → sentences → tokens → vocab)
- JSON fields pour métadonnées flexibles
- Full-text search natif (pour chercher dans les leçons)
- Gratuit et performant (Neon, Supabase)

---

## Modèle de Données P0

### Schema Prisma Simplifié

```prisma
// schema.prisma

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  createdAt DateTime @default(now())
  
  languageProfile LanguageProfile?
  vocabEntries    VocabEntry[]
  reviewSessions  ReviewSession[]
  activityLogs    ActivityLog[]
}

model LanguageProfile {
  id             String @id @default(cuid())
  userId         String @unique
  user           User   @relation(fields: [userId], references: [id])
  
  targetLanguage String // ISO code (en, es, fr, etc.)
  level          String // beginner, intermediate, advanced
  
  dailyGoalWords     Int @default(100)
  dailyGoalMinutes   Int @default(15)
  dailyGoalCards     Int @default(10)
  
  lessons Lesson[]
}

model Lesson {
  id        String   @id @default(cuid())
  profileId String
  profile   LanguageProfile @relation(fields: [profileId], references: [id])
  
  title       String
  type        String // article, story, video, podcast
  sourceUrl   String?
  imageUrl    String?
  level       String
  
  content     String @db.Text // raw text
  wordCount   Int
  
  createdAt   DateTime @default(now())
  
  sentences   Sentence[]
  vocabOccurrences VocabOccurrence[]
}

model Sentence {
  id       String @id @default(cuid())
  lessonId String
  lesson   Lesson @relation(fields: [lessonId], references: [id])
  
  index    Int
  text     String @db.Text
  
  tokens   Token[]
  
  @@unique([lessonId, index])
}

model Token {
  id         String @id @default(cuid())
  sentenceId String
  sentence   Sentence @relation(fields: [sentenceId], references: [id])
  
  index      Int
  form       String // mot tel qu'écrit
  lemma      String? // forme de base
  
  vocabOccurrences VocabOccurrence[]
  
  @@unique([sentenceId, index])
}

model VocabEntry {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id])
  
  term           String // forme de base du mot
  language       String // ISO code
  translation    String
  notes          String? @db.Text
  
  status         Int @default(1) // 0=unknown, 1-3=learning, 4=known
  
  createdAt      DateTime @default(now())
  
  occurrences    VocabOccurrence[]
  srsItem        SRSItem?
  
  @@unique([userId, term, language])
}

model VocabOccurrence {
  id            String @id @default(cuid())
  vocabEntryId  String
  vocabEntry    VocabEntry @relation(fields: [vocabEntryId], references: [id])
  
  tokenId       String
  token         Token @relation(fields: [tokenId], references: [id])
  
  lessonId      String
  lesson        Lesson @relation(fields: [lessonId], references: [id])
  
  context       String @db.Text // phrase complète
  encounteredAt DateTime @default(now())
}

model SRSItem {
  id            String @id @default(cuid())
  vocabEntryId  String @unique
  vocabEntry    VocabEntry @relation(fields: [vocabEntryId], references: [id])
  
  nextReview    DateTime
  lastReview    DateTime?
  interval      Int @default(1) // jours
  
  successCount  Int @default(0)
  failCount     Int @default(0)
}

model ReviewSession {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id])
  
  startedAt DateTime @default(now())
  endedAt   DateTime?
  
  itemsCount Int
  correctCount Int @default(0)
  
  type      String @default("flashcard")
}

model ActivityLog {
  id        String @id @default(cuid())
  userId    String
  user      User   @relation(fields: [userId], references: [id])
  
  type      String // read, review, import
  language  String
  
  wordsRead Int @default(0)
  minutes   Int @default(0)
  
  createdAt DateTime @default(now())
}
```

---

## Architecture Backend (NestJS)

### Structure des Modules

```
src/
├── app.module.ts
├── main.ts
├── common/
│   ├── guards/
│   ├── decorators/
│   └── filters/
├── auth/
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── strategies/
├── users/
│   ├── users.module.ts
│   ├── users.service.ts
│   └── dto/
├── language-profiles/
│   ├── language-profiles.module.ts
│   ├── language-profiles.service.ts
│   └── dto/
├── lessons/
│   ├── lessons.module.ts
│   ├── lessons.controller.ts
│   ├── lessons.service.ts
│   ├── tokenizer.service.ts (NLP)
│   └── dto/
├── vocab/
│   ├── vocab.module.ts
│   ├── vocab.controller.ts
│   ├── vocab.service.ts
│   ├── translation.service.ts (API externe)
│   └── dto/
├── srs/
│   ├── srs.module.ts
│   ├── srs.controller.ts
│   ├── srs.service.ts
│   ├── scheduler.service.ts (calcul next review)
│   └── dto/
├── stats/
│   ├── stats.module.ts
│   ├── stats.controller.ts
│   └── stats.service.ts
└── prisma/
    ├── prisma.module.ts
    └── prisma.service.ts
```

### Services Clés

#### TokenizerService
- Découpe le texte en phrases et mots
- Utilise une lib NLP légère selon la langue :
  - Anglais : `natural` ou `compromise`
  - Français : `french-tokenizer`
  - Espagnol : `spanish-nlp` ou compromis avec `natural`
- Extrait lemmes si possible (optionnel P0)

#### TranslationService
- Wrapper autour d'une API de traduction gratuite
- P0 : MyMemory API (gratuite, 1000 req/jour)
- P1 : LibreTranslate (self-hosted ou API payante)
- P2 : DeepL ou Google Translate (meilleure qualité, payant)

#### SRSSchedulerService
- Algorithme SM-2 simplifié :
  - Status 1 : J+1
  - Status 2 : J+3
  - Status 3 : J+7
  - Status 4+ : connu, pas de révision
- Recalcule `nextReview` après chaque réponse

#### StatsService
- Agrège les ActivityLogs
- Calcule stats en temps réel (cache Redis en P2)

---

## Architecture Frontend (Next.js)

### Structure App Router

```
app/
├── (marketing)/
│   ├── page.tsx              # Landing
│   ├── pricing/
│   └── about/
├── (auth)/
│   ├── login/
│   ├── signup/
│   └── layout.tsx            # Layout sans header app
├── (app)/
│   ├── layout.tsx            # Layout avec sidebar/header app
│   ├── dashboard/
│   │   └── page.tsx          # Stats + bouton réviser
│   ├── library/
│   │   └── page.tsx          # Liste des leçons
│   ├── lesson/
│   │   └── [id]/
│   │       └── page.tsx      # Lecteur immersif
│   ├── vocab/
│   │   └── page.tsx          # Liste des LingQs
│   └── review/
│       └── page.tsx          # Session SRS
├── api/
│   └── auth/
│       └── [...nextauth]/    # NextAuth endpoints
└── globals.css
```

### Components Clés

```
components/
├── ui/                       # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── modal.tsx
│   └── ...
├── layout/
│   ├── AppHeader.tsx
│   ├── AppSidebar.tsx
│   └── MobileNav.tsx
├── library/
│   ├── LessonCard.tsx        # Carte avec badge "X% nouveaux"
│   └── LessonGrid.tsx
├── reader/
│   ├── ImmersiveReader.tsx   # Container principal
│   ├── TokenizedText.tsx     # Texte avec mots cliquables
│   ├── WordModal.tsx         # Modal traduction + save
│   └── ReaderStats.tsx       # Compteur mots lus
├── vocab/
│   ├── VocabList.tsx
│   └── VocabItem.tsx
├── srs/
│   ├── FlashcardSession.tsx
│   ├── Flashcard.tsx
│   └── ProgressBar.tsx
└── dashboard/
    ├── StatsCard.tsx
    └── QuickActions.tsx
```

### State Management P0
- **Server State** : TanStack Query (React Query)
  - Cache automatique des lessons, vocab, stats
  - Invalidation après mutations
- **Client State** : Zustand (minimal)
  - Theme (light/dark)
  - Reader settings (font size)
- **Pas de Redux** (overkill pour un MVP)

---

## Implémentation : Ordre des Développements

### Semaine 1-2 : Fondations Backend + Auth

#### Backend Setup
1. Init NestJS projet
2. Setup Prisma + schema P0
3. Docker Compose (Postgres local)
4. Auth module (JWT, bcrypt)
5. Users + LanguageProfiles CRUD

#### Frontend Setup
1. Init Next.js 15
2. Setup Tailwind + shadcn/ui
3. NextAuth config (credentials provider)
4. Layout marketing + auth pages
5. API client (fetch wrapper avec auth header)

**Jalon** : signup/login fonctionnel, création profil langue

---

### Semaine 3-4 : Leçons + Lecteur Immersif

#### Backend
1. Lessons module
2. TokenizerService (découpage texte)
3. Seed DB avec 10 mini-histoires (3 langues)
4. Endpoint GET /lessons (filtres niveau, langue)
5. Endpoint GET /lessons/:id (avec sentences + tokens)
6. Endpoint POST /lessons/:id/read (log activité)

#### Frontend
1. Page Library (grille de LessonCards)
2. Calcul "% nouveaux mots" côté client (compare tokens avec vocabEntries de l'user)
3. Page Lesson/[id] avec TokenizedText
4. WordModal avec appel API traduction
5. Colorisation dynamique (gris/bleu/jaune)
6. ReaderStats (compteur mots lus en session)

**Jalon** : lire une leçon, cliquer sur un mot, voir traduction

---

### Semaine 5 : Vocabulaire + SRS

#### Backend
1. Vocab module
   - POST /vocab (créer LingQ)
   - GET /vocab (liste utilisateur)
   - PATCH /vocab/:id (changer statut)
2. TranslationService (MyMemory API)
3. SRS module
   - GET /srs/due (cartes à réviser)
   - POST /srs/review (enregistrer réponse + recalc)
4. SRSSchedulerService (algo SM-2 simple)

#### Frontend
1. Page Vocab (table des LingQs)
2. Bouton "Marquer connu" (PATCH status=4)
3. Page Review
4. FlashcardSession component
5. Logic de session (fetch due cards, submit réponses, update stats)

**Jalon** : créer des LingQs, les réviser en flashcards

---

### Semaine 6 : Dashboard + Polish P0

#### Backend
1. Stats module
   - GET /stats/today
   - GET /stats/overview
2. ActivityLog automatique (middleware ou decorator)

#### Frontend
1. Page Dashboard
2. StatsCards (mots lus, LingQs, cartes révisées)
3. Bouton "Réviser maintenant" (redirige vers /review)
4. Polish UI (responsive, loading states, error handling)
5. Dark mode (Tailwind class-based)

#### DevOps
1. Deploy backend sur Railway/Render
2. DB Neon (Postgres cloud gratuit)
3. Deploy frontend sur Vercel
4. Variables d'environnement (DATABASE_URL, JWT_SECRET, etc.)

**Jalon** : MVP P0 COMPLET déployé en prod

---

## Tests & Validation

### Semaine 7 : Tests Utilisateurs Alpha

#### Objectifs
- 5-10 utilisateurs early adopters (amis, communauté)
- Mesurer :
  - Temps passé dans le lecteur
  - Nombre de LingQs créés par session
  - Taux de retour J+1, J+3, J+7
  - Frictions majeures (bugs, UX confuse)

#### Métriques Clés (Analytics)
- Pageviews par page
- Temps moyen dans le lecteur
- Taux de complétion des leçons
- Taux de révision (cartes due vs cartes révisées)

#### Setup Analytics
- Vercel Analytics (gratuit, basic)
- OU Plausible (privacy-friendly, payant $9/mois)
- OU PostHog (self-hosted gratuit)

#### Feedback Qualitatif
- Google Form ou Tally
- Questions :
  1. As-tu compris comment utiliser le lecteur ?
  2. As-tu trouvé utile de cliquer sur les mots ?
  3. Les révisions t'ont-elles aidé à retenir ?
  4. Qu'est-ce qui manque le plus ?
  5. Recommanderais-tu l'app (0-10) ?

---

## Périmètre P1 (après validation P0)

### Priorité 1 : Import Manuel de Contenu
- [ ] Page "Importer" avec textarea + bouton
- [ ] Backend : parser HTML (cheerio) ou plaintext
- [ ] Tokenization + création Lesson automatique
- [ ] Support langues multiples (détection auto via `franc`)

### Priorité 2 : Traduction IA Contextuelle
- [ ] Remplacer MyMemory par appel Claude API
- [ ] Prompt : "Traduis le mot {mot} dans le contexte : {phrase}"
- [ ] Afficher explication grammaticale courte

### Priorité 3 : Onboarding Intérêts
- [ ] Écran "Quels sujets t'intéressent ?" (tags)
- [ ] Stocker tags en DB (UserInterests)
- [ ] Filtrer section "Pour toi" selon tags

### Priorité 4 : Audio de Base
- [ ] Upload fichier audio pour une leçon
- [ ] Lecteur audio simple (play/pause)
- [ ] Pas de synchronisation texte/audio (P2)

---

## Périmètre P2 (scale + différenciation)

### Import YouTube
- [ ] Extension navigateur (Chrome)
- [ ] Récupération sous-titres via youtube-transcript-api
- [ ] Création leçon avec audio YouTube embed

### SRS Avancé
- [ ] Reverse flashcards (traduction → mot)
- [ ] Cloze (phrase à trous)
- [ ] Dictée (input clavier)

### Mobile (React Native)
- [ ] Setup Expo projet
- [ ] Consommation API NestJS (même endpoints)
- [ ] Navigation : Library, Reader, Vocab, Review
- [ ] Build iOS/Android via EAS

### Communauté & Gamification
- [ ] Économie de pièces
- [ ] Défis hebdomadaires
- [ ] Classements par langue

---

## Décisions Techniques Importantes

### 1. Tokenization : quel niveau de précision ?
**Décision** : P0 = split naïf (espaces + ponctuation)  
**Justification** : la lemmatisation parfaite n'est pas critique pour un MVP. On peut améliorer en P1 avec des libs NLP.

### 2. Traduction : API gratuite ou IA ?
**Décision** : P0 = MyMemory (gratuit, limité)  
**Justification** : validation produit d'abord. Claude API coûte cher à scale, on l'ajoute en P1 une fois les utilisateurs validés.

### 3. Mobile : dès P0 ou après ?
**Décision** : après P0 (semaine 8+)  
**Justification** : valider le concept sur web d'abord. Mobile = 2x effort pour chaque feature.

### 4. Base de données : Postgres ou NoSQL ?
**Décision** : Postgres  
**Justification** : relations complexes (lessons → sentences → tokens → vocab), full-text search natif, transactions ACID pour SRS.

### 5. Déploiement : monorepo ou repos séparés ?
**Décision** : monorepo (Turborepo)  
**Justification** : partage de types TS entre front/back, déploiement simplifié, un seul repo git.

---

## Risques & Mitigations

### Risque 1 : Tokenization multilingue complexe
**Impact** : Moyen  
**Mitigation** : Utiliser compromise (EN), jieba (ZH), TinySegmenter (JA), natural (fallback). Accepter imperfections en P0.

### Risque 2 : Calcul "% nouveaux mots" lent
**Impact** : Élevé (UX)  
**Mitigation** : 
- Pré-calculer côté backend lors du seed
- Cacher en DB (champ `newWordsPercent` par user/lesson)
- Recalculer en background job quand user crée des LingQs

### Risque 3 : API traduction quotas dépassés
**Impact** : Critique  
**Mitigation** : 
- Rate limiting côté backend (max 100 req/user/jour en P0)
- Cache des traductions en DB (table TranslationCache)
- Fallback vers dict statique (JSON) si API down

### Risque 4 : Performance lecteur avec leçons longues (10k+ mots)
**Impact** : Moyen  
**Mitigation** : 
- Pagination côté backend (charger par blocs de 500 mots)
- Virtualisation côté front (react-window) en P1
- Lazy load des définitions (fetch on click, pas d'avance)

### Risque 5 : Abandon après J+3 (pas de rétention)
**Impact** : Critique (produit)  
**Mitigation** : 
- Notifications email "Tu as X cartes à réviser"
- Streak gamification dès P1
- Tests utilisateurs fréquents (hebdo) pour itérer vite

---

## Métriques de Succès MVP

### Métriques d'Engagement (semaine 1-4)
- [ ] 50+ leçons lues
- [ ] 500+ LingQs créés
- [ ] 200+ sessions de révision
- [ ] Taux de retour J+7 > 30%

### Métriques Qualitatives
- [ ] NPS ≥ 7/10
- [ ] ≥ 80% comprennent le concept en 5 min
- [ ] ≤ 3 bugs critiques reportés

### Signal Go/No-Go pour P1
**GO si** : ≥5 utilisateurs actifs 3 jours/semaine pendant 2 semaines  
**NO-GO si** : taux de rétention J+7 < 20% OU feedback majoritairement négatif

---

## Budget & Ressources

### Coûts Mensuels Estimés (P0)
- Neon Postgres : $0 (tier gratuit)
- Railway backend : $0 (tier gratuit, 500h/mois)
- Vercel frontend : $0 (hobby plan)
- MyMemory API : $0 (1000 req/jour)
- **Total P0** : $0/mois

### Coûts P1 (après 100 users)
- Railway : $20/mois (pro plan)
- Neon : $19/mois (scale plan)
- DeepL API : $50/mois (500k chars)
- Plausible Analytics : $9/mois
- **Total P1** : ~$100/mois

### Temps de Développement
- 1 dev full-stack : 6 semaines à temps plein pour P0
- OU 2 devs (1 front, 1 back) : 4 semaines

---

## Next Steps Immédiats

### Avant de coder
1. [ ] Valider ce plan avec stakeholders
2. [ ] Créer repo GitHub (monorepo Turborepo)
3. [ ] Setup outils dev (ESLint, Prettier, Husky)
4. [ ] Créer board Kanban (GitHub Projects ou Linear)

### Semaine 1 - Jour 1
1. [ ] Init NestJS backend
2. [ ] Init Next.js frontend
3. [ ] Setup Turborepo
4. [ ] Docker Compose (Postgres local)
5. [ ] Premier commit + CI (GitHub Actions)

---

## Conclusion

Ce plan améliore la proposition initiale en :
1. **Simplifiant drastiquement le P0** (6 semaines → produit testable)
2. **Reportant le mobile** après validation web
3. **Clarifiant l'architecture** backend (modules NestJS clairs)
4. **Ajoutant jalons de validation** (tests users, métriques)
5. **Gérant les risques** techniques et produit

**La prochaine étape** : valider ce plan, puis passer en mode implémentation en commençant par la semaine 1.
