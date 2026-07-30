# Changelog

All notable changes to Lexara will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2024-07-30

### 🎉 Initial Release - MVP

The first functional MVP of Lexara is ready!

### Added

#### Backend (NestJS)
- **Authentication System**
  - JWT-based authentication
  - Signup and login endpoints
  - User management
  
- **Language Profile Management**
  - One language profile per user
  - Customizable daily goals (words, minutes, cards)
  - Support for multiple levels (beginner, intermediate, advanced)

- **Lesson System**
  - Lesson storage and retrieval
  - Text tokenization (sentences → tokens)
  - Seed data with 7 Spanish lessons across 3 levels
  - Word count calculation

- **Vocabulary Management (LingQs)**
  - Save words from lessons
  - Track occurrences in context
  - Status system (1-4 for learning, known)
  - Translation via MyMemory API

- **Spaced Repetition System (SRS)**
  - SM-2 simplified algorithm
  - Review scheduling (1d → 3d → 7d → 14d → 30d)
  - Flashcard sessions
  - Progress tracking

- **Statistics & Progress**
  - Daily stats (words read, minutes listened, cards reviewed)
  - Overall stats (known words, total LingQs, due cards)
  - Activity logging

#### Frontend (Next.js)
- **Landing Page**
  - Hero section with clear value proposition
  - Feature highlights
  - Call-to-action buttons

- **Authentication**
  - Login page
  - Signup page
  - NextAuth integration
  - Demo account support

- **Dashboard**
  - Today's goals with progress bars
  - Overall statistics cards
  - Quick action buttons

- **Library**
  - Lesson cards with images
  - Level filtering (beginner, intermediate, advanced)
  - Responsive grid layout

- **Immersive Reader**
  - Tokenized text display
  - Click-to-translate functionality
  - Word highlighting (blue = new, yellow = saved)
  - Modal for saving vocabulary
  - Reading progress tracking

- **Vocabulary Page**
  - List of saved words with translations
  - Context sentences
  - Link back to original lessons
  - Status filtering
  - Mark as known action

- **Review Session**
  - Flashcard interface
  - Progress bar
  - Show answer → rate as correct/wrong
  - Session completion summary
  - Automatic SRS scheduling

#### Infrastructure
- **Monorepo Setup**
  - Turborepo configuration
  - pnpm workspaces
  - Shared build/dev scripts

- **Database**
  - Prisma ORM
  - PostgreSQL schema
  - Migrations
  - Seed script with demo data

- **DevOps**
  - Docker Compose for local PostgreSQL
  - Environment variable templates
  - Setup automation script

#### Documentation
- Comprehensive README with badges
- Detailed MVP plan (PLAN.md)
- Development guide (DEVELOPMENT.md)
- Deployment guide (DEPLOYMENT.md)
- Contributing guidelines
- Quick start guide
- MIT License

### Technical Details

**Backend Stack:**
- NestJS 10
- Prisma 5.15
- PostgreSQL 16
- JWT authentication
- bcrypt for passwords

**Frontend Stack:**
- Next.js 15 (App Router)
- React 18
- TailwindCSS 3
- shadcn/ui components
- TanStack Query (React Query)
- NextAuth for authentication

**Dev Tools:**
- TypeScript 5.5
- ESLint
- Prettier
- Turbo for monorepo management

### Known Limitations (P0 MVP)

- Single language per user (Spanish only in seed data)
- Basic tokenization (no advanced NLP)
- Free translation API (MyMemory, limited quality)
- No audio synchronization
- No manual content import
- No YouTube integration
- Flashcards only (no other SRS activities)
- No dark mode
- No mobile app

### Coming in v0.2.0 (P1)

- [ ] Manual content import (paste articles)
- [ ] URL scraping for articles
- [ ] YouTube subtitle import
- [ ] AI contextual translation (Claude API)
- [ ] Onboarding flow with interest selection
- [ ] Audio upload support
- [ ] Dark mode
- [ ] Better tokenization with NLP libraries

### Coming in v0.3.0 (P2)

- [ ] Browser extension for one-click import
- [ ] Multiple SRS activities (cloze, dictation, MCQ)
- [ ] AI tutor for conversation practice
- [ ] React Native mobile app
- [ ] Community features (challenges, leaderboards)
- [ ] Multi-language UI
- [ ] Marketplace for courses

---

## How to Upgrade

When new versions are released:

```bash
# Pull latest code
git pull origin main

# Update dependencies
pnpm install

# Run new migrations (if any)
cd apps/api
pnpm prisma:migrate

# Rebuild
cd ../..
pnpm build
```

---

## Support

Found a bug? Have a feature request?
- Open an issue: https://github.com/yourusername/lexara/issues
- Check discussions: https://github.com/yourusername/lexara/discussions

---

**Thank you for being part of the Lexara journey! 🎉**
