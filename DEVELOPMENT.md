# Lexara Development Guide

Comprehensive guide for developers working on Lexara.

## 📑 Table of Contents

1. [Project Setup](#project-setup)
2. [Architecture](#architecture)
3. [Backend Development](#backend-development)
4. [Frontend Development](#frontend-development)
5. [Database](#database)
6. [Testing](#testing)
7. [Common Tasks](#common-tasks)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Project Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop
- Git

### First-Time Setup

```bash
# 1. Clone repository
git clone https://github.com/yourusername/lexara.git
cd lexara

# 2. Install dependencies
pnpm install

# 3. Start PostgreSQL
docker-compose up -d

# 4. Set up backend
cd apps/api
cp .env.example .env
# Edit .env with your values
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed

# 5. Set up frontend
cd ../web
cp .env.example .env.local
# Edit .env.local

# 6. Start development
cd ../..
pnpm dev
```

### Accessing the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Docs**: http://localhost:3001/api (add Swagger in future)
- **Prisma Studio**: `cd apps/api && pnpm prisma:studio`

---

## 🏗️ Architecture

### Monorepo Structure

```
lexara/
├── apps/
│   ├── api/          # NestJS backend
│   └── web/          # Next.js frontend
├── packages/         # Shared packages (future)
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

### Technology Choices

**Why Turborepo?**
- Caches builds across apps
- Parallel task execution
- Shared dependencies

**Why NestJS?**
- Modular architecture scales well
- Built-in DI and testing
- TypeScript-first

**Why Next.js 15?**
- React Server Components
- Excellent DX
- Easy deployment on Vercel

**Why Prisma?**
- Type-safe queries
- Auto migrations
- Great DX with Studio

---

## 🔧 Backend Development

### Module Structure

Each module follows this pattern:

```
src/lessons/
├── lessons.module.ts       # Module definition
├── lessons.controller.ts   # HTTP endpoints
├── lessons.service.ts      # Business logic
├── tokenizer.service.ts    # Helper services
└── dto/
    ├── create-lesson.dto.ts
    └── update-lesson.dto.ts
```

### Creating a New Module

```bash
cd apps/api
nest g module feature-name
nest g controller feature-name
nest g service feature-name
```

### Adding a New Endpoint

```typescript
// lessons.controller.ts
@Get(':id')
async findOne(@Param('id') id: string, @CurrentUser() user) {
  return this.lessonsService.findOne(id, user.userId);
}
```

### Database Migrations

```bash
# Create migration after schema change
pnpm prisma:migrate

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# View data
pnpm prisma:studio
```

### Adding a New Table

1. Edit `prisma/schema.prisma`
2. Run `pnpm prisma:generate`
3. Run `pnpm prisma:migrate`
4. Update seed script if needed

Example:
```prisma
model NewFeature {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  
  @@map("new_features")
}
```

---

## 🎨 Frontend Development

### Page Structure

```
app/
├── (app)/           # Authenticated routes
│   ├── layout.tsx   # Auth check + layout
│   └── dashboard/
│       └── page.tsx
├── login/           # Public routes
└── page.tsx         # Landing
```

### Creating a New Page

```typescript
// app/(app)/new-page/page.tsx
'use client';

import { useSession } from 'next-auth/react';

export default function NewPage() {
  const { data: session } = useSession();
  
  return (
    <div className="container mx-auto p-6">
      <h1>New Page</h1>
    </div>
  );
}
```

### Adding a New Component

```typescript
// components/feature/NewComponent.tsx
interface NewComponentProps {
  title: string;
}

export function NewComponent({ title }: NewComponentProps) {
  return (
    <div>
      <h2>{title}</h2>
    </div>
  );
}
```

### Using TanStack Query

```typescript
const { data, isLoading } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => apiClient.getResource(token, id),
  enabled: !!token && !!id,
});
```

### Mutations

```typescript
const mutation = useMutation({
  mutationFn: (data) => apiClient.createResource(token, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
  },
});

// Usage
mutation.mutate({ name: 'New Resource' });
```

---

## 🗄️ Database

### Schema Overview

**Core Entities:**
- User → LanguageProfile → Lessons
- VocabEntry → VocabOccurrence → Token
- SRSItem (scheduling)

**Key Relationships:**
- One User has one LanguageProfile
- One Profile has many Lessons
- One Lesson has many Sentences → Tokens
- VocabEntry links to Tokens via VocabOccurrence

### Querying with Prisma

```typescript
// Find with relations
const lesson = await prisma.lesson.findUnique({
  where: { id },
  include: {
    sentences: {
      include: {
        tokens: true,
      },
    },
  },
});

// Filter and sort
const vocab = await prisma.vocabEntry.findMany({
  where: {
    userId,
    status: { in: [1, 2, 3] },
  },
  orderBy: {
    createdAt: 'desc',
  },
  take: 20,
});

// Transactions
await prisma.$transaction(async (tx) => {
  const vocab = await tx.vocabEntry.create({ data: {...} });
  await tx.sRSItem.create({ data: { vocabEntryId: vocab.id } });
});
```

### Performance Tips

- Use `select` instead of `include` when possible
- Add indexes for frequently queried fields
- Use transactions for related writes
- Batch queries with `Promise.all`

---

## 🧪 Testing

### Unit Tests (Future)

```typescript
// lessons.service.spec.ts
describe('LessonsService', () => {
  let service: LessonsService;
  
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [LessonsService, PrismaService],
    }).compile();
    
    service = module.get<LessonsService>(LessonsService);
  });
  
  it('should find a lesson', async () => {
    const lesson = await service.findOne('id', 'userId');
    expect(lesson).toBeDefined();
  });
});
```

### E2E Tests (Future)

```typescript
// app.e2e-spec.ts
describe('Auth (e2e)', () => {
  it('/auth/signup (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/signup')
      .send({ email: 'test@test.com', password: '123456' })
      .expect(201);
  });
});
```

---

## 🔧 Common Tasks

### Add a New Translation Provider

1. Create service:
```typescript
// vocab/providers/deepl.service.ts
export class DeeplTranslationService {
  async translate(text: string, targetLang: string) {
    // Implementation
  }
}
```

2. Update translation service to use it
3. Add API key to .env
4. Update docs

### Add a New SRS Activity Type

1. Update ReviewSession type enum
2. Create new component in `apps/web/src/components/srs/`
3. Add route handler in review page
4. Update backend to handle new type

### Add a New Language

1. Update language codes in types
2. Add to language profile dropdown
3. Update tokenizer for language-specific rules
4. Add seed data for that language
5. Test thoroughly

### Change Authentication Provider

1. Add provider to NextAuth config
2. Update UI with provider button
3. Handle OAuth callback
4. Map provider data to User model

---

## 🐛 Troubleshooting

### "Module not found" in Backend

```bash
cd apps/api
rm -rf dist node_modules
pnpm install
pnpm build
```

### Database Connection Errors

```bash
# Check if Docker is running
docker ps

