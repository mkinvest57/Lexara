# Quick Start Guide

Get Lexara running locally in under 5 minutes.

## ⚡ Fast Setup (Recommended)

### 1. Automated Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/lexara.git
cd lexara

# Run the setup script
./setup.sh
```

The script will:
- ✅ Check prerequisites (Node, pnpm, Docker)
- ✅ Install dependencies
- ✅ Start PostgreSQL
- ✅ Set up environment files
- ✅ Run database migrations
- ✅ Seed demo data

### 2. Start Development

```bash
pnpm dev
```

### 3. Access the App

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

### 4. Login

```
Email: demo@lexara.com
Password: demo123456
```

---

## 🔧 Manual Setup

If the script doesn't work, follow these steps:

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker Desktop

### Step-by-Step

```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL
docker-compose up -d

# 3. Backend setup
cd apps/api
cp .env.example .env
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed

# 4. Frontend setup
cd ../web
cp .env.example .env.local

# 5. Start development
cd ../..
pnpm dev
```

---

## 🎯 What's Next?

### Explore the App

1. **Dashboard** - See your learning stats
2. **Library** - Browse pre-loaded Spanish lessons
3. **Read a Lesson** - Click on words to save them
4. **Vocabulary** - View your saved words
5. **Review** - Practice with flashcards

### Customize

1. Edit `apps/api/.env` for backend config
2. Edit `apps/web/.env.local` for frontend config
3. Add your own lessons via Prisma Studio

### Development Tools

```bash
# Open database GUI
cd apps/api && pnpm prisma:studio

# View logs
pnpm dev  # Shows both backend and frontend logs

# Type checking
pnpm type-check

# Linting
pnpm lint
```

---

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Check what's using the port
lsof -i :3000  # Frontend
lsof -i :3001  # Backend

# Kill the process or change ports in .env files
```

### Database Connection Failed

```bash
# Restart PostgreSQL
docker-compose down
docker-compose up -d

# Wait a few seconds then try again
```

### "Module not found" Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
pnpm install
```

### Prisma Errors

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma migrate reset  # WARNING: Deletes all data
```

---

## 📚 Learn More

- **[README.md](./README.md)** - Full project overview
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Detailed development guide
- **[PLAN.md](./PLAN.md)** - MVP plan and roadmap

---

## 🤝 Get Help

- 💬 GitHub Discussions for questions
- 🐛 GitHub Issues for bugs
- 📧 Email: support@lexara.com

---

**Ready to build? Let's go! 🚀**
