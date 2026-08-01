# YAPRO — Plan de construction vers parité LingQ

> Objectif : passer de ~15% à parité fonctionnelle LingQ sur le produit d'apprentissage.
> Décisions actées : backend Supabase unique · contenu import-first + Mini Stories IA · périmètre apprentissage complet, social/tuteurs reportés.

---

## État réel du code (audit, pas la section 18 du spec)

La section 18 de `LINGQ_FEATURE_SPEC.md` est périmée. Constat après lecture du code :

### Ce qui existe vraiment
- Auth NextAuth (web) + écrans mobile Expo Router (19 routes)
- Reader web : `TokenizedText.tsx` (58 lignes), `WordModal.tsx` (115 lignes), `TranslationPanel`, `BottomBar`
- SRS réel via `ts-fsrs` dans le store zustand (`reviewWord`, `fsrsCard`)
- Page vocabulaire avec 3 onglets déjà câblés (`all` / `phrases` / `due`), recherche, filtre statut
- Export Anki, phonétique furigana/pinyin, dictionnaires externes, VoiceRecorderModal, boutique mascottes, route `/api/youtube`
- Migration Supabase **complète et de qualité** : 1122 lignes, 15 tables, 52 policies RLS, enum `review_activity` couvrant flashcard / reverse / cloze / dictation / multiple_choice / matching

### Les trois blocages structurels
1. **Trois sources de vérité.** Le contenu des leçons est hardcodé en constantes JS dans `apps/web/src/lib/product-store.ts` (826 lignes). `apps/api` est un Nest+Prisma sur SQLite. La migration Supabase existe mais n'est branchée à rien. Le web ne consomme jamais l'API.
2. **Statuts de mots binaires.** `LearningStatus = 1|2|3|4|5` mais `TokenizedText` ne rend que deux états : jaune si sauvé, bleu sinon. Pas de progression 1-2-3-4-connu visible, pas de blanc pour « connu ». C'est le cœur de LingQ et il manque.
3. **Duplication web/mobile.** `phonetics.ts`, `anki-exporter.ts`, `speech.ts`, `catalog.ts`, `product-store` et `voice-recorder-modal` existent en double dans les deux apps. `packages/types`, `packages/ui`, `packages/config` sont des dossiers vides.

---

## Architecture cible

```
packages/core      → types partagés, moteur SRS, tokenizer, statuts de mots, phonétique
packages/ui        → primitives partagées (tokens de design, non les composants natifs)
apps/web           → Next.js, consomme packages/core + Supabase
apps/mobile        → Expo, consomme packages/core + Supabase
apps/api           → SUPPRIMÉ (logique lourde en Edge Functions Supabase)
supabase/          → source de vérité unique : schéma, RLS, functions, storage
```

---

## Phase 0 — Unifier les fondations (bloquant, rien ne part avant)

Sans cette phase, chaque feature suivante serait écrite deux fois puis réécrite.

1. Créer `packages/core` : y déplacer les types (`SavedWord`, `ProductLesson`, statuts), le moteur FSRS, le tokenizer, `phonetics.ts`, `anki-exporter.ts`. Les deux apps importent depuis là.
2. Brancher Supabase : appliquer la migration existante, générer les types TS (`supabase gen types`), créer le client dans `packages/core`.
3. Sortir le contenu du code : les 6 histoires hardcodées de `product-store.ts` deviennent des seeds SQL dans `supabase/seed.sql`.
4. Réécrire `product-store` en cache + couche de sync sur Supabase, plus en base de données. Garder l'optimistic update, ajouter le mode offline.
5. Supprimer `apps/api`, redéployer sa logique utile (tokenizer, SRS) dans `packages/core` ou en Edge Functions.
6. Étendre le schéma pour ce qui manque au spec : `courses`, `pages`, `challenges`, `challenge_participants`, `word_status_history`, `tags`, `lesson_tags`, `daily_stats`, `coin_transactions`, `user_review_config`.

**Fin de phase :** les deux apps lisent/écrivent Supabase, zéro contenu hardcodé, zéro fichier dupliqué.

---