# Restart PostgreSQL
docker-compose down
docker-compose up -d

# Verify connection
cd apps/api
pnpm prisma:studio
```

### Frontend Not Updating

```bash
cd apps/web
rm -rf .next
pnpm dev
```

### Prisma Client Out of Sync

```bash
cd apps/api
pnpm prisma:generate
```

### Port Already in Use

```bash
# Find and kill process
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Or use different ports in .env
```

### TypeScript Errors

```bash
# Full type check
pnpm type-check

# Clear cache
rm -rf node_modules/.cache
pnpm build
```

---

## 📝 Code Style

### Naming Conventions

- **Files**: `kebab-case.ts`
- **Components**: `PascalCase.tsx`
- **Functions**: `camelCase()`
- **Constants**: `UPPER_SNAKE_CASE`
- **Types**: `PascalCase`

### Import Order

```typescript
// 1. External packages
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// 2. Internal modules
import { CreateLessonDto } from './dto/create-lesson.dto';

// 3. Types
import type { Lesson } from '@prisma/client';
```

### Error Handling

```typescript
// Backend
throw new NotFoundException('Lesson not found');
throw new BadRequestException('Invalid input');
throw new UnauthorizedException('Not authenticated');

// Frontend
try {
  await mutation.mutateAsync(data);
} catch (error: any) {
  toast.error(error.message || 'An error occurred');
}
```

---

## 🚀 Performance Optimization

### Backend

- Use `select` in Prisma queries
- Implement caching (Redis in future)
- Add database indexes
- Paginate large lists
- Use background jobs for heavy tasks

### Frontend

- Use React.memo for expensive components
- Lazy load routes with next/dynamic
- Optimize images with next/image
- Use React Query caching effectively
- Implement virtualization for long lists

---

## 📚 Additional Resources

- [NestJS Docs](https://docs.nestjs.com/)
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [shadcn/ui](https://ui.shadcn.com/)

---

**Happy coding! 🎉**
