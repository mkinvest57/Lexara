# Lexara Web

Frontend application for Lexara language learning platform.

## Tech Stack

- **Next.js 15** - App Router, React Server Components
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **NextAuth** - Authentication
- **TanStack Query** - Server state management
- **Zustand** - Client state (minimal)

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- Backend API running on http://localhost:3001

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Update .env.local with your values
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here
```

### Development

```bash
# Start dev server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

The app will be available at http://localhost:3000

## Features

### Implemented
- ✅ Landing page
- ✅ Authentication (login/signup)
- ✅ Dashboard with stats
- ✅ Library (lesson cards with filters)
- ✅ Immersive reader (tokenized text, word highlighting)
- ✅ Vocabulary management
- ✅ SRS review (flashcards)
- ✅ Progress tracking

### Coming Soon
- 🚧 Dark mode toggle
- 🚧 Settings page
- 🚧 Onboarding flow
- 🚧 Manual content import
- 🚧 Profile customization

## Project Structure

```
src/
├── app/
│   ├── (app)/           # Authenticated routes
│   │   ├── dashboard/   # Main dashboard
│   │   ├── library/     # Lesson library
│   │   ├── lesson/      # Immersive reader
│   │   ├── vocab/       # Vocabulary list
│   │   └── review/      # SRS review session
│   ├── login/           # Login page
│   ├── signup/          # Signup page
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn components
│   ├── layout/          # Layout components
│   ├── reader/          # Reader components
│   └── providers.tsx    # App providers
├── lib/
│   ├── api-client.ts    # API wrapper
│   └── utils.ts         # Utilities
└── types/
    └── index.ts         # TypeScript types
```

## Key Components

### TokenizedText
Renders text with clickable words. Highlights saved vocabulary.

### WordModal
Shows translation and allows saving words as LingQs.

### AppLayout
Protected layout with sidebar and header.

## API Integration

All API calls go through `@/lib/api-client.ts` which handles:
- Authentication headers
- Error handling
- Type safety

## Styling

Uses TailwindCSS with shadcn/ui components. Theme variables in `globals.css`.

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api  # Backend API
NEXTAUTH_URL=http://localhost:3000             # Frontend URL
NEXTAUTH_SECRET=your-secret-key                # Auth secret
```

## Demo Account

```
Email: demo@lexara.com
Password: demo123456
```

## License

MIT