## Phase 1 — Le cœur du reader (la feature qui définit LingQ)

C'est la phase à ne pas rater. Tout le reste est secondaire.

1. **Système de statut des mots.** Enum complet `new | 1 | 2 | 3 | 4 | known | ignored`, plus les paliers SRS `4a` (30j), `4b` (90j), `4c` (jamais). Table `word_statuses` indexée par `(user_id, language_code, lemma)` pour que le statut suive l'utilisateur d'une leçon à l'autre — c'est la continuité du vocabulaire, la valeur centrale.
2. **Coloration réelle dans le reader.** Réécrire `TokenizedText` : bleu = nouveau, jaune dégradé selon statut 1-4, blanc = connu, transparent = ignoré. Rendu virtualisé pour les leçons longues.
3. **Popup mot enrichie.** Réécrire `WordModal` : barre de statut cliquable 1-2-3-4-connu, définitions multi-dictionnaires, traduction IA, Google Images, indices communauté, bouton connu, bouton ignorer.
4. **Détection de phrases.** Surligner en gris les mots voisins pouvant former une locution, permettre la sélection multi-mots pour créer un LingQ de phrase.
5. **Découpage en pages** et comportement « le changement de page marque comme connu » (activable/désactivable).
6. **Liste de vocabulaire dans le reader** : onglets LingQs / Nouveaux mots / Tous les mots.
7. **Bouton Review dans le reader** avec sous-options : Page, Phrase, Dus (SRS), Leçon.

**Fin de phase :** lire une leçon, cliquer les mots, voir les couleurs persister d'une leçon à l'autre. Le produit devient reconnaissable comme LingQ.

---

## Phase 2 — Modes de lecture

1. **Mode Phrase** : une phrase à la fois, traduction repliable, audio de la phrase, liste des LingQs de la phrase, navigation par swipe sur mobile.
2. **Mode Écoute / Karaoké** : plein écran, texte auto-défilant synchronisé à l'audio, phrase courante surlignée et centrée. Repli sur défilement manuel sans timestamps.
3. **Activités de révision de phrase** : Unscramble (reconstituer la phrase) et Speaking (enregistrement vocal, retour de prononciation — réutiliser `VoiceRecorderModal` qui existe déjà).
4. **Traduction en ligne** : traduction sous chaque ligne, activable via le menu `...`.
5. **Éditeur de phrase** pour les leçons importées : texte, traduction, note, timestamp audio.

---

## Phase 3 — Vocabulaire et SRS complets

