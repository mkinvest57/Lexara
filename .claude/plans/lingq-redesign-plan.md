# Plan: Recréer l'Interface LingQ Exacte

## Analyse des Captures d'Écran

### 🎨 Design System Observé

**Palette de Couleurs LingQ:**
- Fond principal: `#FFFFFF` (blanc pur)
- Fond secondaire: `#F8F9FA` (gris très clair)
- Texte primaire: `#1C1C1E` (noir intense)
- Texte secondaire: `#8E8E93` (gris moyen)
- Accent primaire: `#FFA500` (orange vif) - bouton "PASSEZ EN PREMIUM"
- Bleu clair: `#E8F4FD` - fond de traduction sélectionnée
- Jaune LingQ: `#FFE066` - mots sauvegardés
- Bleu LingQ: `#4A9EFF` - mots inconnus (hover)
- Border: `#E5E5EA` (gris très clair)

**Typography:**
- Font principale: `-apple-system, BlinkMacSystemFont, "Segoe UI"` (système)
- Titres: 15-18px, weight 600
- Corps: 16-18px pour le lecteur, weight 400
- Sidebar: 13-14px

**Layout:**
- Sidebar gauche: 280px fixe
- Header: 56px hauteur, sticky top
- Panel droit (traductions): 360px fixe
- Contenu central: flexible
- Spacing: 12px, 16px, 20px, 24px (système 4px)

---

## 📋 Composants à Créer/Modifier

### 1. **Reader Principal** (Vue Leçon)

