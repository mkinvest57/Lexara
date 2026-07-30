# Lexara

**Learn languages through real content, not exercises.**

Lexara is a language learning platform inspired by the immersion method. Read articles, watch videos, listen to podcasts - click any word to save it, then review with spaced repetition.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=flat&logo=postgresql&logoColor=white)

## 🎯 Features

### Core MVP (P0)
- ✅ **Immersive Reader** - Click any word to see translation and save it
- ✅ **Smart Vocabulary** - Words stay highlighted across all lessons
- ✅ **Spaced Repetition** - Review your vocabulary with optimized intervals
- ✅ **Progress Tracking** - Daily stats, words known, reading streaks
- ✅ **Multiple Levels** - Beginner, Intermediate, Advanced content

### Coming Soon (P1)
- 🚧 Manual content import (paste articles/text)
- 🚧 YouTube subtitle import
- 🚧 AI contextual translation (Claude API)
- 🚧 Audio synchronization
- 🚧 Personalized recommendations

### Future (P2)
- 📋 Browser extension for one-click import
- 📋 Multiple SRS activities (cloze, dictation, MCQ)
- 📋 AI tutor for conversation practice
- 📋 Mobile app (React Native + Expo)
- 📋 Community challenges and leaderboards

## 🏗️ Architecture

**Monorepo** structure with Turborepo:

```
lexara/
├── apps/
│   ├── web/          # Next.js 15 frontend
│   └── api/          # NestJS backend
├── packages/
│   ├── ui/           # Shared UI components
│   ├── types/        # Shared TypeScript types
│   └── config/       # Shared configs
└── PLAN.md           # Detailed MVP plan
```

### Tech Stack

**Frontend**
- Next.js 15 (App Router, React Server Components)
- TailwindCSS + shadcn/ui
- TanStack Query (React Query)
- NextAuth for authentication

**Backend**
- NestJS (modular architecture)
- Prisma ORM
- PostgreSQL
- JWT authentication
- MyMemory Translation API (free tier)

**DevOps**
- Docker Compose for local development
- Vercel (frontend deployment)
- Railway/Render (backend deployment)
- Neon (Postgres hosting)

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (for PostgreSQL)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/lexara.git
cd lexara

# Install dependencies
pnpm install

# Start PostgreSQL
docker-compose up -d

# Setup backend
cd apps/api
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed

# Setup frontend
cd ../web
cp .env.example .env.local
```

### Development

```bash
# Start all apps (from root)
pnpm dev

# Or start individually
cd apps/api && pnpm dev    # Backend on :3001
cd apps/web && pnpm dev    # Frontend on :3000
```

### Demo Account

```
Email: demo@lexara.com
Password: demo123456
```

## 📚 Project Structure

### Backend Modules

```
apps/api/src/
├── auth/              # JWT authentication
├── users/             # User management
├── language-profiles/ # User language settings
├── lessons/           # Lessons & tokenization
├── vocab/             # Vocabulary (LingQs) & translation
├── srs/               # Spaced repetition system
├── stats/             # Statistics & activity logs
└── prisma/            # Database service
```

### Database Schema

9 main entities:
- **User** → **LanguageProfile** → **Lessons** → **Sentences** → **Tokens**
- **VocabEntry** ← **VocabOccurrence** → **Token** (links vocab to lessons)
- **SRSItem** (scheduling for each vocab entry)
- **ReviewSession** + **ActivityLog** (tracking)

## 🎓 How It Works

### 1. Reading Flow
1. User opens a lesson from the library
2. Text is displayed with each word clickable
3. Click word → see translation + example sentence
4. Click "Save" → creates a LingQ (vocab entry)
5. Word turns yellow in this and all future lessons
6. Reading activity is logged (words read, time spent)

### 2. Vocabulary System
- Each saved word has a **status** (1-3 = learning, 4 = known)
- Linked to original **context** (sentence where first seen)
- Automatically creates an **SRS item** for review

### 3. Spaced Repetition
- Algorithm: **SM-2 simplified**
- Intervals: 1 day → 3 days → 7 days → 14 days → 30 days
- Correct answer 2x in a row → status increases
- Wrong answer → resets to 1 day interval
- Status 4 (known) → no more reviews

### 4. Statistics
- **Today**: words read, minutes listened, cards reviewed
- **Overall**: total known words, total LingQs, due cards
- **Goals**: customizable daily targets

## 🔑 Key Differentiators

vs. **LingQ**:
- ✨ Cleaner, simpler UI (less overwhelming)
- ✨ Better tokenization and word tracking
- ✨ Focused MVP (no feature bloat)
- ✨ Modern tech stack (easier to iterate)

vs. **Duolingo**:
- 📖 Real content, not artificial exercises
- 🎯 User-driven learning (import your own content)
- 🧠 Vocabulary in context, not isolated words

## 📈 Success Metrics

**MVP Validation Goals** (Week 1-4):
- 50+ lessons read
- 500+ LingQs created
- 200+ review sessions
- 30%+ D7 retention rate
- NPS ≥ 7/10

## 🗺️ Roadmap

**Phase 1 - Backend Foundation** ✅ (Weeks 1-2)
- [x] NestJS setup + Prisma schema
- [x] Auth (signup/login)
- [x] All modules (lessons, vocab, SRS, stats)
- [x] Seed data (7 demo lessons)

**Phase 2 - Frontend Core** 🚧 (Weeks 3-4)
- [ ] Next.js setup + authentication
- [ ] Library page (lesson cards)
- [ ] Immersive reader (tokenized text)
- [ ] Vocabulary page
- [ ] SRS review session
- [ ] Dashboard with stats

**Phase 3 - Polish & Deploy** (Weeks 5-6)
- [ ] Responsive design
- [ ] Error handling & loading states
- [ ] Dark mode
- [ ] Deploy to production
- [ ] User testing with 5-10 early adopters

**Phase 4 - Content Import** (Weeks 7-8)
- [ ] Manual text import
- [ ] URL scraping (articles)
- [ ] YouTube subtitle import

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## 📝 License

MIT © 2024 Lexara

## 🙏 Acknowledgments

- Inspired by **LingQ** and the comprehensible input method
- Built with amazing open-source tools
- Special thanks to early testers

---

**Made with ❤️ by developers who love languages**