1. **Les 5 activités de révision.** L'enum SQL existe déjà, il faut l'UI : flashcards, flashcards inversées, cloze (mot masqué dans la phrase d'origine), dictée (audio → saisie), choix multiple. Plus le matching déjà prévu dans l'enum.
2. **Logique « 2 bonnes réponses d'affilée → statut +1 »**, et 1 seule suffit à partir du statut 4.
3. **Progression manuelle** par clic sur la barre de statut, partout où un mot est affiché.
4. **Page vocabulaire enrichie** : les 3 onglets existent, ajouter tri (date, statut, alphabétique, leçon, aléatoire), filtres (statut, cours, tag, période), actions groupées (statut ±1, passer en connu, supprimer, marquer révisé, taguer), export CSV.
5. **LingQs du jour** : liste quotidienne configurable jusqu'à 200, historique 14 jours, email quotidien avec liens directs vers les flashcards.
6. **Réglages de révision** : activer/désactiver chaque activité, configurer recto/verso, nombre d'options en choix multiple, TTS auto.

---

## Phase 4 — Audio

1. **Lecteur complet** : vitesse 0.5x–2.0x, saut ±5s, barre de progression cliquable, volume, mini-barre persistante.
2. **TTS** : génération audio pour les leçons importées, choix de voix par langue, réglages (TTS auto, arrêt de l'audio leçon, non-superposition).
3. **Timestamps audio** : outil d'alignement pour activer le mode karaoké sur le contenu importé.
4. **Suivi temps réel de l'écoute** : compter chaque portion écoutée, pas seulement les leçons terminées.
5. **Audio en arrière-plan** sur mobile, lecture continue hors app.

---

## Phase 5 — Playlists

Les tables `playlists` et `playlist_items` existent déjà dans la migration.

1. Playlists multiples : créer, renommer, supprimer, réordonner
2. Ajout depuis la fiche leçon
3. Lecture séquentielle, aléatoire, répétition, lecture auto
4. Sync multi-appareils via Supabase
5. Téléchargement pour écoute hors ligne (mobile)
6. Mini-lecteur persistant — `mini-player.tsx` existe déjà côté mobile, à étendre

---

## Phase 6 — Import (le pilier de la stratégie contenu)

Décision actée : le contenu vient de l'utilisateur. Cette phase porte donc une valeur disproportionnée.

1. **Formulaire d'import complet** : titre, langue, image, texte, URL source, audio (60 Mo / 60 min max), traduction, vidéo, niveau, tags, cours, découpage auto des contenus longs en leçons.
2. **YouTube** : `/api/youtube` existe, le durcir — extraction de sous-titres, repli sur transcription IA si absents.
3. **Articles web** : extraction de contenu (Readability) depuis une URL.
4. **eBooks** : EPUB, PDF, TXT avec découpage par chapitre.
5. **Extension navigateur** (`apps/extension`, Manifest V3, Chrome/Firefox/Safari/Edge) : import en un clic, capture titre/texte/image/sous-titres/URL, sélection langue et cours. Cible aussi Netflix, Prime Video, Disney+, Apple TV, TikTok via sous-titres.
6. **Import mobile** via le menu Partager iOS/Android.
7. **Transcription IA** des podcasts et audiobooks.
8. **Leçon simplifiée par IA** : générer une version plus accessible d'un contenu avancé.

---

## Phase 7 — Bibliothèque et contenu de départ

1. **Étagères style Netflix** : Continuer l'étude, Tendances, Nouveautés, Mini Stories, Cours guidés, Actus à importer, plus les étagères par thème issues de l'onboarding. Ordre adaptatif selon usage.
2. **Génération des Mini Stories** : pipeline IA produisant 60 histoires progressives par langue, chacune avec récit principal, reformulation à une autre personne, questions de compréhension, audio TTS. C'est le contenu d'onboarding, il conditionne la première impression.
3. **Flux d'actus** : agrégation RSS par langue cible, import en un clic.
4. **Guides de grammaire** : `grammar.tsx` existe côté mobile, à étendre en contenu structuré multi-langues.
5. **Fiche leçon** : description, niveau, nombre de mots, durée audio, % nouveaux / LingQs / connus calculés depuis le vocabulaire de l'utilisateur, ajout playlist, partage.
6. **Filtres et recherche** : niveau, type de contenu, tags, texte libre.
7. **Cours** : regroupement de leçons, progression dans le cours.

---

## Phase 8 — Stats, progression, gamification

1. **Métriques complètes** : mots connus, LingQs créés, LingQs appris, mots lus, heures d'écoute, pièces, série, score d'activité (pièces sur 30 jours).
2. **Suivi temps réel** de la lecture et de l'écoute, agrégation quotidienne en `daily_stats`.
3. **Graphiques** : évolution des mots connus, mots lus, heures d'écoute, LingQs créés, activité par jour de semaine. Filtres jour / semaine / mois / année / total.
4. **Widget résumé hebdo** accessible depuis l'icône série, avec comparaison à la semaine précédente.
5. **Série et objectif quotidien** : icône flamme changeant de couleur selon le score d'activité, objectif configurable, gels de série.
6. **Pièces** : gagnées par création de LingQ, montée de statut, passage en connu, lecture, écoute. Dépensées en cosmétique — la boutique mascottes existe déjà.
7. **Jalons mots connus** : badges 1K, 5K, 10K, 25K, 50K, 100K.
8. **Saisie manuelle de stats** pour l'activité hors app.
9. **Multi-langues** : stats indépendantes par langue, `user_languages` existe déjà.
10. **Défis** : rejoindre, classements, badges. `challenges.tsx` existe côté mobile, backend à créer.

---

## Phase 9 — Réglages et personnalisation

1. **Réglages du reader** : police (12 choix web), taille, interlignage 1.0–3.0, largeur de page simple/double, style de surlignage, locutions liées, page marque comme connu, vocabulaire en mode phrase, fusion des définitions, sens du texte LTR/RTL.
2. **Mode sombre** complet sur les deux apps.
3. **Support RTL** réel pour arabe et hébreu.
4. **Réglages audio/TTS** et **réglages de révision** (voir phases 3 et 4).
5. **Compte** : email, mot de passe, langues étudiées, suppression des données d'une langue, suppression de compte.
6. **Notifications** : rappel quotidien, alerte série, défis, nouveau contenu. Push mobile via Expo.
7. **Langue d'interface** : i18n, 17 langues cibles. L'app est actuellement en français en dur.

---

## Phase 10 — Mobile à parité

1. **Navigation par onglets** conforme : Bibliothèque, Playlists, Reader, Vocabulaire, Plus
2. **Mode hors ligne** : téléchargement de leçons, sync du vocabulaire au retour du réseau, résolution de conflits
3. **Mode phrase au swipe**, lecture auto au changement de phrase
4. **Mode karaoké** fluide
5. **Widget de série** en écran d'accueil
6. **Extension de partage** pour l'import
7. **Rotation d'écran** pour la lecture en paysage

---

## Phase 11 — IA

1. **Chatbot en lecture** (type Lynx) : expliquer mot, phrase, grammaire en contexte
2. **Traductions suggérées par IA** dans la popup mot
3. **Voix IA** naturelles en TTS
4. **Transcription audio** (couvert en phase 6)
5. **Simplification de leçon** (couvert en phase 6)

Toutes les fonctions IA passent par des Edge Functions Supabase, jamais de clé API côté client.

---

## Phase 12 — Reporté explicitement

Hors périmètre selon la décision actée, à rouvrir plus tard :
marketplace de tuteurs, réservation de sessions, monnaie Points, forum Discourse, Writing Exchange, groupes/classes, profil social avec abonnés et mur, système de parrainage, paliers tarifaires et gating.

---

## Ordre d'exécution

La phase 0 est bloquante. La phase 1 est ce qui transforme le produit. Ensuite, ordre par valeur décroissante :

```
0 · Fondations         ← bloquant absolu
1 · Cœur du reader     ← la feature qui définit le produit
6 · Import             ← seule source de contenu
7 · Bibliothèque       ← Mini Stories, première impression
3 · Vocabulaire/SRS    ← boucle de rétention
2 · Modes de lecture
4 · Audio
5 · Playlists
8 · Stats/gamification
9 · Réglages
10 · Mobile à parité
11 · IA
```

Justification de l'ordre : import avant vocabulaire avancé, parce qu'un SRS parfait sur une bibliothèque vide ne sert à rien. Mini Stories tôt, parce que l'onboarding décide de la rétention. Mobile en fin, parce que `packages/core` rend le portage mécanique une fois le web stabilisé.

---

## Points de vigilance

- **Performance du reader.** Une leçon de 5000 mots = 5000 spans cliquables avec lookup de statut. Il faut un index `Map` en mémoire et de la virtualisation, sinon le reader rame — c'est précisément l'écran où la lenteur est inacceptable.
- **Sync offline.** Le vocabulaire se modifie hors ligne sur mobile. Prévoir la stratégie de résolution de conflits dès la phase 0, pas après.
- **Coût IA.** Mini Stories pour 50 langues, TTS, transcription, chatbot : chiffrer avant de lancer les pipelines de génération.
- **Droits d'auteur.** L'import reste privé par défaut. Le partage en bibliothèque publique n'est possible que pour du contenu libre de droits.
- **Tokenisation.** Japonais, chinois, thaï n'ont pas d'espaces. Un tokenizer par script est nécessaire, le commit `c6d1fba` a commencé le travail.
- **Sécurité.** Aucune clé API IA côté client. RLS activé sur toute nouvelle table, en cohérence avec les 52 policies existantes.