**Caractéristiques observées:**
- Fond blanc pur, pas de card
- Texte centré, max-width 740px
- Line-height 1.8-2.0 pour lisibilité
- Mots cliquables avec états:
  - Défaut (noir): hover bleu clair
  - Sauvegardé (jaune #FFE066): background filled
  - En révision (jaune clair): background moins intense
  - Connu: pas de highlight

**Panel droit (Sidebar de traduction):**
- Width: 360px fixe
- Sticky, scroll indépendant
- Sections:
  1. Mot sélectionné (header avec prononciation)
  2. "Signification Sauvegardée" (dropdown)
  3. "Traductions Populaires" (liste cliquable avec +)
  4. "Phrases Connexes" (dropdown)
  5. "Notes" (textarea)
- Footer: Boutons pagination (1, 2, 3, 4, ✓)

**Bottom Bar:**
- Height: 64px
- Bouton play audio (gauche)
- "Vue Page" (centre)
- "Analyser Phrase" (droite)
- Icônes de flashcards (coin droit)

### 2. **Navigation (Header)**

**Structure:**
- Logo LingQ (gauche)
- Nav: Lessons, Stats, Community, Admin
- Droite: 
  - Bouton "PASSEZ EN PREMIUM" (orange, très visible)
  - Compteur de pièces (43/100 Pièces)
  - Flag langue (avec dropdown)
  - Avatar utilisateur

### 3. **Sidebar Gauche**

**Structure:**
- Icône profil/mascotte (en haut)
- "Bibliothèque" section
  - Lynx IA (beta)
- "Communauté" section
- "Tuteurs" section
- Toggle collapse (bottom)

### 4. **Library Page**

**Caractéristiques:**
- Grid de leçons: 3 colonnes
- Card: image + titre + metadata
- Filters en haut (niveau, type)
- Hover: shadow elevate

### 5. **Review/Flashcards**

**Modal style:**
- Full screen overlay blanc
- Progress bar (vert, 1/4)
- Titre "Trouvez les paires"
- Grille de cartes 2x3
- Bouton "Passer" (bottom left)

### 6. **Import Extension**

**Dialog:**
- Icône LingQ (top)
- Titre de contenu
- Dropdown langue
- Bouton "Import" (noir, proéminent)
- "Import to:" dropdown
- "Add Tags:" field

---

## 🔧 Modifications Techniques

### Phase 1: Design Tokens (globals.css)

```css
:root {
  /* LingQ Colors */
  --lingq-orange: #FFA500;
  --lingq-yellow: #FFE066;
  --lingq-yellow-light: #FFF4CC;
  --lingq-blue: #4A9EFF;
  --lingq-blue-light: #E8F4FD;
  
  /* Grays */
  --gray-50: #F8F9FA;
  --gray-100: #E5E5EA;
  --gray-400: #8E8E93;
  --gray-900: #1C1C1E;
  
  /* Layout */
  --sidebar-width: 280px;
  --header-height: 56px;
  --reader-panel-width: 360px;
  --reader-max-width: 740px;
  
  /* Typography */
  --font-system: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-reader: Georgia, "Times New Roman", serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 16px;
  --space-xl: 20px;
  --space-2xl: 24px;
}
```

### Phase 2: Layout Structure

**Nouveau layout pour /lesson/[id]:**
```
┌─────────────────────────────────────────────┐
│           Header (sticky, 56px)              │
├──────────┬────────────────────┬──────────────┤
│  Sidebar │   Reader Content   │ Trans Panel  │
│  (280px) │   (flex, centered) │   (360px)    │
│  sticky  │                    │   sticky     │
│          │                    │              │
└──────────┴────────────────────┴──────────────┘
│           Bottom Bar (64px)                   │
└──────────────────────────────────────────────┘
```

### Phase 3: Reader avec Panel Droit

**Nouveau composant: `ReaderLayout.tsx`**
- 3 colonnes flex
- Sidebar gauche (existante)
- Contenu central scrollable
- Panel droit sticky avec:
  - `TranslationPanel.tsx`
  - `PhrasesPanel.tsx`
  - `NotesPanel.tsx`

**Nouveau composant: `TokenizedWord.tsx`**
- États: default, hover, saved, known
- Click handler avec highlight
- Tooltip preview au hover
- Gestion des status (1, 2, 3, 4, ✓)

### Phase 4: Flashcards/Review

**Nouveau composant: `ReviewModal.tsx`**
- Full screen modal
- Types: matching pairs, multiple choice, fill-in
- Progress indicator
- Navigation (Passer, 1, 2, 3, 4, ✓)

### Phase 5: Navigation & Header

**Modifier: `AppHeader.tsx`**
- Ajouter bouton Premium (orange)
- Compteur de pièces
- Dropdown langue avec flags
- Améliorer avatar dropdown

### Phase 6: Library Grid

**Modifier: `library/page.tsx`**
- Grid 3 colonnes (pas 2-3 responsive)
- Cards avec images toujours visibles
- Hover effects subtils
- Filter bar en haut

---

## 🎯 Priorités d'Implémentation

### P0 - Critique (Must Have)
1. ✅ Reader layout 3 colonnes
2. ✅ Panel de traduction droit (sticky)
3. ✅ États des mots (jaune/bleu/défaut)
4. ✅ Bottom bar avec audio player
5. ✅ Header avec bouton Premium

### P1 - Important
6. ✅ Flashcards modal (matching pairs)
7. ✅ Sidebar gauche collapsible
8. ✅ Library grid 3 colonnes
9. ✅ Import dialog

### P2 - Nice to Have
10. ⬜ Lynx IA chat integration
11. ⬜ Phrases connexes auto-generated
12. ⬜ Audio sync avec texte
13. ⬜ Extension browser (import)

---

## 📁 Fichiers à Créer

### Nouveaux composants:
1. `/components/reader/ReaderLayout.tsx`
2. `/components/reader/TranslationPanel.tsx`
3. `/components/reader/TokenizedWord.tsx`
4. `/components/reader/BottomBar.tsx`
5. `/components/review/ReviewModal.tsx`
6. `/components/review/MatchingPairs.tsx`
7. `/components/layout/AppHeader.tsx` (réécrire)
8. `/components/layout/CollapsibleSidebar.tsx`

### Nouveaux styles:
1. `/app/globals.css` (update avec tokens LingQ)
2. `/styles/reader.css` (styles spécifiques lecteur)

### Pages à modifier:
1. `/app/(app)/lesson/[id]/page.tsx` - Layout complet
2. `/app/(app)/library/page.tsx` - Grid 3 cols
3. `/app/(app)/review/page.tsx` - Modal flashcards
4. `/app/(app)/layout.tsx` - Ajouter collapsible sidebar

---

## 🎨 Design Decisions

### Pourquoi ce plan?

**1. Respecte l'UX LingQ:**
- Layout 3 colonnes identique
- Panel de traduction toujours visible
- Pas besoin de modal pour chaque mot

**2. Améliore la performance:**
- Sticky positioning (pas de JS scroll)
- Virtualization pas nécessaire (lessons <5000 mots)
- Traductions cached localement

**3. Mobile-first fallback:**
- <1024px: panel droit devient modal
- <768px: sidebar devient drawer
- Touch-friendly (44px+ targets)

**4. Accessibilité:**
- Keyboard navigation (Tab, Arrow keys)
- Screen reader labels
- Focus visible states
- Reduced motion support

---

## ⚠️ Challenges & Solutions

### Challenge 1: Panel droit sticky avec scroll indépendant
**Solution:** `position: sticky` + `overflow-y: auto` + `max-height: calc(100vh - header)`

### Challenge 2: Synchronisation audio <-> texte
**Solution:** Phase 2 - API backend retourne timestamps, frontend highlight en temps réel

### Challenge 3: États de mots persistants
**Solution:** Cache local (Zustand store) + sync avec backend au blur/unmount

### Challenge 4: Traductions multiples
**Solution:** API retourne top 5 traductions, utilisateur peut ajouter custom

---

## 📊 Estimation

**Total: ~6-8 heures de développement**

- Phase 1 (Tokens): 30min
- Phase 2 (Layout): 1h
- Phase 3 (Reader + Panel): 2h
- Phase 4 (Flashcards): 1.5h
- Phase 5 (Header/Nav): 1h
- Phase 6 (Library): 30min
- Testing + Polish: 1.5h

---

## ✅ Critères de Succès

1. **Visuel:** Impossible de distinguer de LingQ sans logo
2. **UX:** Panel de traduction accessible en 0 clics
3. **Performance:** <100ms pour highlight un mot
4. **Responsive:** Fonctionne sur mobile (drawer pattern)
5. **A11y:** Score Lighthouse Accessibility >95

---

## 🚀 Ordre d'Exécution

1. **Setup:** Update globals.css avec tokens LingQ
2. **Layout:** Créer ReaderLayout 3 colonnes
3. **Reader:** TokenizedWord + TranslationPanel
4. **Bottom:** BottomBar avec audio player
5. **Review:** Modal flashcards matching pairs
6. **Header:** Bouton Premium + compteur pièces
7. **Library:** Grid 3 colonnes
8. **Polish:** Animations, hover states, focus

---

**Prêt à implémenter! 🎯**
