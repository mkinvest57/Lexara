# Lexara API

Backend API for Lexara language learning platform.

## Tech Stack

- **NestJS** - Progressive Node.js framework
- **Prisma** - Type-safe ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **TypeScript** - Language

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (via Docker or local)

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env

# Start PostgreSQL
docker-compose up -d

# Generate Prisma client
pnpm prisma:generate

# Run migrations
pnpm prisma:migrate

# Seed database with demo data
pnpm prisma:seed
```

### Development

```bash
# Start dev server (watch mode)
pnpm dev

# Build
pnpm build

# Start production
pnpm start:prod
```

### Prisma Commands

```bash
# Open Prisma Studio (database GUI)
pnpm prisma:studio

# Create new migration
pnpm prisma:migrate

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
```

## API Endpoints

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login

### Language Profile

- `POST /api/language-profile` - Create profile
- `GET /api/language-profile` - Get profile
- `PATCH /api/language-profile` - Update profile

### Lessons

- `GET /api/lessons` - List lessons
- `GET /api/lessons/:id` - Get lesson with tokens

### Vocabulary

- `POST /api/vocab` - Create vocab entry (LingQ)
- `GET /api/vocab` - List vocab entries
- `PATCH /api/vocab/:id/status` - Update status
- `POST /api/vocab/translate` - Translate word

### SRS (Spaced Repetition)

- `GET /api/srs/due` - Get due cards
- `POST /api/srs/review` - Submit review
- `POST /api/srs/session/start` - Start session
- `POST /api/srs/session/:id/end` - End session

### Statistics

- `GET /api/stats/today` - Today's stats
- `GET /api/stats/overview` - Overall stats
- `POST /api/stats/log/reading` - Log reading activity
- `POST /api/stats/log/review` - Log review activity

## Demo Account

```
Email: demo@lexara.com
Password: demo123456
```

## Environment Variables

See `.env.example` for all required variables.

## Architecture

```
src/
├── auth/              # Authentication (JWT, local strategy)
├── users/             # User management
├── language-profiles/ # User language profiles
├── lessons/           # Lessons & tokenization
├── vocab/             # Vocabulary (LingQs)
├── srs/               # Spaced repetition system
├── stats/             # Statistics & activity logs
├── common/            # Shared utilities
└── prisma/            # Prisma service
```

## License

MIT
